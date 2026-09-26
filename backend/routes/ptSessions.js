const express = require('express')
const pool = require('../db/pool')
const { resolveMemberId, resolveTrainerId } = require('../db/lookups')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT s.id, m.name AS "memberName", t.name AS "trainerName", s.date, s.time, s.focus_area AS "focusArea", s.status
    FROM pt_sessions s LEFT JOIN members m ON s.member_id=m.id LEFT JOIN trainers t ON s.trainer_id=t.id
    ORDER BY s.date DESC, s.id DESC`)
  res.json(r.rows)
})

router.post('/', async (req, res, next) => {
  try {
    const { memberName, trainerName, date, time, focusArea, status } = req.body
    const member_id = await resolveMemberId(memberName)
    const trainer_id = await resolveTrainerId(trainerName)
    const r = await pool.query(`INSERT INTO pt_sessions (member_id, trainer_id, date, time, focus_area, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [member_id, trainer_id, date, time, focusArea, status])
    res.status(201).json({ id: r.rows[0].id })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { memberName, trainerName, date, time, focusArea, status } = req.body
    const member_id = await resolveMemberId(memberName)
    const trainer_id = await resolveTrainerId(trainerName)
    await pool.query(`UPDATE pt_sessions SET member_id=$1, trainer_id=$2, date=$3, time=$4, focus_area=$5, status=$6 WHERE id=$7`, [member_id, trainer_id, date, time, focusArea, status, req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM pt_sessions WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
