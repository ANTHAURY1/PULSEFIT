import React, { useEffect, useState } from 'react'
import { useData, useToast } from '../store.jsx'
import { useRole, canEdit } from '../roleContext.jsx'
import { api } from '../api.js'
import { DataTable, FormModal, ConfirmModal, StatCard, BarChart, DonutChart, initials, money } from '../components/UI.jsx'
import {
  memberFields, planFields, checkinFields, classFields, paymentFields, equipmentFields,
  trainerFields, ptSessionFields, progressFields, leadFields,
} from '../data/fields.js'

function useCrud(collection) {
  const { get, add, update, remove } = useData()
  const { toast } = useToast()
  const { role } = useRole()
  const [modal, setModal] = useState({ open: false, editing: null })
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const rows = get(collection)
  const editable = canEdit(role, collection)

  return {
    rows, modal, setModal, confirm, setConfirm, saving, editable, role,
    openAdd: () => setModal({ open: true, editing: null }),
    openEdit: (row) => setModal({ open: true, editing: row }),
    close: () => setModal({ open: false, editing: null }),
    submit: async (vals, label) => {
      setSaving(true)
      try {
        if (modal.editing) { await update(collection, modal.editing.id, vals); toast(`${label} actualizado`, 'success') }
        else { await add(collection, vals); toast(`${label} agregado`, 'success') }
        setModal({ open: false, editing: null })
      } catch (err) {
        toast(err.message || 'Ocurrió un error', 'danger')
      } finally {
        setSaving(false)
      }
    },
    askDelete: (row) => setConfirm(row),
    confirmDelete: async (label) => {
      try {
        await remove(collection, confirm.id)
        toast(`${label} eliminado`, 'danger')
      } catch (err) {
        toast(err.message || 'Ocurrió un error', 'danger')
      } finally {
        setConfirm(null)
      }
    },
  }
}

function ReadOnlyBanner({ editable, role }) {
  if (editable) return null
  return <div className="readonly-banner">🔒 Modo de solo lectura para el rol <strong>&nbsp;{role}</strong> — puedes ver todo, pero no agregar/editar/eliminar aquí.</div>
}

/* ================= Panel ================= */
export function Dashboard() {
  const { get, loading, error } = useData()
  const members = get('members')
  const checkins = get('checkins')
  const classes = get('classes')
  const payments = get('payments')

  if (loading) return <div className="auth-loading">Cargando datos…</div>
  if (error) return <div className="login-error" style={{ margin: 24 }}>No se pudo conectar con el servidor: {error}</div>

  const activeMembers = members.filter(m => m.status === 'Activo').length
  const vencidos = members.filter(m => m.status === 'Vencido').length
  const cancelados = members.filter(m => m.status === 'Cancelado').length
  const todayCheckins = checkins.filter(c => c.date === '2026-08-07').length
  const revenue = payments.filter(p => p.status === 'Pagado').reduce((s, p) => s + Number(p.amount), 0)
  const avgFill = classes.length ? Math.round(classes.reduce((s, c) => s + c.enrolled / c.capacity, 0) / classes.length * 100) : 0

  const statusBars = ['Activo', 'Congelado', 'Vencido', 'Cancelado'].map(s => ({
    label: s, value: members.filter(m => m.status === s).length,
    color: s === 'Activo' ? '#059669' : s === 'Congelado' ? '#0284c7' : s === 'Vencido' ? '#d97706' : '#dc2626',
  }))

  const paymentDonut = ['Pagado', 'Pendiente', 'Vencido'].map(s => ({
    label: s, value: payments.filter(p => p.status === s).length,
    color: s === 'Pagado' ? '#059669' : s === 'Pendiente' ? '#d97706' : '#dc2626',
  })).filter(d => d.value > 0)

  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard icon="🧑‍🤝‍🧑" iconBg="var(--primary-light)" iconColor="var(--primary-dark)" value={activeMembers} label="Miembros Activos" />
        <StatCard icon="⚠️" iconBg="var(--warning-bg)" iconColor="var(--warning)" value={vencidos} label="Miembros Vencidos" />
        <StatCard icon="🚫" iconBg="var(--danger-bg,#fef2f2)" iconColor="#dc2626" value={cancelados} label="Membresías Canceladas" />
        <StatCard icon="💰" iconBg="var(--success-bg)" iconColor="var(--success)" value={money(revenue)} label="Ingresos Recaudados" />
      </div>
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard icon="🚪" iconBg="var(--info-bg)" iconColor="var(--info)" value={todayCheckins} label="Entradas Hoy" />
        <StatCard icon="🧘" iconBg="var(--warning-bg)" iconColor="var(--warning)" value={`${avgFill}%`} label="Ocupación Prom. de Clases" />
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Miembros por Estado</div><div className="card-sub">Activos, congelados, vencidos y cancelados</div></div></div>
          <BarChart data={statusBars} />
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Estado de Pagos</div><div className="card-sub">Último ciclo de facturación</div></div></div>
          <DonutChart data={paymentDonut.length ? paymentDonut : [{ label: 'Sin datos', value: 1, color: '#e5e7eb' }]} />
        </div>
      </div>
    </>
  )
}

