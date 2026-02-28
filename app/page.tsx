import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            Built for HVAC, Plumbing &amp; Electrical Contractors
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Stop finding out a job lost
            <br />
            <span className="text-indigo-600">money 3 months later.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Track labor, materials, and margin on every job — in real time. Built for HVAC,
            plumbing, and electrical contractors who want to know if they&apos;re making money
            before the job is done.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/login"
              className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Start Tracking Free
            </Link>
            <Link
              href="/features"
              className="rounded-lg border border-gray-200 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Stats preview */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">43%</div>
            <div className="mt-1 text-sm text-gray-500">Avg margin on tracked jobs</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-red-600">1 in 4</div>
            <div className="mt-1 text-sm text-gray-500">Jobs fall below 20% margin</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-indigo-600">$9/mo</div>
            <div className="mt-1 text-sm text-gray-500">vs $200+/mo for competitors</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to run{' '}
              <span className="text-indigo-600">profitable jobs</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No complex setup. No enterprise bloat. Just the numbers that matter.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-2xl">
                📊
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Real-Time Margin Tracking
              </h3>
              <p className="mt-2 text-gray-600">
                See margin % update as you log labor and materials. Know your profit before you
                send the invoice, not after.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-2xl">
                🚨
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Margin Danger Alerts</h3>
              <p className="mt-2 text-gray-600">
                Jobs trending below 20% get flagged automatically. Catch cost overruns while
                you still have time to fix them.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-2xl">
                🎯
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Estimate vs Actual</h3>
              <p className="mt-2 text-gray-600">
                Know instantly if a job is running over budget. Track estimate accuracy across
                all your jobs to bid better next time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple, honest pricing</h2>
            <p className="mt-4 text-lg text-gray-600">
              No contracts. No per-user fees. Cancel anytime.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '$9',
                period: '/mo',
                features: ['Up to 5 active jobs', 'All core features', 'Email support'],
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/mo',
                features: ['Unlimited jobs', 'CSV export', 'Priority support'],
                highlight: true,
              },
              {
                name: 'Team',
                price: '$79',
                period: '/mo',
                features: ['Everything in Pro', 'Up to 5 users', 'Team dashboard'],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.highlight
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                    : 'border-gray-200 bg-white shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <div className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Most Popular
                  </div>
                )}
                <div className="text-2xl font-bold">{plan.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlight ? 'text-indigo-200' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/login"
                  className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
                    plan.highlight
                      ? 'bg-white text-indigo-600 hover:bg-gray-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <blockquote className="text-xl font-medium text-gray-900">
            &ldquo;ServiceTitan charges $200+/mo for job costing buried in menus. We charge $29
            and do one thing well.&rdquo;
          </blockquote>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Start free — no credit card required
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span>📐</span> ContractorMargin
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/features" className="hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/docs" className="hover:text-gray-900">
                Docs
              </Link>
              <Link href="/auth/login" className="hover:text-gray-900">
                Login
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-400">
            © 2025 ContractorMargin. Built for contractors who care about margin.
          </div>
        </div>
      </footer>
    </main>
  )
}
