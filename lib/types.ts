export type Trade = 'hvac' | 'plumbing' | 'electrical' | 'general'
export type JobType = 'residential' | 'commercial'
export type JobStatus = 'active' | 'completed' | 'invoiced'

export interface Profile {
  id: string
  user_id: string
  business_name: string
  trade: Trade
  created_at: string
}

export interface Job {
  id: string
  user_id: string
  name: string
  client_name: string
  job_type: JobType
  status: JobStatus
  estimated_revenue: number
  actual_revenue: number
  created_at: string
  completed_at?: string
}

export interface LaborEntry {
  id: string
  job_id: string
  user_id: string
  tech_name: string
  hours: number
  hourly_rate: number
  date: string
}

export interface MaterialEntry {
  id: string
  job_id: string
  user_id: string
  description: string
  cost: number
  date: string
}

export interface JobWithMargin extends Job {
  total_labor_cost: number
  total_material_cost: number
  total_cost: number
  margin: number
  margin_danger: boolean
  estimate_accuracy: number
}
