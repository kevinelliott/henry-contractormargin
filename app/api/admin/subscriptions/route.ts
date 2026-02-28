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

  // Placeholder subscription data - would be backed by Stripe webhook events
  // stored in a subscriptions table
  return NextResponse.json({
    subscriptions: {
      starter: { count: 0, mrr: 0 },
      pro: { count: 0, mrr: 0 },
      team: { count: 0, mrr: 0 },
    },
    total_mrr: 0,
    note: 'Connect Stripe webhook to populate subscription data',
  })
}
