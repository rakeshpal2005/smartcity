import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getComplaintsByPincode, getWorkersByAdmin, assignWorker, updateComplaintStatus } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'

const CAT_ICON = { ROAD:'🛣️', GARBAGE:'🗑️', STREET_LIGHT:'💡', WATER:'💧' }

const STATUS_CLS = {
  SUBMITTED:    'badge badge-blue',
  UNDER_REVIEW: 'badge badge-yellow',
  ASSIGNED:     'badge badge-purple',
  IN_PROGRESS:  'badge badge-blue',
  RESOLVED:     'badge badge-green',
  REJECTED:     'badge badge-red',
}

export default function AssignWorker() {
  const { user, authHeader } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [workers,    setWorkers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]  = useState({})
  const [assigning,  setAssigning] = useState(null)
  const [msg,        setMsg]       = useState('')

  useEffect(() => {
    if (!user?.pinCode || !user?.id) { setLoading(false); return }

    Promise.all([
      // Directly fetch by admin's pinCode
      getComplaintsByPincode(user.pinCode, authHeader())
        .then(data => (data || []).filter(x => !x.assignedWorker && x.status !== 'RESOLVED' && x.status !== 'REJECTED')),
      getWorkersByAdmin(user.id, authHeader())
    ]).then(([c, w]) => {
      setComplaints(c)
      setWorkers(w || [])
    }).catch(()=>{}).finally(() => setLoading(false))
  }, [])

  async function handleAssign(complainId) {
    const workerId = selected[complainId]
    if (!workerId) { setMsg('❌ Please select a worker first.'); return }

    setAssigning(complainId)
    try {
      await assignWorker(complainId, workerId, authHeader())
      await updateComplaintStatus(complainId, 'ASSIGNED', 'Worker assigned by admin', authHeader())
      setComplaints(prev => prev.filter(c => c.id !== complainId))
      setMsg('✅ Worker assigned & status updated to ASSIGNED!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      setMsg(`❌ Failed: ${e.message}`)
    } finally {
      setAssigning(null)
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Assign Workers" />
        <div className="page fade-in">

          <div className="page-header">
            <div className="page-title">🎯 Assign Workers</div>
            <div className="page-sub">{complaints.length} unassigned complaints in your area</div>
          </div>

          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

          {/* Workers summary bar */}
          {workers.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>
                Your Workers ({workers.length})
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {workers.map(w => {
                  const ini = w.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
                  return (
                    <div key={w.id} style={{
                      background:'var(--navy-card)', border:'1px solid var(--border)',
                      borderRadius:8, padding:'10px 14px',
                      display:'flex', alignItems:'center', gap:10
                    }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--green-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', color:'var(--green)' }}>
                        {ini}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.84rem' }}>{w.name}</div>
                        <div style={{ fontSize:'0.68rem', color:'var(--text-3)' }}>{w.phoneNumber || w.email}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading-center"><span className="spinner" /> Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-text">All complaints are assigned!</div>
            </div>
          ) : complaints.map(c => (
            <div key={c.id} className="complaint-card">
              <div className="complaint-meta">
                <span className="complaint-id">#{c.id}</span>
                <span className={STATUS_CLS[c.status] || 'badge badge-gray'}>{c.status?.replace('_',' ')}</span>
                <span className="badge badge-gray">{CAT_ICON[c.category]} {c.category?.replace('_',' ')}</span>
              </div>
              <div className="complaint-title">{c.title}</div>
              <div className="complaint-desc">{c.description}</div>
              <div className="complaint-footer" style={{ marginBottom:14 }}>
                <span>👤 <strong>{c.user?.name || 'Citizen'}</strong></span>
                <span>📍 {c.exactAddress || '—'}</span>
                <span>🗓️ {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</span>
              </div>

              {/* Assign row */}
              {workers.length === 0 ? (
                <div className="alert alert-info" style={{ marginTop:8 }}>
                  ⚠️ No workers under your account. Go to Workers page to add workers first.
                </div>
              ) : (
                <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                  <select className="form-input" style={{ maxWidth:280 }}
                    value={selected[c.id] || ''}
                    onChange={e => setSelected(p => ({ ...p, [c.id]: e.target.value }))}>
                    <option value="">— Select a Worker —</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.phoneNumber || w.email}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-primary btn-sm"
                    disabled={!selected[c.id] || assigning === c.id}
                    onClick={() => handleAssign(c.id)}>
                    {assigning === c.id
                      ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Assigning...</>
                      : '✅ Assign Worker'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}