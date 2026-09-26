import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('pulsefit_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pulsefit_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => { setUser(null); localStorage.removeItem('pulsefit_token'); localStorage.removeItem('pulsefit_user') })
      .finally(() => setLoading(false))
  }, [])

  async function login(username, password) {
    const { token, user } = await api.post('/auth/login', { username, password })
    localStorage.setItem('pulsefit_token', token)
    localStorage.setItem('pulsefit_user', JSON.stringify(user))
    setUser(user)
  }

  function logout() {
    localStorage.removeItem('pulsefit_token')
    localStorage.removeItem('pulsefit_user')
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
