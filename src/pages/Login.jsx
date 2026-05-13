import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill all fields.'); return }

    setLoading(true)
    try {
      const data = await loginUser(form.email, form.password)

      const roleMap = { USER:'CITIZEN', ADMIN:'ADMIN', WORKER:'WORKER' }
      const user = {
        id:          data.id,
        name:        data.name,
        email:       data.email,
        role:        roleMap[data.role] || data.role,
        phoneNumber: data.phoneNumber || '',
        pinCode:     data.pinCode     || '',
      }

      if (!data.token) throw new Error('No token received.')
      if (!user.role)  throw new Error('No role received.')

      login(user, data.token)

      const redirect = {
        CITIZEN: '/citizen/dashboard',
        ADMIN:   '/admin/dashboard',
        WORKER:  '/worker/dashboard',
      }
      navigate(redirect[user.role] || '/login')

    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div style={{ width:42, height:42, background:'var(--blue)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>🏙️</div>
          <div>
            <div style={{ fontWeight:700, fontSize:'1.15rem' }}>SmartCity</div>
            <div style={{ fontSize:'0.63rem', color:'var(--text-3)', letterSpacing:'0.06em' }}>City Management Portal</div>
          </div>
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your account to continue</div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange} autoFocus />
          </div>

        
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position:'absolute', right:12, top:'50%',
                  transform:'translateY(-50%)',
                  background:'none', border:'none',
                  color:'var(--text-3)', cursor:'pointer',
                  fontSize:'1rem', lineHeight:1,
                  padding:4,
                }}
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center', marginTop:8 }}
            disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Signing in...</>
              : 'Sign In →'}
          </button>
        </form>

        <div className="auth-footer">
          New citizen?{' '}
          <Link to="/register" className="auth-link">Create an account</Link>
        </div>

         

      </div>
    </div>
  )
}