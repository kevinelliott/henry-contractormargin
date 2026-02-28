import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { computeJobMargin } from '@/lib/compute'
import type { Job, LaborEntry, MaterialEntry } from '@/lib/types'

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // Token auth - use service role to look up user
    // For now, fall back to cookie auth
  }

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
  const { user, supabase } = await getUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [jobsRes, laborRes, matRes] = await Promise.all([
    supabase.from('jobs').select('*').eq('user_id', user.id),
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

  const activeJobs = jobsWithMargin.filter((j) => j.status === 'active')
  const flaggedJobs = jobsWithMargin.filter((j) => j.margin_danger)
  const avgMargin =
    jobsWithMargin.length > 0
      ? jobsWithMargin.reduce((s, j) => s + j.margin, 0) / jobsWithMargin.length
      : 0

  const completedJobs = jobsWithMargin.filter(
    (j) => (j.status === 'completed' || j.status === 'invoiced') && j.estimated_revenue > 0
  )
  const avgAccuracy =
    completedJobs.length > 0
      ? completedJobs.reduce((s, j) => s + j.estimate_accuracy, 0) / completedJobs.length
      : 0

  return NextResponse.json({
    avg_margin: Math.round(avgMargin * 10) / 10,
    active_jobs: activeJobs.length,
    flagged_jobs: flaggedJobs.length,
    estimate_accuracy: Math.round(avgAccuracy * 10) / 10,
    total_jobs: jobs.length,
  })
}
