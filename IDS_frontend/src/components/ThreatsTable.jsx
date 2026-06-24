import { useState } from 'react'
import { deleteThreat } from '../api/client'

const PAGE_SIZE = 10

export default function ThreatsTable({ threats = [], loading, onRefresh }) {
  const [page, setPage] = useState(0)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const totalPages = Math.ceil(threats.length / PAGE_SIZE)
  const paginated = threats.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  

  const handleIgnore = async (threat) => {
    const id = threat._id ?? threat.threatId ?? threat.id
    if (!id) return
    setDeletingId(id)
    try {
      await deleteThreat(id)
      setToast('Threat ignored successfully')
      onRefresh?.()
      setPage((p) => Math.max(0, Math.min(p, Math.ceil((threats.length - 1) / PAGE_SIZE) - 1)))
    } catch {
      setToast('Failed to ignore threat')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Threat ID</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Attack Type</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Client</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Severity</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Timestamp</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No threats found
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const critical = (t.severity || '').toLowerCase() === 'critical'
                  const id = t._id ?? t.threatId ?? t.id
                  const isDeleting = deletingId === id
                  return (
                    <tr
                      key={id}
                      className={`
                        border-b border-gray-100 dark:border-gray-700/50
                        transition-colors duration-200
                        ${critical ? 'bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30' : 'hover:bg-gray-50/80 dark:hover:bg-gray-700/50'}
                      `}
                    >
                      <td className="px-6 py-4 font-mono text-sm text-gray-800 dark:text-gray-200">
                        {t.threatId ?? t._id ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {t.attackType ?? t.attack_type ?? t.type ?? '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                        {t.client_id ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${critical ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'}
                          `}
                        >
                          {t.severity ?? '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {t.timestamp ? new Date(t.timestamp).toLocaleString() : new Date().toLocaleString() ?? t.createdAt ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleIgnore(t)}
                          disabled={isDeleting || !id}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isDeleting ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                              Ignoring...
                            </span>
                          ) : (
                            'Ignore'
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && !loading && (
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page + 1} of {totalPages} ({threats.length} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* {toast && (
        <Toast
          message={toast}
          onDismiss={() => setToast(null)}
        />
      )} */}
    </>
  )
}
