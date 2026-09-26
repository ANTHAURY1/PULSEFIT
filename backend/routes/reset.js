// Restablece los datos de demostración (equivalente al botón ↺ de la app).
const express = require('express')
const { execFile } = require('child_process')
const path = require('path')
const pool = require('../db/pool')
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const fs = require('fs')
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8')
    await pool.query(schema)
    execFile('node', [path.join(__dirname, '../db/seed.js')], { env: process.env }, (err) => {
      if (err) return res.status(500).json({ error: 'No se pudo reinsertar los datos de demostración' })
      res.json({ ok: true })
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
