const express = require('express')
const pool = require('../db/pool')
const { resolveMemberId } = require('../db/lookups')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT c.id, m.name AS "memberName", c.date, c.time, c.duration
    FROM checkins c LEFT JOIN members m ON c.member_id = m.id ORDER BY c.date DESC, c.id DESC`)
  res.json(r.rows)
})

router.post('/', async (req, res, next) => {
  try {
    const { memberName, date, time, duration } = req.body
    const member_id = await resolveMemberId(memberName)
    const r = await pool.query(`INSERT INTO checkins (member_id, date, time, duration) VALUES ($1,$2,$3,$4) RETURNING id`, [member_id, date, time, duration])
    res.status(201).json({ id: r.rows[0].id })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { memberName, date, time, duration } = req.body
    const member_id = await resolveMemberId(memberName)
    await pool.query(`UPDATE checkins SET member_id=$1, date=$2, time=$3, duration=$4 WHERE id=$5`, [member_id, date, time, duration, req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM checkins WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
