import DeviceTable from '../components/DeviceTable'
import { useDevices } from '../hooks/useApiPoll'

export default function DevicesPage() {
  const { data: devices, loading, error } = useDevices()

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Devices</h1>
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <p className="text-gray-600 dark:text-gray-400">
        View and manage all connected MQTT devices. Disconnected devices are highlighted in red.
      </p>
      <DeviceTable devices={devices} loading={loading} />
    </div>
  )
}
