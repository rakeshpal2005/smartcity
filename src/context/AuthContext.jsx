import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)   
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app start — restore from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('cityfix_token')
    const savedUser  = localStorage.getItem('cityfix_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // Called after successful login
  function login(userData, jwtToken) {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('cityfix_token', jwtToken)
    localStorage.setItem('cityfix_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('cityfix_token')
    localStorage.removeItem('cityfix_user')
  }

  // Helper — attach JWT to any fetch call
  function authHeader() {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}