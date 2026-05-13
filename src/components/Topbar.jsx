import { useAuth } from '../context/AuthContext'

export default function Topbar({ title }) {
  const { user } = useAuth()
  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{now}</span>
        {user && (
          <span style={{
            fontSize: '0.8rem', color: 'var(--text-2)',
            background: 'var(--navy-card)', border: '1px solid var(--border)',
            padding: '4px 12px', borderRadius: '99px'
          }}>
            👋 {user.name}
          </span>
        )}
      </div>
    </div>
  )
}