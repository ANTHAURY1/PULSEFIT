const express = require('express')
const pool = require('../db/pool')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT pl.id, pl.plan_name AS "planName", pl.duration, pl.price, pl.perks,
      COUNT(m.id) FILTER (WHERE m.status = 'Activo') AS "activeMembers"
    FROM plans pl LEFT JOIN members m ON m.plan_id = pl.id
    GROUP BY pl.id ORDER BY pl.id`)
  res.json(r.rows.map(row => ({ ...row, activeMembers: Number(row.activeMembers) })))
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
