// src/routes/leaderboard.js
export default async function buildLeaderboardRoutes(app) {
  app.log.info('✅ registering leaderboard routes');

  const handler = async (req, reply) => {
    const id = req.params.id ?? req.params.tournamentId;

    const { rows: lidRows } = await app.pg.pool.query(
      'SELECT id FROM leaderboard WHERE tournament_id = $1 ORDER BY id DESC LIMIT 1',
      [id]
    );
    if (!lidRows.length) return reply.code(404).send({ error: 'No leaderboard' });

    const lid = lidRows[0].id;
    const { rows: entries } = await app.pg.pool.query(
      `SELECT e.player_id, p.name, e.pos, e.pos_sort, e.score, e.thru, e.today
       FROM leaderboard_entries e
       JOIN players p ON p.player_id = e.player_id
       WHERE e.leaderboard_id = $1
       ORDER BY e.pos_sort ASC`,
      [lid]
    );

    return { tournament_id: Number(id), leaderboard_id: lid, entries };
  };

  // ✅ Canonical route
  app.get('/leaderboard/:tournamentId', {
    schema: {
      summary: 'Leaderboard (canonical)',
      params: {
        type: 'object',
        properties: { tournamentId: { type: 'integer' } },
        required: ['tournamentId'],
      },
    },
  }, handler);

  // 🔁 Alias route for compatibility
  app.get('/tournament/:id/leaderboard', {
    schema: {
      summary: 'Leaderboard (alias)',
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } },
        required: ['id'],
      },
    },
  }, handler);
}
