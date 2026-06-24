import axios from "axios"

const BASE = 'http://localhost:5050/api'

const api = axios.create({
  baseURL: BASE,
  headers: {
      "Content-Type": "application/json",
  },
});


export async function fetchStats() {
  const res = await api.get("/dashboard/stats");
  
    return res.data;
}

export async function fetchLogs() {
  try {
    const res = await api.get("/logs");
    return res.data;
  } catch (err) {
    console.error('[fetchLogs] Request failed:', err?.message ?? err);
    throw err;
  }
}


export async function fetchDevices() {
  const res = await fetch(`${BASE}/devices`)
  if (!res.ok) throw new Error('Failed to fetch devices')
  return res.json()
}

export async function fetchThreats(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = `${BASE}/threats${qs ? `?${qs}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch threats')
  return res.json()
}

export async function deleteThreat(id) {
  const res = await fetch(`${BASE}/threats/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete threat')
  return res.json().catch(() => ({}))
}

