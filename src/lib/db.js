export async function query(app, text, params = []) {
  const start = Date.now()
  try {
    const res = await app.pg.pool.query(text, params)
    app.log.debug({ ms: Date.now() - start, rows: res.rowCount, text }, 'db.query')
    return res
  } catch (e) {
    app.log.error({ err: e, text }, 'db.error')
    throw e
  }
}
