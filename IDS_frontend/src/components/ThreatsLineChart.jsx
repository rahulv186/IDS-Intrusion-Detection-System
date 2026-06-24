import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { useThreats } from "../hooks/useApiPoll"

function formatTime(ts) {
  const date = new Date(ts)

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function buildTimeline(data) {
  if (!Array.isArray(data)) return []

  // Sort raw data chronologically first
  const sortedData = [...data].sort((a, b) => {
    const t1 = new Date(a.timestamp || a.created_at || a.time).getTime()
    const t2 = new Date(b.timestamp || b.created_at || b.time).getTime()
    return t1 - t2
  })

  const map = {}

  sortedData.forEach((item) => {
    const ts = item.timestamp || item.created_at || item.time
    if (!ts) return

    const timeKey = formatTime(ts)

    if (!map[timeKey]) {
      map[timeKey] = 0
    }

    map[timeKey]++
  })

  return Object.entries(map).map(([time, count]) => ({
    time,
    count,
  }))
}

export default function ThreatsLineChart() {
  const { data = [], loading } = useThreats()
  const chartData = buildTimeline(data)

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin animate-spin" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Threats Over Time
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />

            <XAxis
              dataKey="time"
              tick={{ fill: "currentColor", fontSize: 12 }}
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
            />

            <YAxis
              tick={{ fill: "currentColor", fontSize: 12 }}
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value) => [value, "Threats"]}
              labelStyle={{ color: "#374151" }}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              name="Threats"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}