import React, { createContext, useContext, useState, useEffect } from 'react'

// Roles dentro de UNA sola cuenta — no es un login distinto, es una vista.
// "Gerente" ve y edita todo. Los demás roles tienen partes bloqueadas
// (los botones de agregar/editar/eliminar se ocultan donde no les toca).
export const ROLES = ['Gerente', 'Administrador', 'Entrenador']

// Qué colección puede EDITAR cada rol. null = todas (Gerente).
const EDITABLE_BY_ROLE = {
  Gerente: null,
  Administrador: ['members', 'plans', 'checkins', 'payments', 'leads', 'equipment', 'classes', 'ptSessions', 'progress'],
  Entrenador: ['checkins', 'classes', 'ptSessions', 'progress'],
}

export function canEdit(role, collection) {
  const allowed = EDITABLE_BY_ROLE[role]
  return allowed === null || allowed === undefined ? true : allowed.includes(collection)
}

const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('pulsefit_role') || 'Gerente')
  useEffect(() => { localStorage.setItem('pulsefit_role', role) }, [role])
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
