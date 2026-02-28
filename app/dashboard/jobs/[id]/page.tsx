'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { computeJobMargin, marginColor, marginBadgeClass } from '@/lib/compute'
import type { Job, LaborEntry, MaterialEntry, JobWithMargin, JobStatus } from '@/lib/types'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const supabase = createClient()

  const [job, setJob] = useState<JobWithMargin | null>(null)
  const [labor, setLabor] = useState<LaborEntry[]>([])
  const [materials, setMaterials] = useState<MaterialEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  const [laborForm, setLaborForm] = useState({
    tech_name: '',
    hours: '',
    hourly_rate: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [materialForm, setMaterialForm] = useState({
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [addingLabor, setAddingLabor] = useState(false)
  const [addingMaterial, setAddingMaterial] = useState(false)
  const [showLaborForm, setShowLaborForm] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [jobRes, laborRes, matRes] = await Promise.all([
      supabase.from('jobs').select('*').eq('id', jobId).eq('user_id', user.id).single(),
      supabase.from('labor_entries').select('*').eq('job_id', jobId).order('date'),
      supabase.from('material_entries').select('*').eq('job_id', jobId).order('date'),
    ])

    if (!jobRes.data) {
      router.push('/dashboard/jobs')
      return
    }

    const laborEntries = (laborRes.data as LaborEntry[]) || []
    const materialEntries = (matRes.data as MaterialEntry[]) || []

    setLabor(laborEntries)
    setMaterials(materialEntries)
    setJob(computeJobMargin(jobRes.data as Job, laborEntries, materialEntries))
    setLoading(false)
  }, [jobId, supabase, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleAddLabor(e: React.FormEvent) {
    e.preventDefault()
    setAddingLabor(true)
    await supabase.from('labor_entries').insert({
      job_id: jobId,
      user_id: userId,
      tech_name: laborForm.tech_name,
      hours: parseFloat(laborForm.hours),
      hourly_rate: parseFloat(laborForm.hourly_rate),
      date: laborForm.date,
    })
    setLaborForm({ tech_name: '', hours: '', hourly_rate: '', date: new Date().toISOString().split('T')[0] })
    setShowLaborForm(false)
    await fetchData()
    setAddingLabor(false)
  }

  async function handleAddMaterial(e: React.FormEvent) {
    e.preventDefault()
    setAddingMaterial(true)
    await supabase.from('material_entries').insert({
      job_id: jobId,
      user_id: userId,
      description: materialForm.description,
      cost: parseFloat(materialForm.cost),
      date: materialForm.date,
    })
    setMaterialForm({ description: '', cost: '', date: new Date().toISOString().split('T')[0] })
    setShowMaterialForm(false)
    await fetchData()
    setAddingMaterial(false)
  }

  async function handleDeleteLabor(id: string) {
    await supabase.from('labor_entries').delete().eq('id', id)
    await fetchData()
  }

  async function handleDeleteMaterial(id: string) {
    await supabase.from('material_entries').delete().eq('id', id)
    await fetchData()
  }

  async function handleStatusChange(status: JobStatus) {
    await supabase
      .from('jobs')
      .update({
        status,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('id', jobId)
    await fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-500">Loading job...</div>
      </div>
    )
  }

  if (!job) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/jobs" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          ← Back to Jobs
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{job.client_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={job.status}
              onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Margin Danger Banner */}
      {job.margin_danger && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-semibold text-amber-800">Margin Danger Alert</div>
              <div className="mt-0.5 text-sm text-amber-700">
                This job is at {job.margin.toFixed(1)}% margin — below the 20% danger threshold.
                Review your costs immediately.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue & Margin Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Est. Revenue
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            ${job.estimated_revenue.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Actual Revenue
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            ${job.actual_revenue > 0 ? job.actual_revenue.toLocaleString() : '—'}
          </div>
          {job.estimated_revenue > 0 && job.actual_revenue > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              {job.estimate_accuracy.toFixed(0)}% of estimate
            </div>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total Costs
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            ${job.total_cost.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Labor: ${job.total_labor_cost.toLocaleString()} · Materials: $
            {job.total_material_cost.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Live Margin
          </div>
          <div className={`mt-2 text-4xl font-bold ${marginColor(job.margin)}`}>
            {job.margin.toFixed(1)}%
          </div>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${marginBadgeClass(job.margin)}`}
          >
            {job.margin >= 30 ? 'Healthy' : job.margin >= 20 ? 'Acceptable' : 'Danger'}
          </span>
        </div>
      </div>

      {/* Labor Entries */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Labor Entries</h2>
            <p className="text-xs text-gray-500">
              Total: ${job.total_labor_cost.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setShowLaborForm(!showLaborForm)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            + Add Labor
          </button>
        </div>

        {showLaborForm && (
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <form onSubmit={handleAddLabor} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Tech Name</label>
                <input
                  required
                  value={laborForm.tech_name}
                  onChange={(e) => setLaborForm({ ...laborForm, tech_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Tom Bradley"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Hours</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.5"
                  value={laborForm.hours}
                  onChange={(e) => setLaborForm({ ...laborForm, hours: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Rate ($/hr)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={laborForm.hourly_rate}
                  onChange={(e) => setLaborForm({ ...laborForm, hourly_rate: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="65"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Date</label>
                <input
                  required
                  type="date"
                  value={laborForm.date}
                  onChange={(e) => setLaborForm({ ...laborForm, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2 flex gap-2 sm:col-span-4">
                <button
                  type="submit"
                  disabled={addingLabor}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {addingLabor ? 'Saving...' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLaborForm(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tech
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {labor.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{entry.tech_name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{entry.hours}h</td>
                  <td className="px-6 py-3 text-sm text-gray-600">${entry.hourly_rate}/hr</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    ${(entry.hours * entry.hourly_rate).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{entry.date}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDeleteLabor(entry.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {labor.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No labor entries yet. Add the first one above.
            </div>
          )}
        </div>
      </div>

      {/* Material Entries */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Material Entries</h2>
            <p className="text-xs text-gray-500">
              Total: ${job.total_material_cost.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setShowMaterialForm(!showMaterialForm)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            + Add Material
          </button>
        </div>

        {showMaterialForm && (
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <form onSubmit={handleAddMaterial} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
                <input
                  required
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Carrier 3-ton AC unit"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Cost ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialForm.cost}
                  onChange={(e) => setMaterialForm({ ...materialForm, cost: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="1200.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Date</label>
                <input
                  required
                  type="date"
                  value={materialForm.date}
                  onChange={(e) => setMaterialForm({ ...materialForm, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 sm:col-span-3">
                <button
                  type="submit"
                  disabled={addingMaterial}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {addingMaterial ? 'Saving...' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMaterialForm(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {entry.description}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    ${entry.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{entry.date}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDeleteMaterial(entry.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {materials.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No material entries yet. Add the first one above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
