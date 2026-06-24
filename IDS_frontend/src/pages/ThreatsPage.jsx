import ThreatsTable from '../components/ThreatsTable'
import ThreatsLineChart from '../components/ThreatsLineChart'
import VulnerabilityPieChart from '../components/VulnerabilityPieChart'
import { useThreats, useThreatsChart, useVulnDistribution } from '../hooks/useApiPoll'

export default function ThreatsPage() {
  const { data: threats, loading, refresh, error } = useThreats()
  const { data: chartData, loading: chartLoading, error: chartError } = useThreatsChart()
  const { data: vulnData, loading: vulnLoading, error: vulnError } = useVulnDistribution()

  const hasError = error || chartError || vulnError

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Threats</h1>
      {hasError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error || chartError || vulnError}
        </div>
      )}
      <p className="text-gray-600 dark:text-gray-400">
        Monitor security threats. Critical threats are highlighted in red.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatsLineChart data={chartData} loading={chartLoading} />
        <VulnerabilityPieChart data={vulnData} loading={vulnLoading} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Threat Log</h2>
        <ThreatsTable threats={threats} loading={loading} onRefresh={refresh} />
      </section>
    </div>
  )
}
