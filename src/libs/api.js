const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
// src/lib/api.js

const API = import.meta.env.VITE_API_URL;

export async function getHealth() {
  const res = await fetch(`${API}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

