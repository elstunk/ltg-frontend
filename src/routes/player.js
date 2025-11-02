import { query } from '../lib/db.js'
import { cache } from '../lib/cache.js'

export async function buildPlayerRoutes(app) {
  app.get('/player/:id', {
    schema: {
      summary: 'Get a single player by id',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: { type: 'object', properties: { player_id: { type: 'string' }, name: { type: 'string' }, country: { type: 'string' }, hand: { type: 'string' }, world_rank: { type: 'number' } } } },
    },
  }, async (req) => {
    const key = `player:${req.params.id}`
    const memo = cache.get(key)
    if (memo) return memo
    const { rows } = await query(app, `SELECT player_id, name, country, hand, world_rank FROM players WHERE player_id = $1`, [req.params.id])
    const out = rows[0] || null
    cache.set(key, out, 300_000)
    return out
  })

  app.get('/player/search', {
    schema: {
      summary: 'Search players by name prefix or fuzzy',
      querystring: { type: 'object', properties: { q: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 } }, required: ['q'] },
    },
  }, async (req) => {
    const { q, limit = 20 } = req.query
    const key = `player:search:${q}:${limit}`
    const memo = cache.get(key)
    if (memo) return memo
    const { rows } = await query(app, `
      SELECT player_id, name, country, world_rank
      FROM players
      WHERE name ILIKE $1
      ORDER BY world_rank NULLS LAST, name ASC
      LIMIT $2
    `, [q.replace(/\s+/g, '%') + '%', limit])
    cache.set(key, rows, 60_000)
    return rows
  })
}
