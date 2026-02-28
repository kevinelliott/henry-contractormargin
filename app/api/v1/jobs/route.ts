import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { computeJobMargin } from '@/lib/compute'
import type { Job, LaborEntry, MaterialEntry, JobType, JobStatus } from '@/lib/types'

async function getSupabaseUser(request: NextRequest) {
  void request
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* server component */ }
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return { user, supabase }
}

export async function GET(request: NextRequest) {
  const { user, supabase } = await getSupabaseUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [jobsRes, laborRes, matRes] = await Promise.all([
    supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('labor_entries').select('*').eq('user_id', user.id),
    supabase.from('material_entries').select('*').eq('user_id', user.id),
  ])

  const jobs = (jobsRes.data as Job[]) || []
  const labor = (laborRes.data as LaborEntry[]) || []
  const materials = (matRes.data as MaterialEntry[]) || []

  const jobsWithMargin = jobs.map((job) => {
    const jobLabor = labor.filter((l) => l.job_id === job.id)
    const jobMaterials = materials.filter((m) => m.job_id === job.id)
    return computeJobMargin(job, jobLabor, jobMaterials)
  })

  return NextResponse.json({ jobs: jobsWithMargin })
}

export async function POST(request: NextRequest) {
  const { user, supabase } = await getSupabaseUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    name: string
    client_name?: string
    job_type?: JobType
    status?: JobStatus
    estimated_revenue?: number
    actual_revenue?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      user_id: user.id,
      name: body.name,
      client_name: body.client_name || '',
      job_type: body.job_type || 'residential',
      status: body.status || 'active',
      estimated_revenue: body.estimated_revenue || 0,
      actual_revenue: body.actual_revenue || 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ job: data }, { status: 201 })
}
