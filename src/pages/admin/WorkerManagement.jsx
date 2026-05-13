import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getWorkersByAdmin, createWorker } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'

const CAT_ICON = { ROAD:'🛣️', GARBAGE:'🗑️', STREET_LIGHT:'💡', WATER:'💧' }

export default function WorkerManagement() {
  const { user, authHeader } = useAuth()
  const [workers,  setWorkers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [msg,      setMsg]      = useState('')
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    name:'', email:'', password:'',
    phoneNumber:'', adminId: ''
  })

  useEffect(() => {
    if (!user?.id) return
    setForm(p => ({ ...p, adminId: user.id }))
    getWorkersByAdmin(user.id, authHeader())
      .then(w => setWorkers(w || []))
      .catch(()=>{}).finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleCreate(e) {
  e.preventDefault()
  if (!form.name || !form.email || !form.password || !form.phoneNumber) {
    setMsg('❌ Name, email, password and phone are required.'); return
  }
  setCreating(true)
  setMsg('')
  try {
    const w = await createWorker({ 
      ...form, 
      adminId: user.id,
      pinCode: user?.pinCode || '731234' 
    }, authHeader())
    
    setWorkers(prev => [...prev, w])
    setMsg('✅ Worker created successfully!')
    setForm({ name:'', email:'', password:'', phoneNumber:'', adminId: user.id })
    setShowForm(false)
    setTimeout(() => setMsg(''), 3000)
  } catch (e) {
    console.error('Create Worker Error:', e)
    setMsg(`❌ ${e.message || 'Failed to create worker'}`)
  } finally {
    setCreating(false)
  }
}
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Worker Management" />
        <div className="page fade-in">

          <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div className="page-title">👷 Worker Management</div>
              <div className="page-sub">{workers.length} workers under your supervision</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
              {showForm ? '✕ Cancel' : '➕ Add Worker'}
            </button>
          </div>

          {msg && (
            <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
              {msg}
            </div>
          )}

          {/* Create worker form */}
          {showForm && (
            <div className="card" style={{ marginBottom:24 }}>
              <div className="section-title" style={{ marginBottom:16 }}>Create New Worker</div>
              <form onSubmit={handleCreate}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" name="name"
                      placeholder="Worker Name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" name="email"
                      placeholder="worker@gmail.com" value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="form-input" type="password" name="password"
                      placeholder="Min 6 chars" value={form.password} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-input" name="phoneNumber"
                      placeholder="+91 98765 43210" value={form.phoneNumber} onChange={handleChange} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating
                      ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Creating...</>
                      : '✅ Create Worker'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workers grid */}
          {loading ? (
            <div className="loading-center"><span className="spinner" /> Loading workers...</div>
          ) : workers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👷</div>
              <div className="empty-text">No workers yet. Add your first worker!</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
              {workers.map(w => {
                const initials = w.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
                return (
                  <div key={w.id} className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{
                        width:46, height:46, borderRadius:'50%',
                        background:'var(--green-bg)',
                        border:'2px solid rgba(34,197,94,0.3)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontWeight:700, fontSize:'0.9rem', color:'var(--green)',
                        flexShrink:0
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{w.name}</div>
                        <span className="badge badge-green" style={{ fontSize:'0.62rem' }}>👷 WORKER</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'var(--text-2)' }}>
                        <span>✉️</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'0.75rem' }}>{w.email}</span>
                      </div>
                      {w.phoneNumber && (
                        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'var(--text-2)' }}>
                          <span>📞</span>
                          <span>{w.phoneNumber}</span>
                        </div>
                      )}
                      {w.pinCode && (
                        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'var(--text-2)' }}>
                          <span>📍</span>
                          <span>Pin: {w.pinCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}