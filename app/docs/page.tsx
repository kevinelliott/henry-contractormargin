export default function DocsPage() {
  return (
    <main className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            API Documentation
          </div>
          <h1 className="text-3xl font-bold text-gray-900">API Reference</h1>
          <p className="mt-3 text-gray-600">
            Integrate ContractorMargin data into your own tools with our REST API and MCP
            endpoint.
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-12 rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Authentication</h2>
          <p className="mt-2 text-sm text-gray-600">
            All API requests require a Bearer token in the Authorization header.
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4 font-mono text-sm text-gray-800">
            Authorization: Bearer YOUR_API_KEY
          </div>
        </section>

        {/* GET /api/v1/stats */}
        <section className="mb-8 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              GET
            </span>
            <code className="text-sm font-mono text-gray-900">/api/v1/stats</code>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Returns aggregated stats for the authenticated user.
          </p>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Response
            </div>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
{`{
  "avg_margin": 38.4,
  "active_jobs": 3,
  "flagged_jobs": 1,
  "estimate_accuracy": 96.2
}`}
            </pre>
          </div>
        </section>

        {/* GET /api/v1/jobs */}
        <section className="mb-8 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              GET
            </span>
            <code className="text-sm font-mono text-gray-900">/api/v1/jobs</code>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Returns all jobs with computed margins for the authenticated user.
          </p>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Response
            </div>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
{`{
  "jobs": [
    {
      "id": "uuid",
      "name": "Residential AC Install - Johnson",
      "client_name": "Mike Johnson",
      "status": "completed",
      "estimated_revenue": 3200,
      "actual_revenue": 3100,
      "total_labor_cost": 650,
      "total_material_cost": 1300,
      "total_cost": 1950,
      "margin": 37.1,
      "margin_danger": false
    }
  ]
}`}
            </pre>
          </div>
        </section>

        {/* POST /api/v1/jobs */}
        <section className="mb-8 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
              POST
            </span>
            <code className="text-sm font-mono text-gray-900">/api/v1/jobs</code>
          </div>
          <p className="mt-3 text-sm text-gray-600">Create a new job.</p>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Request Body
            </div>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
{`{
  "name": "Heat Pump Install - Smith",
  "client_name": "Bob Smith",
  "job_type": "residential",
  "estimated_revenue": 4500
}`}
            </pre>
          </div>
        </section>

        {/* MCP Endpoint */}
        <section className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
              POST
            </span>
            <code className="text-sm font-mono text-gray-900">/api/mcp</code>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              MCP Protocol
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Model Context Protocol endpoint. Use with Claude, Cursor, or any MCP-compatible AI
            assistant to query your job data via natural language.
          </p>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Available Tools
            </div>
            <div className="space-y-3">
              {[
                { name: 'get_stats', desc: 'Get aggregated margin stats for your account' },
                { name: 'create_job', desc: 'Create a new job with name, client, and revenue' },
                { name: 'add_labor', desc: 'Log a labor entry to a job (tech, hours, rate)' },
                { name: 'add_material', desc: 'Log a material cost to a job' },
              ].map((tool) => (
                <div key={tool.name} className="rounded-lg border border-indigo-200 bg-white p-3">
                  <code className="text-sm font-semibold text-indigo-700">{tool.name}</code>
                  <p className="mt-1 text-xs text-gray-600">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Example Request (tools/call)
            </div>
            <pre className="overflow-x-auto rounded-lg bg-white border border-indigo-200 p-4 text-sm text-gray-800">
{`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_stats",
    "arguments": {}
  }
}`}
            </pre>
          </div>
        </section>

        {/* Rate limits */}
        <section className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900">Rate Limits</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Requests/min</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">MCP calls/day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-600">Starter</td>
                  <td className="px-4 py-3 text-gray-600">30</td>
                  <td className="px-4 py-3 text-gray-600">100</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Pro</td>
                  <td className="px-4 py-3 text-gray-600">120</td>
                  <td className="px-4 py-3 text-gray-600">1,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Team</td>
                  <td className="px-4 py-3 text-gray-600">300</td>
                  <td className="px-4 py-3 text-gray-600">5,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
