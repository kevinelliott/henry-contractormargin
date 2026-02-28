import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function checkAdminKey(request: NextRequest) {
  const key = request.headers.get('x-admin-key')
  return key === process.env.ADMIN_API_KEY && !!process.env.ADMIN_API_KEY
}

export async function GET(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Placeholder MCP usage stats - would be backed by a mcp_call_logs table
  return NextResponse.json({
    mcp_usage: {
      total_calls: 0,
      calls_today: 0,
      calls_this_week: 0,
      by_tool: {
        get_stats: 0,
        create_job: 0,
        add_labor: 0,
        add_material: 0,
      },
    },
    note: 'Add logging middleware to /api/mcp to track usage',
  })
}
