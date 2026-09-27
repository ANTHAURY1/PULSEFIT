const { Pool } = require('pg')

// Si hay DATABASE_URL (Render, Neon, Supabase, etc.), se usa esa y nada más
// — así no hay riesgo de que las variables sueltas (PGHOST, etc.) la pisen
// y termine conectándose por accidente a una base de datos local.
// Render exige conexión SSL desde fuera de su red, por eso el "ssl" aquí.
const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    }

const pool = new Pool(config)
module.exports = pool