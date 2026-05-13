import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { submitComplaint } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Topbar  from '../../components/Topbar'


const CATEGORIES = [
  { value:'ROAD',         label:'🛣️  Road / Pothole',    desc:'Broken roads, potholes' },
  { value:'GARBAGE',      label:'🗑️  Garbage / Waste',   desc:'Overflowing bins, dumping' },
  { value:'STREET_LIGHT', label:'💡  Street Light',      desc:'Broken or no light' },
  { value:'WATER',        label:'💧  Water Supply',      desc:'No water, leakage' },
  { value:'DRAINAGE',     label:'🌊  Drainage',          desc:'Blocked drains, flooding' },
  { value:'POWER_SUPPLY', label:'⚡  Power Supply',      desc:'Power cut, electrical issue' },
  { value:'SEWAGE',       label:'🚰  Sewage',            desc:'Sewage overflow, bad smell' },
]


export default function NewComplaint() {
  const { user, authHeader } = useAuth()
  const navigate  = useNavigate()
  const fileRef   = useRef()

  const [form, setForm] = useState({
    title:'', description:'', category:'',
    exactAddress:'', pinCode:'', areaName:'',
    landMark:''    
  })
  const [image,    setImage]   = useState(null)
  const [preview,  setPreview] = useState(null)
  const [error,    setError]   = useState('')
  const [success,  setSuccess] = useState('')
  const [loading,  setLoading] = useState(false)

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!form.title || !form.description || !form.category) {
      setError('Title, description and category are required.'); return
    }
    if (!form.pinCode) {
      setError('Please enter your pincode.'); return
    }
    if (!form.areaName) {
      setError('Please enter your area name.'); return
    }
    if (form.description.length < 10) {
      setError('Please describe the issue in at least 10 characters.'); return
    }

    
    if (!form.landMark) {
      setError('Landmark is required.'); return
    }
    if (!image) {
      setError('Please upload a photo of the issue.'); return
    }
    

    setLoading(true)
    try {
      await submitComplaint({
        title:        form.title,
        description:  form.description,
        category:     form.category,
        exactAddress: form.exactAddress,
        pinCode:      form.pinCode,
        areaName:     form.areaName,
        landMark:     form.landMark,   
        UserId:       user.id,
        image:        image,
      }, authHeader())

      setSuccess('✅ Complaint submitted successfully! Redirecting...')
      setForm({ title:'', description:'', category:'', exactAddress:'', pinCode:'', areaName:'', landMark:'' })
      setImage(null); setPreview(null)
      setTimeout(() => navigate('/citizen/complaints'), 1800)
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="New Complaint" />
        <div className="page fade-in">

          <div className="page-header">
            <div className="page-title">Report a Problem</div>
            <div className="page-sub">Tell us about the civic issue in your area</div>
          </div>

          <div style={{ maxWidth:700 }}>
            {error   && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>

              
              <div className="form-group">
                <label className="form-label">Category *</label>
                
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat.value}
                      onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                      style={{
                        padding:'10px 12px',
                        border:`2px solid ${form.category === cat.value ? 'var(--blue)' : 'var(--border-md)'}`,
                        borderRadius:'var(--radius-sm)', cursor:'pointer',
                        background: form.category === cat.value ? 'var(--blue-glow)' : 'var(--navy)',
                        transition:'all 0.15s'
                      }}>
                      <div style={{ fontWeight:600, fontSize:'0.83rem', marginBottom:2 }}>{cat.label}</div>
                      <div style={{ fontSize:'0.71rem', color:'var(--text-3)' }}>{cat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

             
              <div className="form-group">
                <label className="form-label">Complaint Title *</label>
                <input className="form-input" name="title"
                  placeholder="e.g. Large pothole near bus stop on MG Road"
                  value={form.title} onChange={handleChange} maxLength={100} />
                <div className="form-hint">{form.title.length}/100</div>
              </div>

              
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" name="description"
                  placeholder="Describe the problem — how bad it is, how long it's been there..."
                  value={form.description} onChange={handleChange}
                  rows={4} maxLength={1000} style={{ resize:'vertical' }} />
                <div className="form-hint">{form.description.length}/1000</div>
              </div>

              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Pin Code *</label>
                  <input className="form-input" name="pinCode"
                    placeholder="700001"
                    value={form.pinCode} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area Name *</label>
                  <input className="form-input" name="areaName"
                    placeholder="MG Road, Sector 5"
                    value={form.areaName} onChange={handleChange} />
                </div>
              </div>

              
              <div className="form-group">
                <label className="form-label">Exact Address</label>
                <input className="form-input" name="exactAddress"
                  placeholder="Near SBI Bank, opposite park gate..."
                  value={form.exactAddress} onChange={handleChange} />
              </div>

              
              <div className="form-group">
                <label className="form-label">Landmark *</label>
                <input className="form-input" name="landMark"
                  placeholder="Near SBI Bank / opposite school / behind bus stop"
                  value={form.landMark} onChange={handleChange} />
              </div>

            
              <div className="form-group">
                <label className="form-label">Upload Photo *</label>

                {!preview ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border:`2px dashed ${!image ? 'var(--border-md)' : 'var(--blue)'}`,
                      borderRadius:'var(--radius-sm)',
                      padding:'28px 20px',
                      textAlign:'center', cursor:'pointer',
                      background:'var(--navy)',
                      transition:'border-color 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor='var(--blue)'}
                    onMouseOut={e => e.currentTarget.style.borderColor='var(--border-md)'}
                  >
                    <div style={{ fontSize:'2rem', marginBottom:8 }}>📸</div>
                    <div style={{ fontSize:'0.85rem', color:'var(--text-2)', marginBottom:4 }}>
                      Click to upload a photo of the issue
                    </div>
                    {/* label shows required*/}
                    <div style={{ fontSize:'0.72rem', color:'var(--red)' }}>
                      Required — JPG, PNG, WEBP — Max 5MB
                    </div>
                  </div>
                ) : (
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <img src={preview} alt="preview"
                      style={{
                        width:'100%', maxHeight:240,
                        objectFit:'cover', borderRadius:8,
                        border:'1px solid var(--border-md)'
                      }}
                    />
                    <button type="button"
                      onClick={removeImage}
                      style={{
                        position:'absolute', top:8, right:8,
                        background:'rgba(0,0,0,0.7)', color:'#fff',
                        border:'none', borderRadius:'50%',
                        width:28, height:28, fontSize:'0.9rem',
                        cursor:'pointer', display:'flex',
                        alignItems:'center', justifyContent:'center'
                      }}>
                      ✕
                    </button>
                    <div style={{
                      marginTop:6, fontSize:'0.75rem',
                      color:'var(--text-3)', fontStyle:'italic'
                    }}>
                      📎 {image?.name}
                    </div>
                  </div>
                )}

                <input ref={fileRef} type="file"
                  accept="image/*" style={{ display:'none' }}
                  onChange={handleImage} />
              </div>

              {/*Submit — unchanged*/}
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading
                    ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Submitting...</>
                    : '📤 Submit Complaint'}
                </button>
                <button type="button" className="btn btn-outline"
                  onClick={() => navigate('/citizen/dashboard')}>
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}