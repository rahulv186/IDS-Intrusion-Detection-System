import StatCard from '../components/StatCard'
import DeviceTable from '../components/DeviceTable'
import ThreatsTable from '../components/ThreatsTable'
import VulnerabilityPieChart from '../components/VulnerabilityPieChart'
import ThreatsLineChart from '../components/ThreatsLineChart'
import {
  useStats,
  useDevices,
  useThreats,
  useThreatsChart,
  useVulnDistribution,
} from '../hooks/useApiPoll'

function DevicesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function BugIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function ServerIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  )
}

export default function DashboardPage() {
  const { data: stats, loading: statsLoading, error: statsError } = useStats()
  const { data: devices, loading: devicesLoading, error: devicesError } = useDevices()
  const { data: threats, loading: threatsLoading, refresh: refreshThreats, error: threatsError } = useThreats()
  const { data: chartData, loading: chartLoading } = useThreatsChart()
  const { data: vulnData, loading: vulnLoading } = useVulnDistribution()

  const s = stats || {}
  
  const isOnline = ((s.brokerStatus ?? s.broker_status) || '').toLowerCase() === 'online'
  const hasError = statsError || devicesError || threatsError

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {hasError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {statsError || devicesError || threatsError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Connected Devices"
          value={statsLoading ? '...' : (s.data.totalConnectedDevices ?? s.connected_devices ?? s.devices ?? 0)}
          icon={DevicesIcon}
        />
        <StatCard
          title="Total Threats"
          value={statsLoading ? '...' : (s.data.totalThreats ?? s.total_threats ?? s.threats ?? 0)}
          icon={ShieldIcon}
        />
        <StatCard
          title="Vulnerabilities"
          value={statsLoading ? '...' : (s.data.totalVulnerabilities ?? s.total_vulnerabilities ?? s.vulnerabilities ?? 0)}
          icon={BugIcon}
        />
        <StatCard
          title="Broker Status"
          value={statsLoading ? '...' : (s.data.brokerStatus ?? s.broker_status ?? 'Unknown')}
          variant={isOnline ? 'danger' : 'success'}
          icon={ServerIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VulnerabilityPieChart data={vulnData} loading={vulnLoading} />
        <ThreatsLineChart data={chartData} loading={chartLoading} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Devices</h2>
        <DeviceTable devices={devices} loading={devicesLoading} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Threats</h2>
        <ThreatsTable threats={threats} loading={threatsLoading} onRefresh={refreshThreats} />
      </section>
    </div>
  )
}
