const express = require('express')
const pool = require('../db/pool')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT id, name, phone, source, interested_plan AS "interestedPlan", follow_up_date AS "followUpDate", status
    FROM leads ORDER BY id DESC`)
  res.json(r.rows)
})

router.post('/', async (req, res) => {
  const { name, phone, source, interestedPlan, followUpDate, status } = req.body
  const r = await pool.query(`INSERT INTO leads (name, phone, source, interested_plan, follow_up_date, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [name, phone, source, interestedPlan, followUpDate || null, status])
  res.status(201).json({ id: r.rows[0].id })
})

router.put('/:id', async (req, res) => {
  const { name, phone, source, interestedPlan, followUpDate, status } = req.body
  await pool.query(`UPDATE leads SET name=$1, phone=$2, source=$3, interested_plan=$4, follow_up_date=$5, status=$6 WHERE id=$7`, [name, phone, source, interestedPlan, followUpDate || null, status, req.params.id])
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM leads WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
