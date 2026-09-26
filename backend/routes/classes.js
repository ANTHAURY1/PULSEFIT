const express = require('express')
const pool = require('../db/pool')
const { resolveTrainerId } = require('../db/lookups')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT cl.id, cl.class_name AS "className", t.name AS trainer, cl.schedule, cl.capacity,
      COUNT(ce.member_id) AS enrolled
    FROM classes cl
    LEFT JOIN trainers t ON cl.trainer_id = t.id
    LEFT JOIN class_enrollments ce ON ce.class_id = cl.id
    GROUP BY cl.id, t.name ORDER BY cl.id`)
  res.json(r.rows.map(row => ({ ...row, enrolled: Number(row.enrolled) })))
})

router.post('/', async (req, res, next) => {
  try {
    const { className, trainer, schedule, capacity } = req.body
    const trainer_id = await resolveTrainerId(trainer)
    const r = await pool.query(`INSERT INTO classes (class_name, trainer_id, schedule, capacity) VALUES ($1,$2,$3,$4) RETURNING id`, [className, trainer_id, schedule, capacity])
    res.status(201).json({ id: r.rows[0].id })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { className, trainer, schedule, capacity } = req.body
    const trainer_id = await resolveTrainerId(trainer)
    await pool.query(`UPDATE classes SET class_name=$1, trainer_id=$2, schedule=$3, capacity=$4 WHERE id=$5`, [className, trainer_id, schedule, capacity, req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM classes WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

// --- Gestión de inscripciones reales (arregla el conteo inflado) ---
router.get('/:id/enrollments', async (req, res) => {
  const r = await pool.query(`
    SELECT m.id, m.name FROM class_enrollments ce
    JOIN members m ON m.id = ce.member_id WHERE ce.class_id = $1 ORDER BY m.name`, [req.params.id])
  res.json(r.rows)
})

router.get('/:id/available', async (req, res) => {
  const r = await pool.query(`
    SELECT m.id, m.name FROM members m
    WHERE m.id NOT IN (SELECT member_id FROM class_enrollments WHERE class_id = $1)
    ORDER BY m.name`, [req.params.id])
  res.json(r.rows)
})

router.post('/:id/enrollments', async (req, res, next) => {
  try {
    const { memberId } = req.body
    await pool.query(`INSERT INTO class_enrollments (class_id, member_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [req.params.id, memberId])
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id/enrollments/:memberId', async (req, res) => {
  await pool.query(`DELETE FROM class_enrollments WHERE class_id=$1 AND member_id=$2`, [req.params.id, req.params.memberId])
  res.json({ ok: true })
})

module.exports = router
