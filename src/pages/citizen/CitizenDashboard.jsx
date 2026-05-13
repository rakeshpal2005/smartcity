import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyComplaints } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'

const STATUS_BADGE = {
  PENDING:     { cls:'badge badge-yellow', icon:'⏳' },
  IN_PROGRESS: { cls:'badge badge-blue',   icon:'🔧' },
  RESOLVED:    { cls:'badge badge-green',  icon:'✅' },
  REJECTED:    { cls:'badge badge-red',    icon:'❌' },
}
const CAT_ICON = { GARBAGE:'🗑️', ROAD:'🛣️', WATER:'💧', ELECTRICITY:'⚡', STREETLIGHT:'💡', OTHER:'📌' }

export default function CitizenDashboard() {
  const { user, authHeader } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getMyComplaints(user.id, authHeader())
      .then(data => setComplaints(data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  const total      = complaints.length
  const pending    = complaints.filter(c => c.status === 'PENDING').length
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length
  const resolved   = complaints.filter(c => c.status === 'RESOLVED').length
  const recent     = complaints.slice(0, 4)

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="My Dashboard" />
        <div className="page fade-in">

          <div className="page-header">
            <div className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</div>
            <div className="page-sub">Status of your complaints</div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background:'rgba(59,130,246,0.12)' }}>📋</div>
              <div><div className="stat-val">{total}</div><div className="stat-label">Total</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background:'var(--yellow-bg)' }}>⏳</div>
              <div><div className="stat-val">{pending}</div><div className="stat-label">Pending</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background:'var(--blue-glow)' }}>🔧</div>
              <div><div className="stat-val">{inProgress}</div><div className="stat-label">In Progress</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background:'var(--green-bg)' }}>✅</div>
              <div><div className="stat-val">{resolved}</div><div className="stat-label">Resolved</div></div>
            </div>
          </div>

          <div style={{ display:'flex', gap:12, marginBottom:28 }}>
            <button className="btn btn-primary" onClick={() => navigate('/citizen/new-complaint')}>➕ New Complaint</button>
            <button className="btn btn-outline" onClick={() => navigate('/citizen/complaints')}>📋 All My Complaints</button>
          </div>

          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">Recent Complaints</div>
                <div className="section-sub">Your last {recent.length} submissions</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/citizen/complaints')}>View All</button>
            </div>

            {loading ? (
              <div className="loading-center"><span className="spinner" /> Loading...</div>
            ) : recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-text">No complaints yet. File your first one!</div>
                <button className="btn btn-primary" style={{ marginTop:16 }}
                  onClick={() => navigate('/citizen/new-complaint')}>➕ File a Complaint</button>
              </div>
            ) : recent.map(c => {
              const badge = STATUS_BADGE[c.status] || { cls:'badge badge-gray', icon:'•' }
              return (
                <div key={c.id} className="complaint-card">
                  <div className="complaint-meta">
                    <span className="complaint-id">#{c.id}</span>
                    <span className={badge.cls}>{badge.icon} {c.status?.replace('_',' ')}</span>
                    <span className="badge badge-gray">{CAT_ICON[c.category]} {c.category}</span>
                  </div>
                  <div className="complaint-title">{c.title}</div>
                  <div className="complaint-desc">{c.description}</div>
                  <div className="complaint-footer">
                    <span>📍 {c.ward || c.pincode || 'N/A'}</span>
                    <span>🕒 {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}