const express = require('express')
const pool = require('../db/pool')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`SELECT id, name, specialty, phone, email, certification, status FROM trainers ORDER BY id`)
  res.json(r.rows)
})

router.post('/', async (req, res) => {
  const { name, specialty, phone, email, certification, status } = req.body
  const r = await pool.query(`INSERT INTO trainers (name, specialty, phone, email, certification, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [name, specialty, phone, email, certification, status])
  res.status(201).json({ id: r.rows[0].id })
})

router.put('/:id', async (req, res) => {
  const { name, specialty, phone, email, certification, status } = req.body
  await pool.query(`UPDATE trainers SET name=$1, specialty=$2, phone=$3, email=$4, certification=$5, status=$6 WHERE id=$7`, [name, specialty, phone, email, certification, status, req.params.id])
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM trainers WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
