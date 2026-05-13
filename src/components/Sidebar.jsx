import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = {
  CITIZEN: [
    { label:'Dashboard',      icon:'🏠', path:'/citizen/dashboard' },
    { label:'New Complaint',  icon:'➕', path:'/citizen/new-complaint' },
    { label:'My Complaints',  icon:'📋', path:'/citizen/complaints' },
  ],
  ADMIN: [
    { label:'Dashboard',      icon:'📊', path:'/admin/dashboard' },
    { label:'All Complaints', icon:'📋', path:'/admin/complaints' },
    { label:'Assign Worker',  icon:'🎯', path:'/admin/assign' },
    { label:'Workers',        icon:'👷', path:'/admin/workers' },
  ],
  WORKER: [
    { label:'Dashboard',      icon:'🏠', path:'/worker/dashboard' },
    { label:'My Jobs',        icon:'🔧', path:'/worker/jobs' },
  ],
}

const ROLE_STYLE = {
  CITIZEN: { bg:'var(--blue-glow)',  color:'var(--blue-light)', icon:'👤' },
  ADMIN:   { bg:'var(--purple-bg)', color:'var(--purple)',      icon:'🛡️' },
  WORKER:  { bg:'var(--green-bg)',  color:'var(--green)',       icon:'👷' },
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  if (!user) return null

  const items    = NAV[user.role] || []
  const rs       = ROLE_STYLE[user.role] || ROLE_STYLE.CITIZEN
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
    : 'U'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">🏙️</div>
          <div>
            <div className="logo-text">SmartCity</div>
            <div className="logo-sub">City Management</div>
          </div>
        </div>

        {/* Role badge */}
        <div className={`sidebar-role ${user.role?.toLowerCase()}`}>
          <span>{rs.icon}</span>
          {user.role}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {items.map(item => (
            <button key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User footer — click to open profile */}
        <div className="sidebar-footer">
          <div className="user-chip"
            onClick={() => setProfileOpen(o => !o)}
            style={{
              cursor:'pointer', padding:'6px 8px',
              borderRadius:8, transition:'background 0.15s',
              background: profileOpen ? 'var(--navy-hover)' : 'transparent',
            }}>
            <div className="user-avatar">{initials}</div>
            <div style={{ overflow:'hidden', flex:1 }}>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <span style={{
              fontSize:'0.7rem', color:'var(--text-3)',
              transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition:'transform 0.2s', marginLeft:4,
            }}>▲</span>
          </div>
        </div>
      </aside>

      {/* Profile Panel */}
      {profileOpen && (
        <div style={{
          position:'fixed', left:0, bottom:62,
          width:240,
          background:'var(--navy-light)',
          borderTop:'1px solid var(--border-md)',
          borderRight:'1px solid var(--border)',
          zIndex:200,
          animation:'slideUp 0.2s ease',
          boxShadow:'4px -4px 24px rgba(0,0,0,0.4)',
        }}>

          {/* Header */}
          <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              My Profile
            </div>
            <button onClick={() => setProfileOpen(false)}
              style={{ background:'none', border:'none', color:'var(--text-3)', fontSize:'1rem', cursor:'pointer', lineHeight:1 }}>
              ✕
            </button>
          </div>

          {/* Avatar + name */}
          <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, borderBottom:'1px solid var(--border)' }}>
            <div style={{
              width:56, height:56, borderRadius:'50%',
              background: rs.bg, border:`2px solid ${rs.color}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:700, fontSize:'1.1rem', color: rs.color,
            }}>
              {initials}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-1)' }}>
                {user.name}
              </div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:5,
                marginTop:5, padding:'3px 10px',
                background: rs.bg, borderRadius:99,
                fontSize:'0.68rem', fontWeight:700,
                color: rs.color, letterSpacing:'0.08em',
              }}>
                {rs.icon} {user.role}
              </div>
            </div>
          </div>

          {/* Info — NO User ID */}
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
            {[
              { label:'Email',   value: user.email,               icon:'✉️' },
              { label:'Phone',   value: user.phoneNumber || '—',  icon:'📞' },
              { label:'Pincode', value: user.pinCode     || '—',  icon:'📍' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                <span style={{ fontSize:'0.85rem', flexShrink:0, marginTop:1 }}>{row.icon}</span>
                <div>
                  <div style={{ fontSize:'0.6rem', color:'var(--text-3)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:1 }}>
                    {row.label}
                  </div>
                  <div style={{
                    fontSize:'0.78rem', color:'var(--text-1)',
                    fontFamily: row.label === 'Email' ? 'var(--mono)' : 'inherit',
                    wordBreak:'break-all',
                  }}>
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding:'14px 20px' }}>
            <button className="btn btn-danger"
              style={{ width:'100%', justifyContent:'center' }}
              onClick={handleLogout}>
              ⏻ Sign Out
            </button>
          </div>

        </div>
      )}

      {/* Backdrop */}
      {profileOpen && (
        <div onClick={() => setProfileOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:199 }} />
      )}
    </>
  )
}