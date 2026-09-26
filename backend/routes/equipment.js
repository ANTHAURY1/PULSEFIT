const express = require('express')
const pool = require('../db/pool')
const router = express.Router()

router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT id, equipment_name AS "equipmentName", category, quantity, condition, last_serviced AS "lastServiced"
    FROM equipment ORDER BY id`)
  res.json(r.rows)
})

router.post('/', async (req, res) => {
  const { equipmentName, category, quantity, condition, lastServiced } = req.body
  const r = await pool.query(`INSERT INTO equipment (equipment_name, category, quantity, condition, last_serviced) VALUES ($1,$2,$3,$4,$5) RETURNING id`, [equipmentName, category, quantity, condition, lastServiced || null])
  res.status(201).json({ id: r.rows[0].id })
})

router.put('/:id', async (req, res) => {
  const { equipmentName, category, quantity, condition, lastServiced } = req.body
  await pool.query(`UPDATE equipment SET equipment_name=$1, category=$2, quantity=$3, condition=$4, last_serviced=$5 WHERE id=$6`, [equipmentName, category, quantity, condition, lastServiced || null, req.params.id])
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM equipment WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
