// Calcula el estado real de un miembro (Activo / Vencido / Cancelado / Congelado)
// a partir de la fecha de su último pago y la duración de su plan.
// "Congelado" es la única decisión manual del staff; todo lo demás se calcula solo.

const DURATION_DAYS = { Mensual: 30, Trimestral: 90, Anual: 365 }

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a, b) {
  return Math.floor((a - b) / (1000 * 60 * 60 * 24))
}

/**
 * @param {object} member - { manual_status, frozen_since, join_date, plan_duration }
 * @param {Date|null} lastPaymentDate - fecha del último pago 'Pagado' de este miembro, o null
 * @returns {{ status: string, since: string|null, daysInStatus: number|null }}
 */
function computeMemberStatus(member, lastPaymentDate) {
  const today = new Date()

  if (member.manual_status === 'Congelado') {
    const since = member.frozen_since ? new Date(member.frozen_since) : today
    return { status: 'Congelado', since: since.toISOString().slice(0, 10), daysInStatus: daysBetween(today, since) }
  }

  const intervalDays = DURATION_DAYS[member.plan_duration] || 30
  const baseDate = lastPaymentDate || (member.join_date ? new Date(member.join_date) : today)
  const dueDate = addDays(baseDate, intervalDays)

  if (today <= dueDate) {
    return { status: 'Activo', since: null, daysInStatus: null }
  }

  const daysOverdue = daysBetween(today, dueDate)
  if (daysOverdue > 30) {
    return { status: 'Cancelado', since: dueDate.toISOString().slice(0, 10), daysInStatus: daysOverdue }
  }
  return { status: 'Vencido', since: dueDate.toISOString().slice(0, 10), daysInStatus: daysOverdue }
}

module.exports = { computeMemberStatus, DURATION_DAYS }
