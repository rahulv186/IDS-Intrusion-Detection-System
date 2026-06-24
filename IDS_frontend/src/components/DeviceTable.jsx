import { useState, useMemo } from 'react'

export default function DeviceTable({ devices = [], loading }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'lastSeen', dir: 'desc' })

  const getVal = (d, k) => {
    const map = { deviceId: ['client_id', 'device_id', 'id'], ip: ['ip'], status: ['status'], lastSeen: ['lastSeen', 'last_seen'] }
    const keys = map[k] || [k]
    for (const key of keys) {
      if (d[key] != null) return d[key]
    }
    return null
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return devices
    const q = search.toLowerCase()
    return devices.filter(
      (d) =>
        (getVal(d, 'deviceId') || '').toString().toLowerCase().includes(q) ||
        (getVal(d, 'ip') || '').toString().toLowerCase().includes(q)
    )
  }, [devices, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ak = getVal(a, sort.key)
      const bk = getVal(b, sort.key)
      if (typeof ak === 'string' && typeof bk === 'string') {
        const r = ak.localeCompare(bk)
        return sort.dir === 'asc' ? r : -r
      }
      if (ak == null && bk == null) return 0
      if (ak == null) return sort.dir === 'asc' ? 1 : -1
      if (bk == null) return sort.dir === 'asc' ? -1 : 1
      const r = ak < bk ? -1 : ak > bk ? 1 : 0
      return sort.dir === 'asc' ? r : -r
    })
  }, [filtered, sort])

  const toggleSort = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search by Device ID or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {[
                { key: 'deviceId', label: 'Device ID' },
                { key: 'ip', label: 'IP' },
                { key: 'status', label: 'Status' },
                { key: 'lastSeen', label: 'Last Seen' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 select-none"
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
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No devices found
                </td>
              </tr>
            ) : (
              sorted.map((d) => {
                const disconnected = (d.status || '').toLowerCase() === 'offline' || (d.status || '').toLowerCase() === 'disconnected'
                return (
                  <tr
                    key={d._id || getVal(d, 'deviceId') || d.ip || d.id}
                    className={`
                      border-b border-gray-100 dark:border-gray-700/50
                      transition-colors duration-200
                      ${disconnected ? 'bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30' : 'hover:bg-gray-50/80 dark:hover:bg-gray-700/50'}
                    `}
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-800 dark:text-gray-200">
                      {getVal(d, 'deviceId') || '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {d.ip || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`
                          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                          ${disconnected ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'}
                        `}
                      >
                        {d.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {getVal(d, 'lastSeen') || '-'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
