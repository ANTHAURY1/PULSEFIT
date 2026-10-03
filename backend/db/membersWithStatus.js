// Helper compartido: trae todos los miembros con su estado YA calculado
// (Activo/Vencido/Cancelado/Congelado). Lo usan members.js y plans.js
// para no duplicar la lógica de cálculo.
const pool = require('./pool')
const { computeMemberStatus } = require('./memberStatus')

async function getMembersWithStatus() {
  const membersR = await pool.query(`
    SELECT m.id, m.name, m.email, m.phone, m.plan_id, p.plan_name AS plan, p.duration AS plan_duration,
      m.join_date AS "joinDate", m.manual_status, m.frozen_since
    FROM members m LEFT JOIN plans p ON m.plan_id = p.id ORDER BY m.id`)

  const paymentsR = await pool.query(`
    SELECT member_id, MAX(date) AS last_paid
    FROM payments WHERE status = 'Pagado' GROUP BY member_id`)
  const lastPaidByMember = Object.fromEntries(paymentsR.rows.map(r => [r.member_id, r.last_paid]))

  return membersR.rows.map(m => {
    const lastPaid = lastPaidByMember[m.id] ? new Date(lastPaidByMember[m.id]) : null
    const { status, since, daysInStatus } = computeMemberStatus(
      { manual_status: m.manual_status, frozen_since: m.frozen_since, join_date: m.joinDate, plan_duration: m.plan_duration },
      lastPaid
    )
    return {
      id: m.id, name: m.name, email: m.email, phone: m.phone, plan: m.plan, plan_id: m.plan_id, joinDate: m.joinDate,
      status, statusSince: since, daysInStatus,
    }
  })
}

module.exports = { getMembersWithStatus }
