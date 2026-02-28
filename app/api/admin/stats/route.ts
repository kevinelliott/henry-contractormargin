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

  const [profilesRes, jobsRes, laborRes, matRes] = await Promise.all([
    supabase.from('profiles').select('trade', { count: 'exact' }),
    supabase.from('jobs').select('status, job_type, estimated_revenue, actual_revenue'),
    supabase.from('labor_entries').select('hours, hourly_rate', { count: 'exact' }),
    supabase.from('material_entries').select('cost', { count: 'exact' }),
  ])

  const jobs = jobsRes.data || []
  const totalRevenue = jobs.reduce(
    (s, j) => s + (j.actual_revenue || j.estimated_revenue || 0),
    0
  )

  const tradeBreakdown = ((profilesRes.data || []) as { trade: string }[]).reduce(
    (acc: Record<string, number>, p) => {
      acc[p.trade] = (acc[p.trade] || 0) + 1
      return acc
    },
    {}
  )

  return NextResponse.json({
    users: {
      total: profilesRes.count || 0,
      by_trade: tradeBreakdown,
    },
    jobs: {
      total: jobs.length,
      active: jobs.filter((j) => j.status === 'active').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      invoiced: jobs.filter((j) => j.status === 'invoiced').length,
      residential: jobs.filter((j) => j.job_type === 'residential').length,
      commercial: jobs.filter((j) => j.job_type === 'commercial').length,
      total_revenue: totalRevenue,
    },
    entries: {
      labor_count: laborRes.count || 0,
      material_count: matRes.count || 0,
    },
  })
}
