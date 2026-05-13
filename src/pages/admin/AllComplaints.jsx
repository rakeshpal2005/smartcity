import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getComplaintsByPincode, updateComplaintStatus } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'

const STATUS_CLS = {
  SUBMITTED:    'badge badge-blue',
  UNDER_REVIEW: 'badge badge-yellow',
  ASSIGNED:     'badge badge-purple',
  IN_PROGRESS:  'badge badge-blue',
  RESOLVED:     'badge badge-green',
  REJECTED:     'badge badge-red',
}
const CAT_ICON = { ROAD:'🛣️', GARBAGE:'🗑️', STREET_LIGHT:'💡', WATER:'💧' }

const NEXT_STATUSES = {
  SUBMITTED:    ['UNDER_REVIEW', 'REJECTED'],  
  UNDER_REVIEW: ['ASSIGNED', 'REJECTED'],      
  ASSIGNED:     ['REJECTED'],                 
  IN_PROGRESS:  ['REJECTED'],                 
  RESOLVED:     [],                            
  REJECTED:     [],                           
}

function ImageToggle({ images }) {
  const [active, setActive] = useState(null)
  const before = images.find(img => img.imageType === 'BEFORE')
  const after  = images.find(img => img.imageType === 'AFTER')
  const current = active === 'BEFORE' ? before : active === 'AFTER' ? after : null

  if (!before && !after) return null

  return (
    <div style={{ marginTop:12 }}>
      <div style={{ display:'flex', gap:8, marginBottom: current ? 10 : 0 }}>
        {before && (
          <button
            className={`btn btn-sm ${active === 'BEFORE' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActive(active === 'BEFORE' ? null : 'BEFORE')}>
            📷 Before Image
          </button>
        )}
        {after && (
          <button
            className={`btn btn-sm ${active === 'AFTER' ? 'btn-success' : 'btn-outline'}`}
            onClick={() => setActive(active === 'AFTER' ? null : 'AFTER')}>
            ✅ After Image
          </button>
        )}
      </div>
     {current && (
  <img
    src={`https://smartcity-backend-yp2d.onrender.com${current.imageUrl}`}
    alt={active}
    style={{ width:160, height:160, objectFit:'cover', borderRadius:8, border:`2px solid ${active === 'AFTER' ? 'var(--green)' : 'var(--blue)'}`, marginTop:8 }}
  />
)}
    </div>
  )
}

export default function AllComplaints() {
  const { user, authHeader } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filterStatus, setFilter]  = useState('ALL')
  const [filterCat,  setFilterCat] = useState('ALL')
  const [search,     setSearch]    = useState('')
  const [updating,   setUpdating]  = useState(null)
  const [msg,        setMsg]       = useState('')

  useEffect(() => {
    if (!user?.pinCode) { setLoading(false); return }

    //  Directly fetch by admin's pinCode
    getComplaintsByPincode(user.pinCode, authHeader())
      .then(data => setComplaints(data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  async function changeStatus(id, status) {
    setUpdating(id)
    try {
      await updateComplaintStatus(id, status, '', authHeader())
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c))
      setMsg(`✅ Status changed to ${status.replace('_',' ')}`)
      setTimeout(() => setMsg(''), 3000)
    } catch (e) { setMsg(`❌ ${e.message}`) }
    finally { setUpdating(null) }
  }

  const filtered = complaints.filter(c => {
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
    const matchCat    = filterCat === 'ALL'    || c.category === filterCat
    const matchSearch = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchCat && matchSearch
  })

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="All Complaints" />
        <div className="page fade-in">

          <div className="page-header">
            <div className="page-title">All Complaints</div>
            <div className="page-sub">{complaints.length} total in your area · {filtered.length} shown</div>
          </div>

          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

          {/* Filters */}
          <div className="filter-bar">
            <input className="form-input" style={{ maxWidth:240 }}
              placeholder="🔍 Search title, citizen..."
              value={search} onChange={e => setSearch(e.target.value)} />

            <select className="form-input" style={{ maxWidth:160 }}
              value={filterStatus} onChange={e => setFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              {['SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','REJECTED'].map(s => (
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              ))}
            </select>

            <select className="form-input" style={{ maxWidth:160 }}
              value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="ALL">All Categories</option>
              {['ROAD','GARBAGE','STREET_LIGHT','WATER'].map(c => (
                <option key={c} value={c}>{CAT_ICON[c]} {c.replace('_',' ')}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading-center"><span className="spinner" /> Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No complaints match your filters.</div>
            </div>
          ) : filtered.map(c => (
            <div key={c.id} className="complaint-card">
              <div className="complaint-meta">
                <span className="complaint-id">#{c.id}</span>
                <span className={STATUS_CLS[c.status] || 'badge badge-gray'}>{c.status?.replace('_',' ')}</span>
                <span className="badge badge-gray">{CAT_ICON[c.category]} {c.category?.replace('_',' ')}</span>
                {c.assignedWorker && <span className="badge badge-purple">👷 {c.assignedWorker.name}</span>}
              </div>
             
              <div className="complaint-title">{c.title}</div>
<div className="complaint-desc">{c.description}</div>


{/* Footer + Image side by side */}
<div style={{ marginTop:12, display:'flex', gap:16, alignItems:'flex-start' }}>

  {/* Left — footer info + buttons */}
  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
    <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
      👤 Citizen: <strong style={{ color:'#ffffff' }}>{c.user?.name || '—'}</strong>
    </span>
    <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
      📍 Address: <strong style={{ color:'#ffffff' }}>{c.exactAddress || '—'}</strong>
    </span>
    {c.landMark && (
      <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
        🏷️ Landmark: <strong style={{ color:'#ffffff' }}>{c.landMark}</strong>
      </span>
    )}
    {c.areaName && (
      <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
        🗺️ Area: <strong style={{ color:'#ffffff' }}>{c.areaName}, {c.pinCode}</strong>
      </span>
    )}
    <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
      🗓️ Date: <strong style={{ color:'#7eb8f7' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</strong>
    </span>

    {/* Buttons below footer */}
    {c.complaintImages?.length > 0 && (
      <ImageToggle images={c.complaintImages} />
    )}
  </div>

</div>

              {/* Status change buttons */}
              {NEXT_STATUSES[c.status]?.length > 0 && (
                <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>Move to:</span>
                  {NEXT_STATUSES[c.status].map(s => (
                    <button key={s}
                      className={`btn btn-sm ${s==='RESOLVED'?'btn-success':s==='REJECTED'?'btn-danger':'btn-outline'}`}
                      disabled={updating === c.id}
                      onClick={() => changeStatus(c.id, s)}>
                      {updating === c.id ? '...' : s.replace('_',' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}