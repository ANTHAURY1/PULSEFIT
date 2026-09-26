import React, { useMemo, useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'

/* ---------------- helpers ---------------- */
export function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
export function money(n) {
  return '$' + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

/* ---------------- Sidebar ---------------- */
export function Sidebar({ appName, tagline, icon, nav, open }) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <div className="logo-mark">{icon}</div>
        <div className="brand-text"><strong>{appName}</strong><span>{tagline}</span></div>
      </div>
      <nav className="sidebar-nav">
        {nav.map((section, i) => (
          <div key={i}>
            {section.label && <div className="nav-section-label">{section.label}</div>}
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span className="nav-ic">{item.icon}</span><span>{item.label}</span>
                {item.badge != null && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">© {new Date().getFullYear()} {appName}<br />Conectado a la base de datos en vivo</div>
    </aside>
  )
}

/* ---------------- Topbar ---------------- */
export function Topbar({ title, subtitle, user, onMenuToggle, onReset, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuToggle}>☰</button>
        <div>
          <div className="page-title">{title}</div>
          <div className="page-subtitle">{subtitle}</div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="search-box"><span>🔍</span><input placeholder="Búsqueda rápida…" /></div>
        <button className="icon-btn" title="Notificaciones">🔔<span className="dot"></span></button>
        <button className="icon-btn" title="Restablecer datos de demostración" onClick={onReset}>↺</button>
        <div className="user-chip">
          <div className="avatar">{user?.full_name ? initials(user.full_name) : 'AD'}</div>
          <div><div className="u-name">{user?.full_name || 'Usuario'}</div><div className="u-role">{user?.role || ''}</div></div>
        </div>
        <button className="icon-btn" title="Cerrar sesión" onClick={onLogout}>⏻</button>
      </div>
    </header>
  )
}

/* ---------------- StatCard ---------------- */
export function StatCard({ icon, iconBg, iconColor, value, label, trend }) {
  return (
    <div className="card stat-card">
      <div className="stat-top">
        <div className="stat-ic" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        {trend && (
          <span className={`stat-trend ${trend.dir === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trend.dir === 'up' ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

/* ---------------- DataTable ---------------- */
export function DataTable({
  columns, rows, searchKeys = [], onEdit, onDelete, onAdd, addLabel = 'Agregar',
  title, subtitle, emptyIcon = '🗂️', emptyMessage = 'Aún no hay registros.', extra,
}) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    if (!q) return rows
    const lower = q.toLowerCase()
    return rows.filter(r => searchKeys.some(k => String(r[k] ?? '').toLowerCase().includes(lower)))
  }, [rows, q, searchKeys])

  return (
    <div className="card">
      <div className="toolbar">
        <div>
          {title && <div className="card-title">{title}</div>}
          {subtitle && <div className="card-sub">{subtitle}</div>}
        </div>
        <div className="toolbar-actions" style={{ alignItems: 'center' }}>
          {searchKeys.length > 0 && (
            <div className="toolbar-search"><span>🔍</span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…" />
            </div>
          )}
          {extra}
          {onAdd && <button className="btn btn-primary" onClick={onAdd}>+ {addLabel}</button>}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="e-ic">{emptyIcon}</div><div>{emptyMessage}</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}{(onEdit || onDelete) && <th></th>}</tr></thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
                  {(onEdit || onDelete) && (
                    <td><div className="row-actions">
                      {onEdit && <button className="btn btn-outline btn-sm btn-icon" title="Editar" onClick={() => onEdit(row)}>✎</button>}
                      {onDelete && <button className="btn btn-danger btn-sm btn-icon" title="Eliminar" onClick={() => onDelete(row)}>🗑</button>}
                    </div></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------- FormModal ---------------- */
export function FormModal({ open, title, fields, values, submitLabel = 'Guardar', onClose, onSubmit }) {
  const [form, setForm] = useState(values || {})
  const wasOpen = useRef(false)
  useEffect(() => {
    // Solo reiniciamos el formulario cuando el modal pasa de cerrado a
    // abierto — así la actualización automática de datos en segundo plano
    // (cada 15s) no te borra lo que llevas escrito mientras el modal sigue
    // abierto.
    if (open && !wasOpen.current) setForm(values || {})
    wasOpen.current = open
  }, [open, values])

  if (!open) return null

  function set(name, val) { setForm(f => ({ ...f, [name]: val })) }

  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header"><h3>{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}>
          <div className="modal-body">
            {fields.map(f => (
              <div className="field" key={f.name}>
                <label>{f.label}</label>
                {f.type === 'select' ? (
                  <select required={f.required} value={form[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}>
                    {f.placeholder && <option value="">{f.placeholder}</option>}
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea required={f.required} value={form[f.name] ?? ''} placeholder={f.placeholder}
                    onChange={e => set(f.name, e.target.value)} />
                ) : (
                  <input
                    type={f.type || 'text'} required={f.required} step={f.step}
                    value={form[f.name] ?? ''} placeholder={f.placeholder}
                    onChange={e => set(f.name, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                  />
                )}
                {f.hint && <div className="field-hint">{f.hint}</div>}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------------- ConfirmModal ---------------- */
export function ConfirmModal({ open, message, onCancel, onConfirm }) {
  if (!open) return null
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal">
        <div className="modal-header"><h3>Confirmar</h3><button className="modal-close" onClick={onCancel}>✕</button></div>
        <div className="modal-body"><p style={{ fontSize: 13.6, color: 'var(--text-muted)' }}>{message}</p></div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Sí, continuar</button>
        </div>
      </div>
    </div>
  )
}

/* Alias usado por el modal de inscripción de clases */
export const modalBackdropClass = 'overlay'

/* ---------------- Charts (sin dependencias externas) ---------------- */
export function BarChart({ data, colorVar = 'var(--primary)' }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 220, padding: '10px 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{d.value}</div>
          <div style={{
            width: '100%', maxWidth: 34, height: Math.max((d.value / max) * 160, 4),
            background: d.color || colorVar, borderRadius: 6, transition: 'height .3s',
          }} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({ data, size = 176 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let acc = 0
  const r = size / 2 - 16
  const c = size / 2
  const circumference = 2 * Math.PI * r
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const frac = d.value / total
          const dash = frac * circumference
          const el = (
            <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={d.color} strokeWidth={18}
              strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-acc}
              transform={`rotate(-90 ${c} ${c})`} strokeLinecap="butt" />
          )
          acc += dash
          return el
        })}
        <circle cx={c} cy={c} r={r - 22} fill="var(--card-bg)" />
        <text x={c} y={c + 5} textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--text)">{total}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>{d.label}</span><strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
