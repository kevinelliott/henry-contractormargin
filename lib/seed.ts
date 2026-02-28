import { SupabaseClient } from '@supabase/supabase-js'

export async function seedUserData(userId: string, supabase: SupabaseClient) {
  // Create 5 realistic jobs for an HVAC contractor
  const jobs = [
    {
      user_id: userId,
      name: 'Residential AC Install - Johnson',
      client_name: 'Mike Johnson',
      job_type: 'residential',
      status: 'completed',
      estimated_revenue: 3200,
      actual_revenue: 3100,
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      name: 'Commercial HVAC - Riverside Office',
      client_name: 'Riverside Properties LLC',
      job_type: 'commercial',
      status: 'active',
      estimated_revenue: 12000,
      actual_revenue: 11500,
    },
    {
      user_id: userId,
      name: 'Heat Pump Replacement - Martinez',
      client_name: 'Rosa Martinez',
      job_type: 'residential',
      status: 'active',
      estimated_revenue: 4500,
      actual_revenue: 4200,
    },
    {
      user_id: userId,
      name: 'Ductwork Repair - Williams',
      client_name: 'David Williams',
      job_type: 'residential',
      status: 'completed',
      estimated_revenue: 2800,
      actual_revenue: 2600,
      completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      name: 'Commercial Install - Tech Park',
      client_name: 'Tech Park Development',
      job_type: 'commercial',
      status: 'invoiced',
      estimated_revenue: 18000,
      actual_revenue: 17500,
    },
  ]

  const { data: insertedJobs, error: jobsError } = await supabase
    .from('jobs')
    .insert(jobs)
    .select()

  if (jobsError || !insertedJobs) return

  const laborEntries = []
  const materialEntries = []

  // Job 1: Residential AC Install - Johnson (good margin ~38%)
  const job1 = insertedJobs[0]
  laborEntries.push(
    { job_id: job1.id, user_id: userId, tech_name: 'Tom Bradley', hours: 6, hourly_rate: 65, date: '2025-02-10' },
    { job_id: job1.id, user_id: userId, tech_name: 'Jake Lee', hours: 4, hourly_rate: 55, date: '2025-02-10' }
  )
  materialEntries.push(
    { job_id: job1.id, user_id: userId, description: 'Carrier 3-ton AC Unit', cost: 1100, date: '2025-02-10' },
    { job_id: job1.id, user_id: userId, description: 'Copper lineset 25ft', cost: 145, date: '2025-02-10' },
    { job_id: job1.id, user_id: userId, description: 'Misc fittings & supplies', cost: 55, date: '2025-02-10' }
  )

  // Job 2: Commercial HVAC - Riverside Office (healthy margin ~42%)
  const job2 = insertedJobs[1]
  laborEntries.push(
    { job_id: job2.id, user_id: userId, tech_name: 'Tom Bradley', hours: 16, hourly_rate: 75, date: '2025-02-15' },
    { job_id: job2.id, user_id: userId, tech_name: 'Jake Lee', hours: 14, hourly_rate: 65, date: '2025-02-15' },
    { job_id: job2.id, user_id: userId, tech_name: 'Maria Santos', hours: 10, hourly_rate: 60, date: '2025-02-16' }
  )
  materialEntries.push(
    { job_id: job2.id, user_id: userId, description: 'Commercial RTU 10-ton', cost: 3800, date: '2025-02-15' },
    { job_id: job2.id, user_id: userId, description: 'Ductwork materials', cost: 950, date: '2025-02-15' },
    { job_id: job2.id, user_id: userId, description: 'Controls & thermostat', cost: 420, date: '2025-02-16' }
  )

  // Job 3: Heat Pump Replacement - Martinez (good margin ~35%)
  const job3 = insertedJobs[2]
  laborEntries.push(
    { job_id: job3.id, user_id: userId, tech_name: 'Tom Bradley', hours: 8, hourly_rate: 70, date: '2025-02-18' },
    { job_id: job3.id, user_id: userId, tech_name: 'Jake Lee', hours: 6, hourly_rate: 60, date: '2025-02-18' }
  )
  materialEntries.push(
    { job_id: job3.id, user_id: userId, description: 'Trane heat pump system', cost: 1650, date: '2025-02-18' },
    { job_id: job3.id, user_id: userId, description: 'Air handler', cost: 480, date: '2025-02-18' },
    { job_id: job3.id, user_id: userId, description: 'Installation supplies', cost: 95, date: '2025-02-18' }
  )

  // Job 4: Ductwork Repair - Williams (DANGER: margin ~12% due to high labor overrun)
  const job4 = insertedJobs[3]
  laborEntries.push(
    { job_id: job4.id, user_id: userId, tech_name: 'Tom Bradley', hours: 14, hourly_rate: 75, date: '2025-02-20' },
    { job_id: job4.id, user_id: userId, tech_name: 'Jake Lee', hours: 12, hourly_rate: 65, date: '2025-02-20' },
    { job_id: job4.id, user_id: userId, tech_name: 'Maria Santos', hours: 8, hourly_rate: 60, date: '2025-02-21' }
  )
  materialEntries.push(
    { job_id: job4.id, user_id: userId, description: 'Sheet metal ductwork', cost: 320, date: '2025-02-20' },
    { job_id: job4.id, user_id: userId, description: 'Insulation wrap', cost: 85, date: '2025-02-20' },
    { job_id: job4.id, user_id: userId, description: 'Mastic sealant & tape', cost: 45, date: '2025-02-21' }
  )

  // Job 5: Commercial Install - Tech Park (great margin ~47%)
  const job5 = insertedJobs[4]
  laborEntries.push(
    { job_id: job5.id, user_id: userId, tech_name: 'Tom Bradley', hours: 24, hourly_rate: 80, date: '2025-02-05' },
    { job_id: job5.id, user_id: userId, tech_name: 'Jake Lee', hours: 20, hourly_rate: 70, date: '2025-02-05' },
    { job_id: job5.id, user_id: userId, tech_name: 'Maria Santos', hours: 16, hourly_rate: 65, date: '2025-02-06' }
  )
  materialEntries.push(
    { job_id: job5.id, user_id: userId, description: 'Two 15-ton RTU units', cost: 7800, date: '2025-02-05' },
    { job_id: job5.id, user_id: userId, description: 'BAS controls system', cost: 1200, date: '2025-02-05' },
    { job_id: job5.id, user_id: userId, description: 'Ductwork & accessories', cost: 680, date: '2025-02-06' }
  )

  await supabase.from('labor_entries').insert(laborEntries)
  await supabase.from('material_entries').insert(materialEntries)
}
