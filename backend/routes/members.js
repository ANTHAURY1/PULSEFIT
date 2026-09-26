const express = require('express')
const pool = require('../db/pool')
const { resolvePlanId } = require('../db/lookups')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT m.id, m.name, m.email, m.phone, p.plan_name AS plan, m.join_date AS "joinDate", m.status
    FROM members m LEFT JOIN plans p ON m.plan_id = p.id ORDER BY m.id`)
  res.json(r.rows)
})

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, plan, joinDate, status } = req.body
    const plan_id = await resolvePlanId(plan)
    const r = await pool.query(
      `INSERT INTO members (name, email, phone, plan_id, join_date, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, email, phone, plan_id, joinDate || null, status]
    )
    res.status(201).json({ id: r.rows[0].id })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, plan, joinDate, status } = req.body
    const plan_id = await resolvePlanId(plan)
    await pool.query(
      `UPDATE members SET name=$1, email=$2, phone=$3, plan_id=$4, join_date=$5, status=$6 WHERE id=$7`,
      [name, email, phone, plan_id, joinDate || null, status, req.params.id]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM members WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
