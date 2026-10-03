const express = require('express')
const pool = require('../db/pool')
const { resolvePlanId } = require('../db/lookups')
const { getMembersWithStatus } = require('../db/membersWithStatus')
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const rows = await getMembersWithStatus()
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, plan, joinDate, status } = req.body
    const plan_id = await resolvePlanId(plan)
    const manual_status = status === 'Congelado' ? 'Congelado' : 'Activo'
    const frozen_since = manual_status === 'Congelado' ? new Date().toISOString().slice(0, 10) : null
    const r = await pool.query(
      `INSERT INTO members (name, email, phone, plan_id, join_date, manual_status, frozen_since) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [name, email, phone, plan_id, joinDate || null, manual_status, frozen_since]
    )
    res.status(201).json({ id: r.rows[0].id })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, plan, joinDate, status } = req.body
    const plan_id = await resolvePlanId(plan)
    const wantsFrozen = status === 'Congelado'

    const current = await pool.query('SELECT manual_status, frozen_since FROM members WHERE id=$1', [req.params.id])
    const wasFrozen = current.rows[0]?.manual_status === 'Congelado'
    let frozen_since = current.rows[0]?.frozen_since || null
    if (wantsFrozen && !wasFrozen) frozen_since = new Date().toISOString().slice(0, 10)
    if (!wantsFrozen) frozen_since = null

    await pool.query(
      `UPDATE members SET name=$1, email=$2, phone=$3, plan_id=$4, join_date=$5, manual_status=$6, frozen_since=$7 WHERE id=$8`,
      [name, email, phone, plan_id, joinDate || null, wantsFrozen ? 'Congelado' : 'Activo', frozen_since, req.params.id]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM members WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