/* ================= Miembros ================= */
export function Members() {
  const c = useCrud('members')
  const statusBadgeClass = (s) => s === 'Activo' ? 'badge-success' : s === 'Congelado' ? 'badge-info' : s === 'Vencido' ? 'badge-warning' : 'badge-danger'
  const columns = [
    { key: 'name', label: 'Miembro', render: r => (
      <div className="name-cell"><span className="avatar-sm">{initials(r.name)}</span>
        <div><div className="cell-strong">{r.name}</div><div className="n-sub">{r.plan}</div></div></div>
    ) },
    { key: 'email', label: 'Correo' },
    { key: 'joinDate', label: 'Ingreso' },
    { key: 'status', label: 'Estado', render: r => (
      <div>
        <span className={`badge ${statusBadgeClass(r.status)}`}>{r.status}</span>
        {r.daysInStatus != null && r.status !== 'Activo' && (
          <div className="cell-muted" style={{ marginTop: 3 }}>hace {r.daysInStatus} día{r.daysInStatus === 1 ? '' : 's'}</div>
        )}
      </div>
    ) },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Miembros" subtitle={`${c.rows.length} en total`} columns={columns} rows={c.rows}
        searchKeys={['name', 'email', 'plan']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agregar Miembro" emptyIcon="🧑‍🤝‍🧑" emptyMessage="Aún no hay miembros." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Miembro' : 'Agregar Miembro'} fields={memberFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agregar miembro')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Miembro')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar a ${c.confirm?.name}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Miembro')} />
    </>
  )
}

/* ================= Planes ================= */
export function Plans() {
  const c = useCrud('plans')
  const columns = [
    { key: 'planName', label: 'Plan', render: r => <span className="cell-strong">{r.planName}</span> },
    { key: 'duration', label: 'Duración' },
    { key: 'price', label: 'Precio', render: r => money(r.price) },
    { key: 'activeMembers', label: 'Miembros Activos' },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Planes de Membresía" subtitle={`${c.rows.length} planes`} columns={columns} rows={c.rows}
        searchKeys={['planName', 'duration']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agregar Plan" emptyIcon="🎫" emptyMessage="Aún no hay planes." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Plan' : 'Agregar Plan'} fields={planFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agregar plan')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Plan')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar el plan ${c.confirm?.planName}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Plan')} />
    </>
  )
}

/* ================= Registros de Entrada ================= */
export function Checkins() {
  const c = useCrud('checkins')
  const columns = [
    { key: 'memberName', label: 'Miembro' },
    { key: 'date', label: 'Fecha' },
    { key: 'time', label: 'Hora' },
    { key: 'duration', label: 'Duración' },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Registro de Entradas" subtitle={`${c.rows.length} entradas`} columns={columns} rows={c.rows}
        searchKeys={['memberName']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Registrar Entrada" emptyIcon="🚪" emptyMessage="Aún no hay entradas registradas." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Entrada' : 'Registrar Entrada'} fields={checkinFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Registrar')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Entrada')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar esta entrada de ${c.confirm?.memberName}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Entrada')} />
    </>
  )
}

/* ================= Clases (con inscripción real) ================= */
function EnrollmentModal({ cls, onClose, canManage }) {
  const { toast } = useToast()
  const { refetch } = useData()
  const [enrolled, setEnrolled] = useState([])
  const [available, setAvailable] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [e, a] = await Promise.all([api.get(`/classes/${cls.id}/enrollments`), api.get(`/classes/${cls.id}/available`)])
    setEnrolled(e); setAvailable(a); setLoading(false)
  }
  useEffect(() => { load() }, [cls.id])

  const addMember = async (memberId) => {
    await api.post(`/classes/${cls.id}/enrollments`, { memberId })
    await load(); await refetch('classes')
    toast('Miembro inscrito', 'success')
  }
  const removeMember = async (memberId) => {
    await api.del(`/classes/${cls.id}/enrollments/${memberId}`)
    await load(); await refetch('classes')
    toast('Miembro retirado de la clase', 'danger')
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header"><h3>Inscritos — {cls.className}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {loading ? <p>Cargando…</p> : (
            <>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>{enrolled.length} de {cls.capacity} cupos ocupados</p>
              {enrolled.map(m => (
                <div key={m.id} className="name-cell" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>{m.name}</span>
                  {canManage && <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => removeMember(m.id)}>Quitar</button>}
                </div>
              ))}
              {enrolled.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nadie inscrito todavía.</p>}
              {canManage && (
                <>
                  <hr style={{ margin: '14px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                  <p style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Inscribir a un miembro existente:</p>
                  {available.map(m => (
                    <div key={m.id} className="name-cell" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                      <span>{m.name}</span>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => addMember(m.id)}>Inscribir</button>
                    </div>
                  ))}
                  {available.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Todos los miembros ya están inscritos.</p>}
                </>
              )}
            </>
          )}
        </div>
        <div className="modal-footer"><button className="btn btn-outline" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  )
}

