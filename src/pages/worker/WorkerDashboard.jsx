import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllComplaints, getWorkers, assignWorker } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'

const CAT_ICON = { GARBAGE:'🗑️', ROAD:'🛣️', WATER:'💧', ELECTRICITY:'⚡', STREETLIGHT:'💡', OTHER:'📌' }

export default function AssignWorker() {
  const { user, authHeader } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [workers,    setWorkers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState({})
  const [assigning,  setAssigning]  = useState(null)
  const [msg,        setMsg]        = useState('')

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      getAllComplaints(user.id, authHeader()),
      getWorkers(authHeader())
    ]).then(([c, w]) => {
      setComplaints((c || []).filter(x => x.status === 'PENDING'))
      setWorkers(w || [])
    }).catch(()=>{}).finally(() => setLoading(false))
  }, [])

  async function handleAssign(complainId) {
    const workerId = selected[complainId]
    if (!workerId) { setMsg('❌ Please select a worker first.'); return }
    setAssigning(complainId)
    try {
      await assignWorker(complainId, workerId, authHeader())
      setComplaints(prev => prev.filter(c => c.id !== complainId))
      setMsg('✅ Worker assigned successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) { setMsg(`❌ Failed: ${e.message}`) }
    finally { setAssigning(null) }
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Assign Workers" />
        <div className="page fade-in">

          <div className="page-header">
            <div className="page-title">👷 Assign Workers</div>
            <div className="page-sub">{complaints.length} pending complaints need assignment</div>
          </div>

          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

          {/* Workers list */}
          {workers.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div className="section-header">
                <div className="section-title">Available Workers ({workers.length})</div>
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {workers.map(w => (
                  <div key={w.id} style={{ background:'var(--navy-card)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--green-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', color:'var(--green)' }}>
                      {w.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{w.name}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>{w.email}</div>
                    </div>
                  </div>
                ))}
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
                <span className="badge badge-yellow">⏳ Pending</span>
                <span className="badge badge-gray">{CAT_ICON[c.category]} {c.category}</span>
              </div>
              <div className="complaint-title">{c.title}</div>
              <div className="complaint-desc">{c.description}</div>
              <div className="complaint-footer" style={{ marginBottom:12 }}>
                <span>📍 {c.ward || c.pincode || 'No location'}</span>
                <span>🗓️ {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</span>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <select className="form-input" style={{ maxWidth:260 }}
                  value={selected[c.id] || ''}
                  onChange={e => setSelected(p => ({ ...p, [c.id]: e.target.value }))}>
                  <option value="">— Select Worker —</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm"
                  disabled={!selected[c.id] || assigning === c.id}
                  onClick={() => handleAssign(c.id)}>
                  {assigning === c.id
                    ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Assigning...</>
                    : '✅ Assign'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}