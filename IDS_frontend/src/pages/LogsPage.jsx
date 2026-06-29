import { useMemo, useState } from 'react'
import { useLogs } from '../hooks/useApiPoll'

const SEVERITY_ORDER = { critical: 0, error: 1, warn: 2, warning: 2, info: 3, debug: 4 }

function getSeverityLevel(log) {
  const s = (log.severity ?? log.level ?? '').toString().toLowerCase()
  return SEVERITY_ORDER[s] ?? 5
}

function getVal(log, ...keys) {
  for (const k of keys) {
    if (log[k] != null && log[k] !== '') return log[k]
  }
  return null
}

export default function LogsPage() {
  const { data: logs, loading, error } = useLogs()
  const [sort, setSort] = useState({ key: 'timestamp', dir: 'desc' })

  const sortedLogs = useMemo(() => {
    const list = Array.isArray(logs) ? logs : []
    return [...list].sort((a, b) => {
      if (sort.key === 'severity') {
        const va = getSeverityLevel(a)
        const vb = getSeverityLevel(b)
        return sort.dir === 'asc' ? va - vb : vb - va
      }
      const va = getVal(a, sort.key, sort.key === 'timestamp' ? 'createdAt' : sort.key)
      const vb = getVal(b, sort.key, sort.key === 'timestamp' ? 'createdAt' : sort.key)
      if (va == null && vb == null) return 0
      if (va == null) return sort.dir === 'asc' ? 1 : -1
      if (vb == null) return sort.dir === 'asc' ? -1 : 1
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [logs, sort])

  const isCritical = (log) => {
    const s = (log.severity ?? log.level ?? '').toString().toLowerCase()
    return s === 'critical' || s === 'error'
  }

  const severityClass = (log) => {
    const s = (log.severity ?? log.level ?? '').toString().toLowerCase()
    if (s === 'High' || s === 'error') return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
    if (s === 'Medium' || s === 'warning') return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
    if (s === 'Low') return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
    return 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
  }

  const headers = [
    { key: 'clientId', label: 'Client ID' },
    { key: 'message', label: 'Message' },
    { key: 'topic', label: 'Topic' },
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'severity', label: 'Severity' },
  ]

  const toggleSort = (key) => {
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs</h1>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <p className="text-gray-600 dark:text-gray-400">
        System and security event logs. Refreshes automatically every few seconds.
      </p>

      <div className="rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {headers.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 select-none text-sm sm:text-base"
                  >
                    {label}
                    {sort.key === key && (sort.dir === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 sm:px-6 text-center text-gray-500">
                    <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-2 text-sm">Loading logs...</p>
                  </td>
                </tr>
              ) : sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 sm:px-6 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log, i) => {
                  const critical = isCritical(log)
                  const id = log._id ?? log.id ?? i
                  return (
                    <tr
                      key={id}
                      className={`
                        border-b border-gray-100 dark:border-gray-700/50 transition-colors duration-200
                        ${critical ? 'bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30' : 'hover:bg-gray-50/80 dark:hover:bg-gray-700/50'}
                      `}
                    >
                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 break-all">
                        {getVal(log, 'clientId', 'client_id', 'client') ?? '–'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words max-w-[200px] sm:max-w-none">
                        {getVal(log, 'message', 'msg') ?? '–'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all">
                        {getVal(log, 'topic') ?? '–'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {getVal(log, 'timestamp', 'createdAt', 'created_at', 'time') ?? '–'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${severityClass(log)}`}>
                          {getVal(log, 'severity', 'level') ?? '–'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
