import { Job, LaborEntry, MaterialEntry, JobWithMargin } from './types'

export function computeJobMargin(
  job: Job,
  labor: LaborEntry[],
  materials: MaterialEntry[]
): JobWithMargin {
  const total_labor_cost = labor.reduce((s, e) => s + e.hours * e.hourly_rate, 0)
  const total_material_cost = materials.reduce((s, e) => s + e.cost, 0)
  const total_cost = total_labor_cost + total_material_cost
  const revenue = job.actual_revenue || job.estimated_revenue
  const margin = revenue > 0 ? ((revenue - total_cost) / revenue) * 100 : 0
  const margin_danger = margin < 20
  const estimate_accuracy =
    job.estimated_revenue > 0 ? (job.actual_revenue / job.estimated_revenue) * 100 : 0
  return {
    ...job,
    total_labor_cost,
    total_material_cost,
    total_cost,
    margin,
    margin_danger,
    estimate_accuracy,
  }
}

export function marginColor(margin: number): string {
  if (margin >= 30) return 'text-green-600'
  if (margin >= 20) return 'text-yellow-600'
  return 'text-red-600'
}

export function marginBadgeClass(margin: number): string {
  if (margin >= 30) return 'bg-green-50 text-green-700'
  if (margin >= 20) return 'bg-yellow-50 text-yellow-700'
  return 'bg-red-50 text-red-700'
}
