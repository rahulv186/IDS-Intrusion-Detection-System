import { useState, useEffect, useCallback } from 'react'
import { fetchStats, fetchDevices, fetchThreats, fetchLogs } from '../api/client'

const POLL_INTERVAL_MS = 3000

export function useStats(intervalMs = POLL_INTERVAL_MS) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetchStats()
      setData(res)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, loading, error, refresh: load }
}

export function useDevices(intervalMs = POLL_INTERVAL_MS) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetchDevices()
      setData(Array.isArray(res) ? res : res?.devices ?? [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch devices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, loading, error, refresh: load }
}

export function useThreats(intervalMs = POLL_INTERVAL_MS) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetchThreats()
      const list = Array.isArray(res) ? res : res?.threats ?? res?.data ?? []
      setData(list)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch threats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, loading, error, refresh: load }
}

export function useThreatsChart(intervalMs = POLL_INTERVAL_MS) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetchThreats()
      const raw = Array.isArray(res) ? [] : res?.threatsOverTime ?? res?.chart ?? []
      setData(raw)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch chart data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, loading, error }
}

export function useVulnDistribution(intervalMs = POLL_INTERVAL_MS) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetchThreats()
      const raw = Array.isArray(res) ? [] : res?.vulnerabilityDistribution ?? res?.vulnDist ?? []
      setData(raw)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch vulnerability data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, loading, error }
}


export function useLogs(intervalMs = POLL_INTERVAL_MS) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetchLogs()
      const list = Array.isArray(res) ? res : res?.logs ?? res?.data ?? []
      setData(list)
      setError(null)
    } catch (err) {
      const message = err?.message || 'Failed to fetch logs'
      setError(message)
      console.error('[useLogs] Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, loading, error, refresh: load }
}