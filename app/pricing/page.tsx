import Link from 'next/link'

const tiers = [
  {
    name: 'Starter',
    price: '$9',
    period: '/mo',
    description: 'Perfect for solo contractors just getting started.',
    features: [
      'Up to 5 active jobs',
      'All core features',
      'Labor & material tracking',
      'Real-time margin display',
      'Email support',
    ],
    cta: 'Start for free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For growing contractors who need unlimited tracking.',
    features: [
      'Unlimited active jobs',
      'All Starter features',
      'CSV export',
      'Monthly P&L reports',
      'Priority support',
      'API access',
    ],
    cta: 'Start Pro trial',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$79',
    period: '/mo',
    description: 'For teams that need shared visibility across all jobs.',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Team dashboard',
      'Shared job tracking',
      'Admin controls',
      'Dedicated support',
    ],
    cta: 'Start Team trial',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <main className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            Pricing
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Simple pricing. <span className="text-indigo-600">No surprises.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            One flat monthly fee. No per-job fees, no per-user fees. Cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                tier.highlight
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl'
                  : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              {tier.highlight && (
                <div className="mb-4 inline-flex self-start rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Most Popular
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{tier.name}</h2>
                <p className={`mt-2 text-sm ${tier.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {tier.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  <span className={`text-lg ${tier.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {tier.period}
                  </span>
                </div>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className={`mt-0.5 text-base ${tier.highlight ? 'text-indigo-200' : 'text-indigo-600'}`}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                className={`mt-10 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${
                  tier.highlight
                    ? 'bg-white text-indigo-600 hover:bg-gray-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently asked questions
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                q: 'Is there a free trial?',
                a: 'Yes — all plans include a 14-day free trial. No credit card required to get started.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. Cancel at any time from your billing settings. No cancellation fees.',
              },
              {
                q: 'What counts as an active job?',
                a: 'An active job is one with status set to "active." Completed and invoiced jobs don\'t count against your limit.',
              },
              {
                q: 'Do you integrate with QuickBooks?',
                a: 'Not yet — we keep it simple and focused. Export to CSV and import into any accounting software.',
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-2xl bg-indigo-50 p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to know your margin on every job?
          </h2>
          <p className="mt-3 text-gray-600">Join contractors who stopped guessing about profit.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </main>
  )
}
