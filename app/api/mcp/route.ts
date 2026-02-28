import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { computeJobMargin } from '@/lib/compute'
import type { Job, LaborEntry, MaterialEntry, JobType } from '@/lib/types'

const MCP_TOOLS = [
  {
    name: 'get_stats',
    description: 'Get aggregated job margin statistics for the authenticated contractor account.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_job',
    description: 'Create a new job for tracking labor and material costs.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Job name/description' },
        client_name: { type: 'string', description: 'Client name' },
        job_type: { type: 'string', enum: ['residential', 'commercial'], description: 'Type of job' },
        estimated_revenue: { type: 'number', description: 'Estimated revenue in dollars' },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_labor',
    description: 'Add a labor entry to a job.',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: { type: 'string', description: 'Job UUID' },
        tech_name: { type: 'string', description: 'Technician name' },
        hours: { type: 'number', description: 'Hours worked' },
        hourly_rate: { type: 'number', description: 'Hourly rate in dollars' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
      },
      required: ['job_id', 'tech_name', 'hours', 'hourly_rate'],
    },
  },
  {
    name: 'add_material',
    description: 'Add a material cost entry to a job.',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: { type: 'string', description: 'Job UUID' },
        description: { type: 'string', description: 'Material description' },
        cost: { type: 'number', description: 'Material cost in dollars' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
      },
      required: ['job_id', 'description', 'cost'],
    },
  },
]

async function getSupabaseUser() {
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

function mcpError(id: string | number | null, code: number, message: string) {
  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code, message },
  })
}

export async function POST(request: NextRequest) {
  let body: { jsonrpc?: string; method?: string; id?: string | number | null; params?: Record<string, unknown> }

  try {
    body = await request.json()
  } catch {
    return mcpError(null, -32700, 'Parse error')
  }

  const { method, id, params } = body

  // Handle initialize
  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'contractormargin-mcp', version: '1.0.0' },
      },
    })
  }

  // Handle tools/list
  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: { tools: MCP_TOOLS },
    })
  }

  // Handle tools/call
  if (method === 'tools/call') {
    const toolName = (params?.name as string) || ''
    const args = (params?.arguments as Record<string, unknown>) || {}

    const { user, supabase } = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: 'Authentication required. Please log in.' }],
          isError: true,
        },
      })
    }

    try {
      if (toolName === 'get_stats') {
        const [jobsRes, laborRes, matRes] = await Promise.all([
          supabase.from('jobs').select('*').eq('user_id', user.id),
          supabase.from('labor_entries').select('*').eq('user_id', user.id),
          supabase.from('material_entries').select('*').eq('user_id', user.id),
        ])

        const jobs = (jobsRes.data as Job[]) || []
        const labor = (laborRes.data as LaborEntry[]) || []
        const materials = (matRes.data as MaterialEntry[]) || []

        const jobsWithMargin = jobs.map((job) =>
          computeJobMargin(
            job,
            labor.filter((l) => l.job_id === job.id),
            materials.filter((m) => m.job_id === job.id)
          )
        )

        const avgMargin =
          jobsWithMargin.length > 0
            ? jobsWithMargin.reduce((s, j) => s + j.margin, 0) / jobsWithMargin.length
            : 0

        const stats = {
          avg_margin: Math.round(avgMargin * 10) / 10,
          active_jobs: jobsWithMargin.filter((j) => j.status === 'active').length,
          flagged_jobs: jobsWithMargin.filter((j) => j.margin_danger).length,
          total_jobs: jobs.length,
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
          },
        })
      }

      if (toolName === 'create_job') {
        const { data, error } = await supabase
          .from('jobs')
          .insert({
            user_id: user.id,
            name: args.name as string,
            client_name: (args.client_name as string) || '',
            job_type: (args.job_type as JobType) || 'residential',
            estimated_revenue: (args.estimated_revenue as number) || 0,
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Job created: ${data.name} (ID: ${data.id})`,
              },
            ],
          },
        })
      }

      if (toolName === 'add_labor') {
        const { error } = await supabase.from('labor_entries').insert({
          job_id: args.job_id as string,
          user_id: user.id,
          tech_name: args.tech_name as string,
          hours: args.hours as number,
          hourly_rate: args.hourly_rate as number,
          date: (args.date as string) || new Date().toISOString().split('T')[0],
        })

        if (error) throw error

        const cost = (args.hours as number) * (args.hourly_rate as number)
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Labor added: ${args.tech_name}, ${args.hours}h @ $${args.hourly_rate}/hr = $${cost.toFixed(2)}`,
              },
            ],
          },
        })
      }

      if (toolName === 'add_material') {
        const { error } = await supabase.from('material_entries').insert({
          job_id: args.job_id as string,
          user_id: user.id,
          description: args.description as string,
          cost: args.cost as number,
          date: (args.date as string) || new Date().toISOString().split('T')[0],
        })

        if (error) throw error

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Material added: ${args.description} — $${args.cost}`,
              },
            ],
          },
        })
      }

      return mcpError(id ?? null, -32601, `Tool not found: ${toolName}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        },
      })
    }
  }

  return mcpError(id ?? null, -32601, `Method not found: ${method}`)
}
