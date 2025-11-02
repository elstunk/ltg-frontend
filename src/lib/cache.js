class TTLCache {
  #map = new Map()
  constructor(defaultTtlMs = 60_000) { this.defaultTtlMs = defaultTtlMs }
  get(key) {
    const hit = this.#map.get(key)
    if (!hit) return undefined
    const { value, exp } = hit
    if (Date.now() > exp) { this.#map.delete(key); return undefined }
    return value
  }
  set(key, value, ttlMs = this.defaultTtlMs) {
    this.#map.set(key, { value, exp: Date.now() + ttlMs })
  }
  del(key) { this.#map.delete(key) }
  clear() { this.#map.clear() }
}
export const cache = new TTLCache(120_000)
export { TTLCache }
