import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getComplaintHistory } from '../services/api'

const STATUS_COLOR = {
  SUBMITTED:    { dot:'var(--blue)',   bg:'var(--blue-glow)' },
  UNDER_REVIEW: { dot:'var(--yellow)', bg:'var(--yellow-bg)' },
  ASSIGNED:     { dot:'var(--purple)', bg:'var(--purple-bg)' },
  IN_PROGRESS:  { dot:'var(--orange)', bg:'var(--orange-bg)' },
  RESOLVED:     { dot:'var(--green)',  bg:'var(--green-bg)'  },
  REJECTED:     { dot:'var(--red)',    bg:'var(--red-bg)'    },
}

const STATUS_ICON = {
  SUBMITTED:'📤', UNDER_REVIEW:'🔍', ASSIGNED:'👷',
  IN_PROGRESS:'🔧', RESOLVED:'✅', REJECTED:'❌'
}

export default function StatusTimeline({ complainId }) {
  const { authHeader } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)   
  const [open,    setOpen]    = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!complainId || !open) return
    setLoading(true)   
    setError(null)
    setHistory([])     
    getComplaintHistory(complainId, authHeader())
      .then(data => setHistory(data || []))
      .catch(err => {
        setError(err.message || 'Failed to load history')
        setHistory([])
      })
      .finally(() => setLoading(false))
  }, [complainId, open])

  return (
    <div style={{ marginTop: 12 }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => setOpen(o => !o)}
        style={{ fontSize:'0.75rem' }}
      >
        {open ? '▲ Hide Timeline' : '📜 View History'}
      </button>

      {open && (
        <div style={{ marginTop: 14, paddingLeft: 8 }}>
          {loading ? (
            <div style={{ display:'flex', gap:8, alignItems:'center', color:'var(--text-3)', fontSize:'0.8rem' }}>
              <span className="spinner" style={{ width:14, height:14, borderWidth:2 }} />
              Loading history...
            </div>
          ) : error ? (
            <div style={{ fontSize:'0.8rem', color:'var(--red)' }}>⚠️ {error}</div>
          ) : history.length === 0 ? (
            <div style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>No history yet.</div>
          ) : (
            <div style={{ position:'relative' }}>
              {/* Vertical line */}
              <div style={{
                position:'absolute', left:11, top:8, bottom:8,
                width:2, background:'var(--border)', borderRadius:2
              }} />

              {history.map((h, i) => {
                const col = STATUS_COLOR[h.status] || { dot:'var(--text-3)', bg:'var(--border)' }
                return (
                  <div key={h.id || i} style={{
                    display:'flex', gap:14, marginBottom:16,
                    position:'relative', alignItems:'flex-start'
                  }}>
                    {/* Dot */}
                    <div style={{
                      width:24, height:24, borderRadius:'50%',
                      background: col.bg,
                      border:`2px solid ${col.dot}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'0.7rem', flexShrink:0, zIndex:1
                    }}>
                      {STATUS_ICON[h.status] || '•'}
                    </div>

                    {/* Content */}
                    <div style={{
                      flex:1, background:'var(--navy-card)',
                      border:'1px solid var(--border)',
                      borderRadius:8, padding:'10px 14px'
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                        <span style={{
                          fontSize:'0.72rem', fontWeight:700,
                          color: col.dot, letterSpacing:'0.04em'
                        }}>
                          {h.status?.replace('_',' ')}
                        </span>
                        {h.changedByName && (
                          <span style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>
                            by <strong style={{ color:'var(--text-2)' }}>{h.changedByName}</strong>
                          </span>
                        )}
                        <span style={{
                          marginLeft:'auto', fontSize:'0.68rem',
                          color:'var(--text-3)', fontFamily:'var(--mono)'
                        }}>
                          {h.changedAt ? new Date(h.changedAt).toLocaleString('en-IN', {
                            day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
                          }) : '—'}
                        </span>
                      </div>
                      {h.note && (
                        <div style={{
                          fontSize:'0.78rem', color:'var(--text-2)',
                          fontStyle:'italic', marginTop:2
                        }}>
                          "{h.note}"
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}