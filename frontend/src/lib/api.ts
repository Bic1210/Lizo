const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('[Lizo] VITE_API_BASE_URL 未设置，API 请求将发向当前 origin')
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}
