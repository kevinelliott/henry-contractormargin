import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  async function handleSignOut() {
    'use server'
    const { createClient: createServerClient } = await import('@/lib/supabase-server')
    const supabase = await createServerClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-gray-100 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <Link href="/" className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span>📐</span>
            <span>ContractorMargin</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base">📊</span>
            Dashboard
          </Link>
          <Link
            href="/dashboard/jobs"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base">🔧</span>
            Jobs
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base">📈</span>
            Reports
          </Link>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <Link
              href="/pricing"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="text-base">⭐</span>
              Upgrade Plan
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="text-base">📄</span>
              API Docs
            </Link>
          </div>
        </nav>
        <div className="border-t border-gray-100 p-4">
          <div className="mb-2 truncate px-2 text-xs text-gray-500">{user.email}</div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span>📐</span> ContractorMargin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-gray-600">
              Home
            </Link>
            <Link href="/dashboard/jobs" className="text-xs text-gray-600">
              Jobs
            </Link>
            <Link href="/dashboard/reports" className="text-xs text-gray-600">
              Reports
            </Link>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