export function Classes() {
  const c = useCrud('classes')
  const [enrollFor, setEnrollFor] = useState(null)
  const columns = [
    { key: 'className', label: 'Clase', render: r => <span className="cell-strong">{r.className}</span> },
    { key: 'trainer', label: 'Entrenador' },
    { key: 'schedule', label: 'Horario' },
    { key: 'enrolled', label: 'Inscritos', render: r => (
      <button className={`badge ${r.enrolled >= r.capacity ? 'badge-danger' : 'badge-success'}`} style={{ border: 'none', cursor: 'pointer' }}
        onClick={() => setEnrollFor(r)} title="Ver / gestionar inscritos">
        {r.enrolled}/{r.capacity}
      </button>
    ) },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Clases" subtitle={`${c.rows.length} clases`} columns={columns} rows={c.rows}
        searchKeys={['className', 'trainer']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agregar Clase" emptyIcon="🧘" emptyMessage="Aún no hay clases." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Clase' : 'Agregar Clase'} fields={classFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agregar clase')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Clase')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar ${c.confirm?.className}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Clase')} />
      {enrollFor && <EnrollmentModal cls={enrollFor} onClose={() => setEnrollFor(null)} canManage={c.editable} />}
    </>
  )
}

/* ================= Pagos ================= */
export function Payments() {
  const c = useCrud('payments')
  const columns = [
    { key: 'memberName', label: 'Miembro' },
    { key: 'plan', label: 'Plan' },
    { key: 'amount', label: 'Monto', render: r => money(r.amount) },
    { key: 'date', label: 'Fecha' },
    { key: 'status', label: 'Estado', render: r => (
      <span className={`badge ${r.status === 'Pagado' ? 'badge-success' : r.status === 'Pendiente' ? 'badge-warning' : 'badge-danger'}`}>{r.status}</span>
    ) },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Pagos" subtitle={`${c.rows.length} transacciones`} columns={columns} rows={c.rows}
        searchKeys={['memberName', 'plan']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agregar Pago" emptyIcon="💳" emptyMessage="Aún no hay pagos." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Pago' : 'Agregar Pago'} fields={paymentFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agregar pago')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Pago')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar este pago de ${c.confirm?.memberName}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Pago')} />
    </>
  )
}

/* ================= Equipamiento / Mantenimiento ================= */
export function Equipment() {
  const c = useCrud('equipment')
  const columns = [
    { key: 'equipmentName', label: 'Equipo' },
    { key: 'category', label: 'Categoría' },
    { key: 'quantity', label: 'Cant.' },
    { key: 'condition', label: 'Estado', render: r => (
      <span className={`badge ${r.condition === 'Bueno' ? 'badge-success' : r.condition === 'Necesita reparación' ? 'badge-warning' : 'badge-danger'}`}>{r.condition === 'Fuera de servicio' ? 'Inactivo' : r.condition === 'Bueno' ? 'Activo' : r.condition}</span>
    ) },
    { key: 'observaciones', label: 'Observaciones', render: r => <span className="cell-muted">{r.observaciones || '—'}</span> },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Mantenimiento y Equipamiento" subtitle={`${c.rows.length} artículos`} columns={columns} rows={c.rows}
        searchKeys={['equipmentName', 'category']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agregar Equipo" emptyIcon="🏋️‍♀️" emptyMessage="Aún no hay equipo registrado." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Equipo' : 'Agregar Equipo'} fields={equipmentFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agregar equipo')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Equipo')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar ${c.confirm?.equipmentName}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Equipo')} />
    </>
  )
}

/* ================= Entrenadores ================= */
export function Trainers() {
  const c = useCrud('trainers')
  const columns = [
    { key: 'name', label: 'Entrenador', render: r => (
      <div className="name-cell"><span className="avatar-sm">{initials(r.name)}</span>
        <div><div className="cell-strong">{r.name}</div><div className="n-sub">{r.specialty}</div></div></div>
    ) },
    { key: 'certification', label: 'Certificación' },
    { key: 'email', label: 'Correo' },
    { key: 'status', label: 'Estado', render: r => <span className={`badge ${r.status === 'Activo' ? 'badge-success' : 'badge-muted'}`}>{r.status}</span> },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Entrenadores" subtitle={`${c.rows.length} entrenadores`} columns={columns} rows={c.rows}
        searchKeys={['name', 'specialty']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agregar Entrenador" emptyIcon="🥇" emptyMessage="Aún no hay entrenadores." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Entrenador' : 'Agregar Entrenador'} fields={trainerFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agregar entrenador')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Entrenador')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar a ${c.confirm?.name}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Entrenador')} />
    </>
  )
}

/* ================= Sesiones Personales ================= */
export function PTSessions() {
  const c = useCrud('ptSessions')
  const { get } = useData()
  const members = get('members')
  const planOf = (memberName) => members.find(m => m.name === memberName)?.plan || '—'
  const columns = [
    { key: 'memberName', label: 'Miembro', render: r => (
      <div><div className="cell-strong">{r.memberName}</div><div className="cell-muted">Plan: {planOf(r.memberName)} · {r.focusArea}</div></div>
    ) },
    { key: 'trainerName', label: 'Entrenador' },
    { key: 'date', label: 'Fecha' },
    { key: 'time', label: 'Hora' },
    { key: 'status', label: 'Estado', render: r => (
      <span className={`badge ${r.status === 'Completada' ? 'badge-success' : r.status === 'Cancelada' ? 'badge-danger' : 'badge-info'}`}>{r.status}</span>
    ) },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Sesiones Personales" subtitle={`${c.rows.length} sesiones`} columns={columns} rows={c.rows}
        searchKeys={['memberName', 'trainerName', 'focusArea']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agendar Sesión" emptyIcon="📆" emptyMessage="Aún no hay sesiones agendadas." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Sesión' : 'Agendar Sesión'} fields={ptSessionFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agendar')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Sesión')} />
      <ConfirmModal open={!!c.confirm} message={`¿Cancelar esta sesión de ${c.confirm?.memberName}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Sesión')} />
    </>
  )
}

/* ================= Progreso ================= */
export function Progress() {
  const c = useCrud('progress')
  const columns = [
    { key: 'memberName', label: 'Miembro' },
    { key: 'date', label: 'Fecha' },
    { key: 'weight', label: 'Peso', render: r => `${r.weight} lbs` },
    { key: 'bodyFatPct', label: '% Grasa Corporal', render: r => r.bodyFatPct ? `${r.bodyFatPct}%` : '—' },
    { key: 'notes', label: 'Notas' },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Seguimiento de Progreso" subtitle={`${c.rows.length} registros`} columns={columns} rows={c.rows}
        searchKeys={['memberName']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Registrar Progreso" emptyIcon="📈" emptyMessage="Aún no hay registros de progreso." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Registro' : 'Registrar Progreso'} fields={progressFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Registrar')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Registro de progreso')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar este registro de ${c.confirm?.memberName}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Registro')} />
    </>
  )
}

/* ================= Prospectos ================= */
export function Leads() {
  const c = useCrud('leads')
  const columns = [
    { key: 'name', label: 'Prospecto', render: r => <div><div className="cell-strong">{r.name}</div><div className="cell-muted">{r.source}</div></div> },
    { key: 'interestedPlan', label: 'Plan de Interés' },
    { key: 'followUpDate', label: 'Seguimiento' },
    { key: 'status', label: 'Estado', render: r => (
      <span className={`badge ${r.status === 'Convertido' ? 'badge-success' : r.status === 'Perdido' ? 'badge-danger' : r.status === 'Prueba agendada' ? 'badge-info' : 'badge-warning'}`}>{r.status}</span>
    ) },
  ]
  return (
    <>
      <ReadOnlyBanner editable={c.editable} role={c.role} />
      <DataTable title="Prospectos" subtitle={`${c.rows.length} prospectos`} columns={columns} rows={c.rows}
        searchKeys={['name', 'source', 'interestedPlan']} onAdd={c.editable ? c.openAdd : undefined} onEdit={c.editable ? c.openEdit : undefined} onDelete={c.editable ? c.askDelete : undefined}
        addLabel="Agregar Consulta" emptyIcon="🎯" emptyMessage="Aún no hay consultas." />
      <FormModal open={c.modal.open} title={c.modal.editing ? 'Editar Consulta' : 'Agregar Consulta'} fields={leadFields}
        values={c.modal.editing || {}} submitLabel={c.saving ? 'Guardando…' : (c.modal.editing ? 'Guardar cambios' : 'Agregar consulta')}
        onClose={c.close} onSubmit={(v) => c.submit(v, 'Consulta')} />
      <ConfirmModal open={!!c.confirm} message={`¿Eliminar a ${c.confirm?.name}?`} onCancel={() => c.setConfirm(null)} onConfirm={() => c.confirmDelete('Consulta')} />
    </>
  )
}
