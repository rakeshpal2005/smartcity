import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getComplaintsByPincode } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const STATUS_CLS = {
  SUBMITTED:    'badge badge-blue',
  UNDER_REVIEW: 'badge badge-yellow',
  ASSIGNED:     'badge badge-purple',
  IN_PROGRESS:  'badge badge-blue',
  RESOLVED:     'badge badge-green',
  REJECTED:     'badge badge-red',
}
const STATUS_COLORS = {
  SUBMITTED:'#3b82f6', UNDER_REVIEW:'#eab308', ASSIGNED:'#a855f7',
  IN_PROGRESS:'#f97316', RESOLVED:'#22c55e', REJECTED:'#ef4444',
}
const CAT_ICON   = { ROAD:'🛣️', GARBAGE:'🗑️', STREET_LIGHT:'💡', WATER:'💧' }
const CAT_COLORS = ['#3b82f6','#22c55e','#f97316','#a855f7']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--navy-card)', border:'1px solid var(--border-md)', borderRadius:8, padding:'10px 14px', fontSize:'0.82rem' }}>
      <div style={{ color:'var(--text-2)', marginBottom:4 }}>{label}</div>
      <div style={{ color:'var(--text-1)', fontWeight:700 }}>{payload[0].value} complaints</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, authHeader } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (!user?.pinCode) {
      setError('No pincode in your profile. Ask super admin to update.')
      setLoading(false)
      return
    }

    // Directly get complaints by admin's pinCode
    getComplaintsByPincode(user.pinCode, authHeader())
      .then(data => setComplaints(data || []))
      .catch(() => setError('Failed to load complaints.'))
      .finally(() => setLoading(false))
  }, [])

  // Stats
  const total      = complaints.length
  const submitted  = complaints.filter(c => c.status === 'SUBMITTED').length
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length
  const resolved   = complaints.filter(c => c.status === 'RESOLVED').length
  const rejected   = complaints.filter(c => c.status === 'REJECTED').length
  const recent     = complaints.slice(0, 6)

  const categoryData = ['ROAD','GARBAGE','STREET_LIGHT','WATER'].map(cat => ({
    name: cat.replace('_',' '),
    count: complaints.filter(c => c.category === cat).length,
  }))

  const statusData = Object.keys(STATUS_COLORS)
    .map(s => ({ name: s.replace('_',' '), value: complaints.filter(c => c.status === s).length }))
    .filter(s => s.value > 0)

  const statCards = [
    { label:'Total',       val:total,      icon:'📋', bg:'rgba(59,130,246,0.12)', col:'var(--blue-light)' },
    { label:'New',         val:submitted,  icon:'📤', bg:'var(--blue-glow)',      col:'var(--blue-light)' },
    { label:'In Progress', val:inProgress, icon:'🔧', bg:'var(--orange-bg)',      col:'var(--orange)' },
    { label:'Resolved',    val:resolved,   icon:'✅', bg:'var(--green-bg)',       col:'var(--green)' },
    { label:'Rejected',    val:rejected,   icon:'❌', bg:'var(--red-bg)',         col:'var(--red)' },
  ]

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Admin Dashboard" />
        <div className="page fade-in">

          <div className="page-header">
            <div>
              <div className="page-title">🛡️ Admin Dashboard</div>
              <div className="page-sub">
                Showing complaints for pincode: <strong style={{ color:'var(--blue-light)' }}>{user?.pinCode}</strong>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {/* Stats */}
          <div className="stat-grid">
            {statCards.map(c => (
              <div key={c.label} className="stat-card">
                <div className="stat-icon" style={{ background:c.bg }}>{c.icon}</div>
                <div>
                  <div className="stat-val" style={{ color:c.col }}>{loading ? '—' : c.val}</div>
                  <div className="stat-label">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display:'flex', gap:12, marginBottom:28 }}>
            <button className="btn btn-primary" onClick={() => navigate('/admin/complaints')}>📋 All Complaints</button>
            <button className="btn btn-outline" onClick={() => navigate('/admin/assign')}>🎯 Assign Workers</button>
          </div>

          {/* Charts */}
          {!loading && complaints.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
              <div className="card">
                <div style={{ marginBottom:14 }}>
                  <div className="section-title">By Category</div>
                  <div className="section-sub">Volume per issue type</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} barSize={34} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                    <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text-2)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:'var(--text-2)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div style={{ marginBottom:8 }}>
                  <div className="section-title">By Status</div>
                  <div className="section-sub">Resolution breakdown</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={3} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name.replace(/ /g,'_')] || '#888'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} complaints`, name]}
                      contentStyle={{ background:'var(--navy-card)', border:'1px solid var(--border-md)', borderRadius:8, fontSize:'0.8rem' }}
                    />
                    <Legend iconType="circle" iconSize={8}
                      formatter={val => <span style={{ fontSize:'0.72rem', color:'var(--text-2)' }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent table */}
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">Recent Complaints</div>
                <div className="section-sub">Latest {recent.length} submissions in your area</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/complaints')}>See All →</button>
            </div>

            {loading ? (
              <div className="loading-center"><span className="spinner" /> Loading...</div>
            ) : recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-text">No complaints in your pincode yet</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#ID</th><th>Title</th><th>Category</th><th>Citizen</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {recent.map(c => (
                      <tr key={c.id} style={{ cursor:'pointer' }} onClick={() => navigate('/admin/complaints')}>
                        <td style={{ fontFamily:'var(--mono)', fontSize:'0.75rem', color:'var(--text-3)' }}>#{c.id}</td>
                        <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-1)', fontWeight:600 }}>{c.title}</td>
                        <td>{CAT_ICON[c.category]} {c.category?.replace('_',' ')}</td>
                        <td>{c.user?.name || '—'}</td>
                        <td><span className={STATUS_CLS[c.status] || 'badge badge-gray'}>{c.status?.replace('_',' ')}</span></td>
                        <td style={{ fontFamily:'var(--mono)', fontSize:'0.75rem' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}