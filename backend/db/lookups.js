// Resuelve nombres (lo que el usuario escribe en el formulario) al id real
// en la base de datos. Si el nombre no existe, rechaza la operación en vez
// de crear un registro huérfano — así se evita que aparezcan "usuarios
// fantasma" o conteos inflados que no corresponden a datos reales.
const pool = require('./pool')

async function resolveId(table, column, value) {
  if (value === undefined || value === null || value === '') return null
  const r = await pool.query(`SELECT id FROM ${table} WHERE ${column} = $1`, [value])
  if (!r.rows[0]) {
    const err = new Error(`No se encontró "${value}" en ${table}. Debe ser un registro que ya exista.`)
    err.status = 400
    throw err
  }
  return r.rows[0].id
}

module.exports = {
  resolveMemberId: (name) => resolveId('members', 'name', name),
  resolveTrainerId: (name) => resolveId('trainers', 'name', name),
  resolvePlanId: (name) => resolveId('plans', 'plan_name', name),
}
