import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyComplaints, createFeedback, getFeedbackByComplaint } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'
import StatusTimeline from '../../components/StatusTimeline'

const STATUS_BADGE = {
  SUBMITTED:    { cls:'badge badge-blue',   icon:'📤', label:'Submitted' },
  UNDER_REVIEW: { cls:'badge badge-yellow', icon:'🔍', label:'Under Review' },
  ASSIGNED:     { cls:'badge badge-purple', icon:'👷', label:'Assigned' },
  IN_PROGRESS:  { cls:'badge badge-blue',   icon:'🔧', label:'In Progress' },
  RESOLVED:     { cls:'badge badge-green',  icon:'✅', label:'Resolved' },
  REJECTED:     { cls:'badge badge-red',    icon:'❌', label:'Rejected' },
}
const CAT_ICON = { ROAD:'🛣️', GARBAGE:'🗑️', STREET_LIGHT:'💡', WATER:'💧' }


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


//Feedback Section Component
function FeedbackSection({ complainId }) {
  const { user, authHeader } = useAuth()
  const [feedback,     setFeedback]     = useState(null)   
  const [loadingFb,    setLoadingFb]    = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [rating,       setRating]       = useState(0)
  const [hoverRating,  setHoverRating]  = useState(0)
  const [comment,      setComment]      = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    getFeedbackByComplaint(complainId, authHeader())
      .then(data => {
        // may return list or single object depending on backend
        if (Array.isArray(data)) {
          const mine = data.find(f => f.givenByName === user?.name)
          setFeedback(mine || null)
        } else {
          setFeedback(data || null)
        }
      })
      .catch(() => setFeedback(null))
      .finally(() => setLoadingFb(false))
  }, [complainId])

  async function handleSubmit() {
    if (rating === 0) { setError('Please select a rating'); return }
    setSubmitting(true); setError(null)
    try {
      const data = await createFeedback(
        { complaintId: complainId, comment, rating },
        authHeader()
      )
      setFeedback(data)
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingFb) return null

  // Already submitted show their feedback
  if (feedback) return (
    <div style={{
      marginTop:10, padding:'10px 14px',
      background:'var(--navy-card)', border:'1px solid var(--border)',
      borderRadius:8
    }}>
      <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:4 }}>
        ⭐ Your Feedback
      </div>
      <div style={{ display:'flex', gap:2, marginBottom:6 }}>
        {[1,2,3,4,5].map(s => (
          <span key={s} style={{
            fontSize:'1.1rem',
            color: s <= feedback.rating ? 'var(--yellow)' : 'var(--border)'
          }}>★</span>
        ))}
        <span style={{ fontSize:'0.75rem', color:'var(--text-3)', marginLeft:6, alignSelf:'center' }}>
          {feedback.rating}/5
        </span>
      </div>
      {feedback.comment && (
        <div style={{ fontSize:'0.8rem', color:'var(--text-2)', fontStyle:'italic' }}>
          "{feedback.comment}"
        </div>
      )}
    </div>
  )

  // Not submitted yet
  return (
    <div style={{ marginTop:10 }}>
      {!showForm ? (
        <button
          className="btn btn-outline btn-sm"
          style={{ fontSize:'0.75rem' }}
          onClick={() => setShowForm(true)}
        >
          ⭐ Give Feedback
        </button>
      ) : (
        <div style={{
          marginTop:8, padding:'12px 14px',
          background:'var(--navy-card)', border:'1px solid var(--border)',
          borderRadius:8
        }}>
          <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-1)', marginBottom:10 }}>
            ⭐ Rate this resolution
          </div>

          {/* Star rating */}
          <div style={{ display:'flex', gap:4, marginBottom:10 }}>
            {[1,2,3,4,5].map(s => (
              <span key={s}
                style={{
                  fontSize:'1.6rem', cursor:'pointer',
                  color: s <= (hoverRating || rating) ? 'var(--yellow)' : 'var(--border)',
                  transition:'color 0.1s'
                }}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
              >★</span>
            ))}
          </div>

          {/* Comment */}
          <textarea
            className="form-input"
            placeholder="Comment (optional)..."
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ resize:'vertical', marginBottom:10, fontSize:'0.82rem' }}
          />

          {error && (
            <div style={{ fontSize:'0.78rem', color:'var(--red)', marginBottom:8 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary btn-sm"
              disabled={submitting}
              onClick={handleSubmit}>
              {submitting
                ? <><span className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> Submitting...</>
                : '✅ Submit'}
            </button>
            <button className="btn btn-outline btn-sm"
              onClick={() => { setShowForm(false); setRating(0); setComment(''); setError(null) }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

//Main Component
export default function MyComplaints() {
  const { user, authHeader } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filterStatus, setFilter]   = useState('ALL')
  const [search,     setSearch]     = useState('')

  useEffect(() => {
    if (!user?.id) return
    getMyComplaints(user.id, authHeader())
      .then(data => { setComplaints(data || []); setFiltered(data || []) })
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...complaints]
    if (filterStatus !== 'ALL') result = result.filter(c => c.status === filterStatus)
    if (search) result = result.filter(c =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [filterStatus, search, complaints])

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="My Complaints" />
        <div className="page fade-in">

          <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div className="page-title">My Complaints</div>
              <div className="page-sub">{complaints.length} total filed</div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/citizen/new-complaint')}>
              ➕ New Complaint
            </button>
          </div>

          {/* Filters */}
          <div className="filter-bar">
            <input className="form-input" style={{ maxWidth:260 }}
              placeholder="🔍 Search complaints..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {['ALL','SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','REJECTED'].map(s => (
              <button key={s}
                className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(s)}>
                {s === 'ALL' ? 'All' : s.replace('_',' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-center"><span className="spinner" /> Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">
                {complaints.length === 0 ? 'No complaints filed yet.' : 'No complaints match filter.'}
              </div>
              {complaints.length === 0 && (
                <button className="btn btn-primary" style={{ marginTop:16 }}
                  onClick={() => navigate('/citizen/new-complaint')}>
                  ➕ File a Complaint
                </button>
              )}
            </div>
          ) : filtered.map(c => {
            const badge = STATUS_BADGE[c.status] || { cls:'badge badge-gray', icon:'•', label: c.status }
            const beforeImg = c.complaintImages?.find(img => img.imageType === 'BEFORE')
            return (
              <div key={c.id} className="complaint-card">

                {/* Image + Content row */}
                
                <div>
                  <div className="complaint-meta">
                    <span className="complaint-id">#{c.id}</span>
                    <span className={badge.cls}>{badge.icon} {badge.label}</span>
                    <span className="badge badge-gray">{CAT_ICON[c.category]} {c.category?.replace('_',' ')}</span>
                  </div>
                  <div className="complaint-title">{c.title}</div>
                  <div className="complaint-desc">{c.description}</div>
                </div>

               
               {/* Footer info */}
<div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
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
  {c.assignedWorker && (
    <span style={{ fontSize:'0.82rem', color:'#c9d1e0', fontWeight:500 }}>
      👷 Worker: <strong style={{ color:'#4ade80' }}>{c.assignedWorker.name}</strong>
    </span>
  )}
</div>

{/* Before/After Image buttons  */}
{c.complaintImages?.length > 0 && (
  <ImageToggle images={c.complaintImages} />
)}

                {/* Resolved info */}
                {c.status === 'RESOLVED' && c.resolvedAt && (
                  <div style={{
                    marginTop:10, padding:'8px 12px',
                    background:'var(--green-bg)', borderRadius:6,
                    fontSize:'0.8rem', color:'var(--green)'
                  }}>
                    ✅ Resolved on {new Date(c.resolvedAt).toLocaleDateString('en-IN')}
                  </div>
                )}

                {/* Rejected info */}
                {c.status === 'REJECTED' && (
                  <div style={{
                    marginTop:10, padding:'8px 12px',
                    background:'var(--red-bg)', borderRadius:6,
                    fontSize:'0.8rem', color:'var(--red)'
                  }}>
                    ❌ This complaint was rejected
                  </div>
                )}

                {/* Feedback — only for RESOLVED */}
                {c.status === 'RESOLVED' && (
                  <FeedbackSection complainId={c.id} />
                )}

                {/* Status Timeline */}
                <StatusTimeline complainId={c.id} />

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}