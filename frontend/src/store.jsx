import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api } from './api.js'

/* Colecciones -> endpoint de la API */
const ENDPOINTS = {
  members: '/members',
  plans: '/plans',
  checkins: '/checkins',
  classes: '/classes',
  payments: '/payments',
  equipment: '/equipment',
  trainers: '/trainers',
  ptSessions: '/pt-sessions',
  progress: '/progress',
  leads: '/leads',
}
const COLLECTIONS = Object.keys(ENDPOINTS)

/* ================= Data store (respaldado por la API/PostgreSQL) ================= */
const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(() => Object.fromEntries(COLLECTIONS.map(c => [c, []])))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  const refetch = useCallback(async (collection) => {
    const rows = await api.get(ENDPOINTS[collection])
    if (mounted.current) setData(prev => ({ ...prev, [collection]: rows }))
    return rows
  }, [])

  const refetchAll = useCallback(async () => {
    const entries = await Promise.all(COLLECTIONS.map(async c => [c, await api.get(ENDPOINTS[c])]))
    if (mounted.current) setData(Object.fromEntries(entries))
  }, [])

  useEffect(() => {
    mounted.current = true
    refetchAll().then(() => setLoading(false)).catch(err => { setError(err.message); setLoading(false) })

    // Actualización automática cada 15s, para ver cambios hechos por otra
    // persona (ej. un compañero de trabajo) desde otro dispositivo.
    const interval = setInterval(() => { refetchAll().catch(() => {}) }, 15000)
    return () => { mounted.current = false; clearInterval(interval) }
  }, [refetchAll])

  const get = useCallback((collection) => data[collection] || [], [data])

  const add = useCallback(async (collection, item) => {
    await api.post(ENDPOINTS[collection], item)
    await refetch(collection)
    if (collection === 'members' || collection === 'classes') await refetch('plans').catch(() => {})
  }, [refetch])

  const update = useCallback(async (collection, id, patch) => {
    const current = (data[collection] || []).find(it => it.id === id) || {}
    await api.put(`${ENDPOINTS[collection]}/${id}`, { ...current, ...patch })
    await refetch(collection)
  }, [data, refetch])

  const remove = useCallback(async (collection, id) => {
    await api.del(`${ENDPOINTS[collection]}/${id}`)
    await refetch(collection)
  }, [refetch])

  const resetAll = useCallback(async () => {
    await api.post('/reset', {})
    await refetchAll()
  }, [refetchAll])

  return (
    <DataContext.Provider value={{ data, get, add, update, remove, resetAll, refetch, loading, error }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

/* ================= Notificaciones (toast) ================= */
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'default' ? '' : t.type}`}>
            <span>{t.type === 'success' ? '✅' : t.type === 'danger' ? '⚠️' : 'ℹ️'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
