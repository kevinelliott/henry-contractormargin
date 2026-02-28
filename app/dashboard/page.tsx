import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { computeJobMargin, marginBadgeClass, marginColor } from '@/lib/compute'
import { seedUserData } from '@/lib/seed'
import type { LaborEntry, MaterialEntry } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Seed data if no jobs exist yet
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count === 0) {
    await seedUserData(user.id, supabase)
  }

  // Fetch all jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: allLabor } = await supabase
    .from('labor_entries')
    .select('*')
    .eq('user_id', user.id)

  const { data: allMaterials } = await supabase
    .from('material_entries')
    .select('*')
    .eq('user_id', user.id)

  const jobsData = jobs || []
  const laborData = (allLabor as LaborEntry[]) || []
  const materialsData = (allMaterials as MaterialEntry[]) || []

  const jobsWithMargin = jobsData.map((job) => {
    const jobLabor = laborData.filter((l) => l.job_id === job.id)
    const jobMaterials = materialsData.filter((m) => m.job_id === job.id)
    return computeJobMargin(job, jobLabor, jobMaterials)
  })

  const activeJobs = jobsWithMargin.filter((j) => j.status === 'active')
  const dangerJobs = jobsWithMargin.filter((j) => j.margin_danger)
  const avgMargin =
    jobsWithMargin.length > 0
      ? jobsWithMargin.reduce((s, j) => s + j.margin, 0) / jobsWithMargin.length
      : 0
  const completedJobs = jobsWithMargin.filter(
    (j) => j.status === 'completed' || j.status === 'invoiced'
  )
  const avgAccuracy =
    completedJobs.length > 0
      ? completedJobs.reduce((s, j) => s + j.estimate_accuracy, 0) / completedJobs.length
      : 0
  const totalActiveValue = activeJobs.reduce(
    (s, j) => s + (j.actual_revenue || j.estimated_revenue),
    0
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your job profitability at a glance.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Active Jobs
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{activeJobs.length}</div>
          <div className="mt-1 text-sm text-gray-500">
            ${totalActiveValue.toLocaleString()} total value
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Avg Margin
          </div>
          <div className={`mt-2 text-3xl font-bold ${marginColor(avgMargin)}`}>
            {avgMargin.toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-gray-500">across all jobs</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Danger Jobs
          </div>
          <div
            className={`mt-2 text-3xl font-bold ${dangerJobs.length > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            {dangerJobs.length}
          </div>
          <div className="mt-1 text-sm text-gray-500">below 20% margin</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Est. Accuracy
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {avgAccuracy > 0 ? `${avgAccuracy.toFixed(0)}%` : '—'}
          </div>
          <div className="mt-1 text-sm text-gray-500">avg estimate accuracy</div>
        </div>
      </div>

      {/* Danger Jobs Alert */}
      {dangerJobs.length > 0 && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h2 className="font-semibold text-amber-800">
              {dangerJobs.length} job{dangerJobs.length > 1 ? 's' : ''} below 20% margin
            </h2>
          </div>
          <div className="space-y-2">
            {dangerJobs.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-3 hover:bg-amber-50"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{job.name}</div>
                  <div className="text-xs text-gray-500">{job.client_name}</div>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  {job.margin.toFixed(1)}% margin
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
          <Link
            href="/dashboard/jobs"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobsWithMargin.slice(0, 5).map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {job.margin_danger && <span className="mr-1 text-red-500">●</span>}
                      {job.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{job.client_name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        job.status === 'active'
                          ? 'bg-blue-50 text-blue-700'
                          : job.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${(job.actual_revenue || job.estimated_revenue).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${marginBadgeClass(job.margin)}`}
                    >
                      {job.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobsWithMargin.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No jobs yet.{' '}
              <Link href="/dashboard/jobs" className="text-indigo-600 hover:underline">
                Add your first job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
