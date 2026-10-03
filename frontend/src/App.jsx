import React, { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Sidebar, Topbar, ConfirmModal } from './components/UI.jsx'
import { DataProvider, ToastProvider, useData, useToast } from './store.jsx'
import { AuthProvider, useAuth } from './auth.jsx'
import { RoleProvider, useRole, ROLES } from './roleContext.jsx'
import Login from './pages/Login.jsx'
import * as Pages from './pages/Pages.jsx'

const APP = { name: 'PulseFit', tagline: 'Gestión de Gimnasio', icon: '🏋️' }

const NAV = [
  { label: 'Resumen', items: [{ path: '/', icon: '📊', label: 'Panel' }] },
  {
    label: 'Miembros',
    items: [
      { path: '/members', icon: '🧑‍🤝‍🧑', label: 'Miembros' },
      { path: '/plans', icon: '🎫', label: 'Planes' },
      { path: '/checkins', icon: '🚪', label: 'Registros de Entrada' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { path: '/classes', icon: '🧘', label: 'Clases' },
      { path: '/payments', icon: '💳', label: 'Pagos' },
      { path: '/equipment', icon: '🏋️‍♀️', label: 'Equipamiento' },
    ],
  },
  {
    label: 'Entrenamiento y Prospectos',
    items: [
      { path: '/trainers', icon: '🥇', label: 'Entrenadores' },
      { path: '/pt-sessions', icon: '📆', label: 'Sesiones Personales' },
      { path: '/progress', icon: '📈', label: 'Progreso' },
      { path: '/leads', icon: '🎯', label: 'Prospectos' },
    ],
  },
]

const META = {
  '/': { title: 'Panel', sub: 'Resumen general del gimnasio' },
  '/members': { title: 'Miembros', sub: 'Directorio de miembros y estado' },
  '/plans': { title: 'Planes', sub: 'Tarifas y beneficios de membresía' },
  '/checkins': { title: 'Registros de Entrada', sub: 'Actividad diaria en el gimnasio' },
  '/classes': { title: 'Clases', sub: 'Programación de clases grupales' },
  '/payments': { title: 'Pagos', sub: 'Estado de pagos de membresía' },
  '/equipment': { title: 'Equipamiento', sub: 'Existencias y estado del equipo' },
  '/trainers': { title: 'Entrenadores', sub: 'Directorio del equipo de entrenamiento' },
  '/pt-sessions': { title: 'Sesiones Personales', sub: 'Reservas de entrenamiento personalizado' },
  '/progress': { title: 'Progreso', sub: 'Seguimiento de miembros en el tiempo' },
  '/leads': { title: 'Prospectos', sub: 'Personas interesadas en un plan' },
}

function Shell() {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { resetAll } = useData()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const { role, setRole } = useRole()
  const loc = useLocation()
  const meta = META[loc.pathname] || META['/']

  return (
    <>
      <Sidebar appName={APP.name} tagline={APP.tagline} icon={APP.icon} nav={NAV} open={open} />
      <div className="main">
        <Topbar
          title={meta.title} subtitle={meta.sub} user={user}
          onMenuToggle={() => setOpen(o => !o)} onReset={() => setConfirmOpen(true)} onLogout={logout}
          role={role} onRoleChange={setRole} roles={ROLES}
        />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Pages.Dashboard />} />
            <Route path="/members" element={<Pages.Members />} />
            <Route path="/plans" element={<Pages.Plans />} />
            <Route path="/checkins" element={<Pages.Checkins />} />
            <Route path="/classes" element={<Pages.Classes />} />
            <Route path="/payments" element={<Pages.Payments />} />
            <Route path="/equipment" element={<Pages.Equipment />} />
            <Route path="/trainers" element={<Pages.Trainers />} />
            <Route path="/pt-sessions" element={<Pages.PTSessions />} />
            <Route path="/progress" element={<Pages.Progress />} />
            <Route path="/leads" element={<Pages.Leads />} />
          </Routes>
        </main>
      </div>
      <ConfirmModal
        open={confirmOpen}
        message="Esto restaurará los datos de demostración originales en el servidor (para todos los que usan la app). ¿Continuar?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => { await resetAll(); toast('Datos de demostración restablecidos', 'info'); setConfirmOpen(false) }}
      />
    </>
  )
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="auth-loading">Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Root() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <RequireAuth>
          <DataProvider>
            <ToastProvider>
              <Shell />
            </ToastProvider>
          </DataProvider>
        </RequireAuth>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <Root />
      </RoleProvider>
    </AuthProvider>
  )
}
