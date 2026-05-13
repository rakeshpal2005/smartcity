import { useEffect, useState, useRef } from 'react'                    // ← added useRef
import { useAuth } from '../../context/AuthContext'
import { getMyJobs, updateComplaintStatus, getFeedbackByComplaint, uploadImage } from '../../services/api'  // ← added uploadImage
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'

const CAT_ICON = { GARBAGE:'🗑️', ROAD:'🛣️', WATER:'💧', ELECTRICITY:'⚡', STREETLIGHT:'💡', OTHER:'📌' }




//Image Toggle Component 
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


function JobFeedback({ complainId }) {
  const { authHeader } = useAuth()
  const [feedback, setFeedback] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getFeedbackByComplaint(complainId, authHeader())
      .then(data => {
        if (Array.isArray(data)) setFeedback(data[0] || null)
        else setFeedback(data || null)
      })
      .catch(() => setFeedback(null))
      .finally(() => setLoading(false))
  }, [complainId])

  if (loading) return null
  if (!feedback) return (
    <div style={{ marginTop:10, padding:'8px 12px', background:'var(--navy-card)', border:'1px solid var(--border)', borderRadius:6, fontSize:'0.78rem', color:'var(--text-3)' }}>
      ⭐ No feedback yet from citizen
    </div>
  )

  return (
    <div style={{ marginTop:10, padding:'10px 14px', background:'var(--navy-card)', border:'1px solid var(--border)', borderRadius:8 }}>
      <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:6 }}>⭐ Citizen Feedback</div>
      <div style={{ display:'flex', gap:2, marginBottom:6 }}>
        {[1,2,3,4,5].map(s => (
          <span key={s} style={{ fontSize:'1.1rem', color: s <= feedback.rating ? 'var(--yellow)' : 'var(--border)' }}>★</span>
        ))}
        <span style={{ fontSize:'0.75rem', color:'var(--text-3)', marginLeft:6, alignSelf:'center' }}>{feedback.rating}/5</span>
        {feedback.givenByName && (
          <span style={{ fontSize:'0.75rem', color:'var(--text-3)', marginLeft:'auto' }}>
            by <strong style={{ color:'var(--text-2)' }}>{feedback.givenByName}</strong>
          </span>
        )}
      </div>
      {feedback.comment && (
        <div style={{ fontSize:'0.8rem', color:'var(--text-2)', fontStyle:'italic' }}>"{feedback.comment}"</div>
      )}
    </div>
  )
}


