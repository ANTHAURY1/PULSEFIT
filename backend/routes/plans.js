const express = require('express')
const pool = require('../db/pool')
const { getMembersWithStatus } = require('../db/membersWithStatus')
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const plansR = await pool.query(`SELECT id, plan_name AS "planName", duration, price, perks FROM plans ORDER BY id`)
    const members = await getMembersWithStatus()
    const rows = plansR.rows.map(p => ({
      ...p,
      activeMembers: members.filter(m => m.plan_id === p.id && m.status === 'Activo').length,
    }))
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/', async (req, res) => {
  const { planName, duration, price, perks } = req.body
  const r = await pool.query(
    `INSERT INTO plans (plan_name, duration, price, perks) VALUES ($1,$2,$3,$4) RETURNING id`,
    [planName, duration, price, perks]
  )
  res.status(201).json({ id: r.rows[0].id })
})

router.put('/:id', async (req, res) => {
  const { planName, duration, price, perks } = req.body
  await pool.query(`UPDATE plans SET plan_name=$1, duration=$2, price=$3, perks=$4 WHERE id=$5`, [planName, duration, price, perks, req.params.id])
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM plans WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
