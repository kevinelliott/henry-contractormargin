import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function checkAdminKey(request: NextRequest) {
  const key = request.headers.get('x-admin-key')
  return key === process.env.ADMIN_API_KEY && !!process.env.ADMIN_API_KEY
}

export async function GET(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [usersRes, jobsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('jobs').select('id, status', { count: 'exact' }),
  ])

  const totalUsers = usersRes.count || 0
  const jobs = jobsRes.data || []
  const totalJobs = jobsRes.count || 0
  const activeJobs = jobs.filter((j) => j.status === 'active').length

  return NextResponse.json({
    demo: false,
    total_users: totalUsers,
    total_jobs: totalJobs,
    active_jobs: activeJobs,
    avg_margin: 34.2, // Placeholder - would compute from all jobs
  })
}
