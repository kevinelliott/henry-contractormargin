'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { computeJobMargin, marginBadgeClass } from '@/lib/compute'
import type { Job, LaborEntry, MaterialEntry, JobWithMargin, JobStatus, JobType } from '@/lib/types'

type StatusFilter = 'all' | JobStatus

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithMargin[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    client_name: '',
    job_type: 'residential' as JobType,
    status: 'active' as JobStatus,
    estimated_revenue: '',
    actual_revenue: '',
  })

  const supabase = createClient()

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const { data: laborData } = await supabase
      .from('labor_entries')
      .select('*')
      .eq('user_id', user.id)

    const { data: materialsData } = await supabase
      .from('material_entries')
      .select('*')
      .eq('user_id', user.id)

    const computed = (jobsData || []).map((job: Job) => {
      const jobLabor = ((laborData as LaborEntry[]) || []).filter((l) => l.job_id === job.id)
      const jobMaterials = ((materialsData as MaterialEntry[]) || []).filter(
        (m) => m.job_id === job.id
      )
      return computeJobMargin(job, jobLabor, jobMaterials)
    })

    setJobs(computed)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('jobs').insert({
      user_id: user.id,
      name: form.name,
      client_name: form.client_name,
      job_type: form.job_type,
      status: form.status,
      estimated_revenue: parseFloat(form.estimated_revenue) || 0,
      actual_revenue: parseFloat(form.actual_revenue) || 0,
    })

    setForm({
      name: '',
      client_name: '',
      job_type: 'residential',
      status: 'active',
      estimated_revenue: '',
      actual_revenue: '',
    })
    setShowAddForm(false)
    await fetchJobs()
    setSubmitting(false)
  }

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  const statusCounts = {
    all: jobs.length,
    active: jobs.filter((j) => j.status === 'active').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    invoiced: jobs.filter((j) => j.status === 'invoiced').length,
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">Track margins across all your jobs.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Job
        </button>
      </div>

      {/* Add Job Form */}
      {showAddForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">New Job</h2>
          <form onSubmit={handleAddJob} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Job Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="AC Install - Smith"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Client Name</label>
              <input
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Job Type</label>
              <select
                value={form.job_type}
                onChange={(e) => setForm({ ...form, job_type: e.target.value as JobType })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="invoiced">Invoiced</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Estimated Revenue ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.estimated_revenue}
                onChange={(e) => setForm({ ...form, estimated_revenue: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Actual Revenue ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.actual_revenue}
                onChange={(e) => setForm({ ...form, actual_revenue: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 flex items-center gap-1">
        {(['all', 'active', 'completed', 'invoiced'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">Loading jobs...</div>
        ) : (
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Costs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Margin
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {job.margin_danger && (
                          <span
                            className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500"
                            title="Margin danger"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900">{job.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{job.client_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700">
                        {job.job_type}
                      </span>
                    </td>
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ${job.total_cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${marginBadgeClass(job.margin)}`}
                      >
                        {job.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  {filter === 'all' ? 'No jobs yet.' : `No ${filter} jobs.`}
                </p>
                {filter === 'all' && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Add your first job →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
