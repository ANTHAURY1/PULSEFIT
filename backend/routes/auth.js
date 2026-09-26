const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')
const { requireAuth, SECRET } = require('../middleware/auth')
const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  try {
    const r = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    const user = r.rows[0]
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    const token = jwt.sign({ id: user.id, username: user.username, full_name: user.full_name, role: user.role }, SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }))
module.exports = router
