import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, sendOtp } from '../services/api'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', pinCode: ''
  })
  const [otp, setOtp] = useState('')
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')
  const [loading,     setLoading]     = useState(false)

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  
  async function handleSendOtp() {
    if (!form.email) {
      setError('Please enter your email first'); return
    }
    setError(''); setSuccess('')
    setLoading(true)
    try {
      await sendOtp(form.email)
      setOtpSent(true)
      setShowOtpStep(true)
      setSuccess('✅ OTP sent to your email!')
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  
  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.'); return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (!otp) {
      setError('Please enter the OTP sent to your email'); return
    }

    setLoading(true)
    try {
      await registerUser({
        name:        form.name,
        email:       form.email,
        password:    form.password,
        phoneNumber: form.phoneNumber,
        pinCode:     form.pinCode,
        otp:         otp
      })

      setSuccess('✅ Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1800)

    } catch (err) {
      setError(err.message || 'Registration failed. Try again.')
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
            <div style={{ fontSize:'0.63rem', color:'var(--text-3)', letterSpacing:'0.06em' }}>Citizen Registration</div>
          </div>
        </div>

        <div className="auth-title">Create account</div>
        <div className="auth-sub">Register to report issues in your city</div>

        {error   && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" name="name"
              placeholder="Rakesh Pal"
              value={form.name} onChange={handleChange} />
          </div>

          {/* Email + Send OTP Button */}
          <div className="form-group">
            <label className="form-label">Email *</label>
            <div style={{ display:'flex', gap:8 }}>
              <input className="form-input" type="email" name="email"
                placeholder="smartcity@gmail.com"
                value={form.email} onChange={handleChange}
                style={{ flex:1 }} />
              <button type="button" className="btn btn-secondary"
                onClick={handleSendOtp}
                disabled={loading || !form.email}
                style={{ whiteSpace:'nowrap' }}>
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* OTP Input -appears after Send OTP */}
          {showOtpStep && (
            <div className="form-group">
              <label className="form-label">Enter OTP *</label>
              <input className="form-input" name="otp"
                placeholder="123456"
                value={otp} onChange={(e) => setOtp(e.target.value)}
                maxLength={6} />
              <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:4 }}>
                Check your email for the 6-digit code
              </div>
            </div>
          )}

          {/* Password + Confirm */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position:'relative' }}>
                <input className="form-input"
                  type={showPass ? 'text' : 'password'}
                  name="password" placeholder="Min 6 chars"
                  value={form.password} onChange={handleChange}
                  style={{ paddingRight:40 }} />
                <button type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'0.9rem' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position:'relative' }}>
                <input className="form-input"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword" placeholder="Repeat"
                  value={form.confirmPassword} onChange={handleChange}
                  style={{ paddingRight:40 }} />
                <button type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'0.9rem' }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          {/* Phone + Pincode */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="phoneNumber"
                placeholder="+91 98765 43210"
                value={form.phoneNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Pin Code</label>
              <input className="form-input" name="pinCode"
                placeholder="700001"
                value={form.pinCode} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center', marginTop:4 }}
            disabled={loading || !showOtpStep}>
            {loading
              ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Creating...</>
              : 'Create Account →'}
          </button>

        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>

      </div>
    </div>
  )
}