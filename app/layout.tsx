import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ContractorMargin — Job Profitability Tracking',
  description:
    'Track labor, materials, and margin on every job — in real time. Built for HVAC, plumbing, and electrical contractors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <nav className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span>📐</span>
                <span>ContractorMargin</span>
              </Link>
              <div className="hidden items-center gap-6 md:flex">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/dashboard/jobs" className="text-sm text-gray-600 hover:text-gray-900">
                  Jobs
                </Link>
                <Link href="/dashboard/reports" className="text-sm text-gray-600 hover:text-gray-900">
                  Reports
                </Link>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </div>
              {/* Mobile menu */}
              <div className="flex items-center gap-4 md:hidden">
                <Link href="/pricing" className="text-sm text-gray-600">
                  Pricing
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