export default function AssignedJobs() {
  const { user, authHeader } = useAuth()
  const [jobs,      setJobs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('ALL')
  const [acting,    setActing]    = useState(null)
  const [msg,       setMsg]       = useState('')
  const [noteModal, setNoteModal] = useState(null)
  const [note,      setNote]      = useState('')

  
  const fileRef                             = useRef()
  const [afterImage,   setAfterImage]       = useState(null)
  const [afterPreview, setAfterPreview]     = useState(null)
  const [uploading,    setUploading]        = useState(false)
  
  useEffect(() => {
    if (!user?.id) return
    getMyJobs(user.id, authHeader())
      .then(data => setJobs(data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  function showMsg(m) { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  async function handleStart(id) {
    setActing(id)
    try {
      await updateComplaintStatus(id, 'IN_PROGRESS', '', authHeader())
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status:'IN_PROGRESS' } : j))
      showMsg('✅ Job started!')
    } catch (e) { showMsg(`❌ ${e.message}`) }
    finally { setActing(null) }
  }

  
  function openResolveModal(id) {
    setNoteModal(id)
    setNote('')
    setAfterImage(null)
    setAfterPreview(null)
  }

  
  function handleAfterImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setAfterImage(file)
    setAfterPreview(URL.createObjectURL(file))
  }

  function removeAfterImage() {
    setAfterImage(null)
    setAfterPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }
  

  async function handleResolve() {
    const id = noteModal
    setActing(id); setNoteModal(null)
    try {
      
      if (afterImage) {
        setUploading(true)
        await uploadImage(id, 'AFTER', afterImage, authHeader())
        setUploading(false)
      }
      

      await updateComplaintStatus(id, 'RESOLVED', note, authHeader())
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status:'RESOLVED' } : j))
      showMsg(`✅ Job resolved!${afterImage ? ' After photo uploaded.' : ''}`)
      setNote('')
      setAfterImage(null)    
      setAfterPreview(null)  
    } catch (e) { showMsg(`❌ ${e.message}`) }
    finally { setActing(null); setUploading(false) }
  }

  const filtered = filter === 'ALL' ? jobs : jobs.filter(j => j.status === filter)

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="My Jobs" />
        <div className="page fade-in">

          <div className="page-header">
            <div className="page-title">🔧 My Assigned Jobs</div>
            <div className="page-sub">{jobs.length} total · {filtered.length} shown</div>
          </div>

          {msg && (
            <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>
          )}

          
          <div className="filter-bar">
            {['ALL','ASSIGNED','IN_PROGRESS','RESOLVED'].map(s => (
              <button key={s}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(s)}>
                {s === 'ALL' ? 'All' : s.replace('_',' ')}
                <span style={{ marginLeft:4, opacity:0.7 }}>
                  ({s === 'ALL' ? jobs.length : jobs.filter(j => j.status === s).length})
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-center"><span className="spinner" /> Loading jobs...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No jobs in this category.</div>
            </div>
          ) : filtered.map(j => (
            <div key={j.id} className="complaint-card">
              <div className="complaint-meta">
                <span className="complaint-id">#{j.id}</span>
                <span className={
                  j.status === 'IN_PROGRESS' ? 'badge badge-blue' :
                  j.status === 'RESOLVED'    ? 'badge badge-green' : 'badge badge-yellow'
                }>
                  {j.status === 'IN_PROGRESS' ? '🔧' : j.status === 'RESOLVED' ? '✅' : '⏳'}{' '}
                  {j.status?.replace('_',' ')}
                </span>
                <span className="badge badge-gray">{CAT_ICON[j.category]} {j.category}</span>
              </div>

              <div className="complaint-title">{j.title}</div>
              <div className="complaint-desc">{j.description}</div>

              {/* Footer */}
              <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
                  📍 Address: <strong style={{ color:'#ffffff' }}>{j.exactAddress || '—'}</strong>
                </span>
                {j.landMark && (
                  <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
                    🏷️ Landmark: <strong style={{ color:'#ffffff' }}>{j.landMark}</strong>
                  </span>
                )}
                {j.areaName && (
                  <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
                    🗺️ Area: <strong style={{ color:'#ffffff' }}>{j.areaName}, {j.pinCode}</strong>
                  </span>
                )}
                <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
                  🗓️ Date: <strong style={{ color:'#7eb8f7' }}>{j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-IN') : '—'}</strong>
                </span>
              </div>

              
              {j.complaintImages?.length > 0 && (
                <ImageToggle images={j.complaintImages} />
              )}

              {j.status === 'ASSIGNED' && (
                <button className="btn btn-outline btn-sm" disabled={acting === j.id} onClick={() => handleStart(j.id)}>
                  {acting === j.id
                    ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Starting...</>
                    : '▶️ Start Job'}
                </button>
              )}

              
              {j.status === 'IN_PROGRESS' && (
                <button className="btn btn-success btn-sm" disabled={acting === j.id} onClick={() => openResolveModal(j.id)}>
                  ✅ Mark as Resolved
                </button>
              )}

              
              {j.status === 'RESOLVED' && (
                <JobFeedback complainId={j.id} />
              )}
            </div>
          ))}
        </div>
      </div>

      
      {noteModal && (
        <div className="modal-backdrop" onClick={() => !uploading && setNoteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">✅ Resolve Job #{noteModal}</div>
              <button className="modal-close" onClick={() => !uploading && setNoteModal(null)}>×</button>
            </div>

            
            <div className="form-group">
              <label className="form-label">Resolution Note (optional)</label>
              <textarea className="form-input" placeholder="Describe what was done..."
                rows={4} value={note} onChange={e => setNote(e.target.value)}
                style={{ resize:'vertical' }} />
            </div>

            
            <div className="form-group">
              <label className="form-label">
                📸 After Photo
                <span style={{ fontWeight:400, color:'var(--text-3)', marginLeft:6 }}>(optional)</span>
              </label>

              {!afterPreview ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border:'2px dashed var(--border-md)', borderRadius:'var(--radius-sm)', padding:'18px 16px', textAlign:'center', cursor:'pointer', background:'var(--navy)', transition:'border-color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor='var(--green)'}
                  onMouseOut={e => e.currentTarget.style.borderColor='var(--border-md)'}
                >
                  <div style={{ fontSize:'1.6rem', marginBottom:6 }}>📷</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-2)', marginBottom:2 }}>Upload photo of fixed issue</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>JPG, PNG</div>
                </div>
              ) : (
                <div style={{ position:'relative' }}>
                  <img src={afterPreview} alt="after"
                    style={{ width:'100%', maxHeight:160, objectFit:'cover', borderRadius:8, border:'2px solid var(--green)' }} />
                  <button type="button" onClick={removeAfterImage}
                    style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,0.7)', color:'#fff', border:'none', borderRadius:'50%', width:24, height:24, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem' }}>
                    ✕
                  </button>
                  <div style={{ marginTop:4, fontSize:'0.7rem', color:'var(--green)' }}>✅ {afterImage?.name}</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAfterImage} />
            </div>
            

            {/* Buttons — only text updated to show photo status */}
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-success" onClick={handleResolve} disabled={!!acting || uploading}>
                {uploading
                  ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Uploading...</>
                  : `✅ Confirm Resolved${afterImage ? ' + Photo' : ''}`}
              </button>
              <button className="btn btn-outline" onClick={() => setNoteModal(null)} disabled={uploading}>Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}