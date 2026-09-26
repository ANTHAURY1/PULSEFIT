require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { requireAuth } = require('./middleware/auth')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))

// Todo lo demás requiere sesión iniciada
app.use('/api/members', requireAuth, require('./routes/members'))
app.use('/api/plans', requireAuth, require('./routes/plans'))
app.use('/api/checkins', requireAuth, require('./routes/checkins'))
app.use('/api/classes', requireAuth, require('./routes/classes'))
app.use('/api/payments', requireAuth, require('./routes/payments'))
app.use('/api/equipment', requireAuth, require('./routes/equipment'))
app.use('/api/trainers', requireAuth, require('./routes/trainers'))
app.use('/api/pt-sessions', requireAuth, require('./routes/ptSessions'))
app.use('/api/progress', requireAuth, require('./routes/progress'))
app.use('/api/leads', requireAuth, require('./routes/leads'))
app.use('/api/reset', requireAuth, require('./routes/reset'))

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Manejador de errores centralizado (los "lookups" lanzan err.status=400)
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(err.status || 500).json({ error: err.message || 'Error del servidor' })
})

const PORT = process.env.PORT || 4000
// 0.0.0.0 para que el teléfono/otros dispositivos en la misma red puedan conectarse
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✔ API de PulseFit corriendo en el puerto ${PORT}`)
})
