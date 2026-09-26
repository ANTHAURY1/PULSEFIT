const express = require('express')
const pool = require('../db/pool')
const { resolveMemberId, resolvePlanId } = require('../db/lookups')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT p.id, m.name AS "memberName", pl.plan_name AS plan, p.amount, p.date, p.status
    FROM payments p LEFT JOIN members m ON p.member_id=m.id LEFT JOIN plans pl ON p.plan_id=pl.id
    ORDER BY p.date DESC, p.id DESC`)
  res.json(r.rows)
})

router.post('/', async (req, res, next) => {
  try {
    const { memberName, plan, amount, date, status } = req.body
    const member_id = await resolveMemberId(memberName)
    const plan_id = await resolvePlanId(plan)
    const r = await pool.query(`INSERT INTO payments (member_id, plan_id, amount, date, status) VALUES ($1,$2,$3,$4,$5) RETURNING id`, [member_id, plan_id, amount, date, status])
    res.status(201).json({ id: r.rows[0].id })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { memberName, plan, amount, date, status } = req.body
    const member_id = await resolveMemberId(memberName)
    const plan_id = await resolvePlanId(plan)
    await pool.query(`UPDATE payments SET member_id=$1, plan_id=$2, amount=$3, date=$4, status=$5 WHERE id=$6`, [member_id, plan_id, amount, date, status, req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM payments WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
