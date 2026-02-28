import Link from 'next/link'

export default function FeaturesPage() {
  return (
    <main className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            Features
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Built for contractors,{' '}
            <span className="text-indigo-600">not accountants.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            Every feature exists to answer one question: is this job making money?
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Big feature */}
          <div className="col-span-1 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:col-span-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-3xl">
              📊
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Real-Time Margin Display</h2>
            <p className="mt-2 text-gray-600">
              As you log each labor entry and material purchase, the margin percentage updates
              instantly. No waiting for end-of-month reconciliation. If a job is trending bad,
              you&apos;ll know while you still have time to act — not after you&apos;ve already lost money.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                43.2% margin ✓
              </div>
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                12.1% — DANGER
              </div>
            </div>
          </div>

          {/* Danger alerts */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-3xl">
              🚨
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">Margin Danger Alerts</h2>
            <p className="mt-2 text-sm text-gray-600">
              Any job below 20% margin gets flagged automatically. The dashboard shows your
              danger jobs front and center so nothing slips through.
            </p>
          </div>

          {/* Labor tracking */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl">
              👷
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">Labor Time Tracking</h2>
            <p className="mt-2 text-sm text-gray-600">
              Log hours per tech per job. Set different rates for different techs. Your true
              labor cost is always calculated correctly.
            </p>
          </div>

          {/* Materials */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-50 text-3xl">
              🔧
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">Material Cost Tracking</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add material costs as you go. Itemize every part and supply so you know exactly
              where the money is going on each job.
            </p>
          </div>

          {/* Estimate vs actual - big */}
          <div className="col-span-1 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:col-span-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-3xl">
              🎯
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Estimate vs. Actual</h2>
            <p className="mt-2 text-gray-600">
              Track how well your estimates hold up against reality. See estimate accuracy
              across all jobs. Over time, you&apos;ll bid more accurately and stop leaving money on
              the table — or losing it on underestimates.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-100 p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimated</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">$3,200</div>
              </div>
              <div className="rounded-lg border border-gray-100 p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actual Revenue</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">$3,100</div>
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-3xl">
              📈
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">Monthly P&amp;L Reports</h2>
            <p className="mt-2 text-sm text-gray-600">
              See your best and worst jobs by margin each month. Know exactly what your
              business made after labor and materials.
            </p>
          </div>

          {/* Job types */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-3xl">
              🏠
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">Residential &amp; Commercial</h2>
            <p className="mt-2 text-sm text-gray-600">
              Track residential and commercial jobs separately. Filter your dashboard by job
              type to see where your margins are best.
            </p>
          </div>

          {/* API */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-3xl">
              ⚡
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">API &amp; MCP Access</h2>
            <p className="mt-2 text-sm text-gray-600">
              Integrate with your own tools via REST API. MCP support lets you query your job
              data from AI assistants directly.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/auth/login"
            className="inline-block rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
          >
            Start Tracking Free
          </Link>
          <p className="mt-3 text-sm text-gray-500">14-day free trial. No credit card required.</p>
        </div>
      </div>
    </main>
  )
}
