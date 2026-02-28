'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { computeJobMargin, marginBadgeClass, marginColor } from '@/lib/compute'
import type { Job, LaborEntry, MaterialEntry, JobWithMargin } from '@/lib/types'

export default function ReportsPage() {
  const [allJobs, setAllJobs] = useState<JobWithMargin[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [jobsRes, laborRes, matRes] = await Promise.all([
      supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('labor_entries').select('*').eq('user_id', user.id),
      supabase.from('material_entries').select('*').eq('user_id', user.id),
    ])

    const jobs = (jobsRes.data as Job[]) || []
    const labor = (laborRes.data as LaborEntry[]) || []
    const materials = (matRes.data as MaterialEntry[]) || []

    const computed = jobs.map((job) => {
      const jobLabor = labor.filter((l) => l.job_id === job.id)
      const jobMaterials = materials.filter((m) => m.job_id === job.id)
      return computeJobMargin(job, jobLabor, jobMaterials)
    })

    setAllJobs(computed)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter jobs for selected month
  const monthJobs = allJobs.filter((job) => {
    const jobMonth = job.created_at.slice(0, 7)
    return jobMonth === selectedMonth
  })

  const totalRevenue = monthJobs.reduce(
    (s, j) => s + (j.actual_revenue || j.estimated_revenue),
    0
  )
  const totalCosts = monthJobs.reduce((s, j) => s + j.total_cost, 0)
  const totalProfit = totalRevenue - totalCosts
  const avgMargin =
    monthJobs.length > 0
      ? monthJobs.reduce((s, j) => s + j.margin, 0) / monthJobs.length
      : 0

  const sortedByMargin = [...monthJobs].sort((a, b) => b.margin - a.margin)
  const bestJob = sortedByMargin[0]
  const worstJob = sortedByMargin[sortedByMargin.length - 1]

  // Generate last 12 months for selector
  const months: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly P&amp;L Report</h1>
          <p className="mt-1 text-sm text-gray-500">Revenue, costs, and margins by month.</p>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-500">Loading reports...</div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Revenue
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                ${totalRevenue.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-gray-500">{monthJobs.length} jobs</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Costs
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                ${totalCosts.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-gray-500">Labor + Materials</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Gross Profit
              </div>
              <div
                className={`mt-2 text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                ${totalProfit.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Avg Margin
              </div>
              <div className={`mt-2 text-2xl font-bold ${marginColor(avgMargin)}`}>
                {monthJobs.length > 0 ? `${avgMargin.toFixed(1)}%` : '—'}
              </div>
            </div>
          </div>

          {/* Best / Worst */}
          {monthJobs.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {bestJob && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                    Best Margin Job
                  </div>
                  <div className="font-semibold text-gray-900">{bestJob.name}</div>
                  <div className="mt-1 text-sm text-gray-600">{bestJob.client_name}</div>
                  <div className={`mt-2 text-2xl font-bold ${marginColor(bestJob.margin)}`}>
                    {bestJob.margin.toFixed(1)}%
                  </div>
                </div>
              )}
              {worstJob && worstJob.id !== bestJob?.id && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                    Worst Margin Job
                  </div>
                  <div className="font-semibold text-gray-900">{worstJob.name}</div>
                  <div className="mt-1 text-sm text-gray-600">{worstJob.client_name}</div>
                  <div className={`mt-2 text-2xl font-bold ${marginColor(worstJob.margin)}`}>
                    {worstJob.margin.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Jobs Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Jobs This Month</h2>
            </div>
            {monthJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Job
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Labor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Materials
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Profit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedByMargin.map((job) => {
                      const revenue = job.actual_revenue || job.estimated_revenue
                      const profit = revenue - job.total_cost
                      return (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{job.name}</div>
                            <div className="text-xs text-gray-500">{job.client_name}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ${job.total_labor_cost.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ${job.total_material_cost.toLocaleString()}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            ${profit.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${marginBadgeClass(job.margin)}`}
                            >
                              {job.margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="border-t border-gray-200 bg-gray-50">
                    <tr>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">Totals</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        ${totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        ${monthJobs.reduce((s, j) => s + j.total_labor_cost, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        ${monthJobs.reduce((s, j) => s + j.total_material_cost, 0).toLocaleString()}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        ${totalProfit.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${marginBadgeClass(avgMargin)}`}
                        >
                          {avgMargin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No jobs found for this month.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
