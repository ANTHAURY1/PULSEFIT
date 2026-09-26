const express = require('express')
const pool = require('../db/pool')
const { resolveMemberId } = require('../db/lookups')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT p.id, m.name AS "memberName", p.date, p.weight, p.body_fat_pct AS "bodyFatPct", p.notes
    FROM progress p LEFT JOIN members m ON p.member_id=m.id ORDER BY p.date DESC, p.id DESC`)
  res.json(r.rows)
})

router.post('/', async (req, res, next) => {
  try {
    const { memberName, date, weight, bodyFatPct, notes } = req.body
    const member_id = await resolveMemberId(memberName)
    const r = await pool.query(`INSERT INTO progress (member_id, date, weight, body_fat_pct, notes) VALUES ($1,$2,$3,$4,$5) RETURNING id`, [member_id, date, weight, bodyFatPct, notes])
    res.status(201).json({ id: r.rows[0].id })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { memberName, date, weight, bodyFatPct, notes } = req.body
    const member_id = await resolveMemberId(memberName)
    await pool.query(`UPDATE progress SET member_id=$1, date=$2, weight=$3, body_fat_pct=$4, notes=$5 WHERE id=$6`, [member_id, date, weight, bodyFatPct, notes, req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM progress WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
