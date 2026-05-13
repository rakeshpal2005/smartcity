

const BASE = import.meta.env.VITE_API_BASE_URL  
  
console.log("BASE =", BASE)

async function http(path, options = {}) {
 const res = await fetch(`${BASE}${path}`, {
  ...options,
  headers: {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  },
})
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message || err.messege || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  const ct = res.headers.get('content-type')
  return ct?.includes('application/json') ? res.json() : res.text()
}


export async function loginUser(email, password) {
  return http('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerUser(data) {
  return http('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function sendOtp(email) {
  return http(`/auth/send-otp?email=${email}`, {
    method: 'POST'
  })
}


export async function getMyComplaints(userId, authHeader) {
  return http(`/complains/user/${userId}`, { headers: authHeader })
}

export async function getComplaintsByPincode(pinCode, authHeader) {
  return http(`/complains/pincode/${pinCode}`, { headers: authHeader })
}

export async function getAllComplaints(authHeader) {
  return http('/complains/all', { headers: authHeader })
}

export async function getMyJobs(workerId, authHeader) {
  return http(`/complains/worker/${workerId}`, { headers: authHeader })
}

export async function getComplaintById(id, authHeader) {
  return http(`/complains/${id}`, { headers: authHeader })
}

export async function submitComplaint(data, authHeader) {
  const form = new FormData()
  form.append('title',         data.title)
  form.append('description',   data.description)
  form.append('category',      data.category)
  form.append('exactAddress',  data.exactAddress || '')
  form.append('pinCode',       data.pinCode || '')
  form.append('areaName',      data.areaName || '')
  form.append('landMark',      data.landMark || '')
  form.append('UserId',        data.UserId)
  if (data.image) form.append('image', data.image)

  const res = await fetch(`${BASE}/complains/create`, {
    method: 'POST',
    headers: { ...authHeader },
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function assignWorker(complainId, workerId, authHeader) {
  return http(`/complains/${complainId}/assign-worker/${workerId}`, {
    method: 'POST',
    headers: authHeader,
  })
}

export async function updateComplaintStatus(complainId, status, note = '', authHeader) {
  return http(`/complains/${complainId}/status`, {
    method: 'PUT',
    headers: authHeader,
    body: JSON.stringify({ status, note }),
  })
}


export async function getWorkers(authHeader) {
  return http('/workers', { headers: authHeader })
}

export async function getWorkersByAdmin(adminId, authHeader) {
  return http(`/workers/admin?adminId=${adminId}`, { headers: authHeader })
}

export async function createWorker(data, authHeader) {
  return http('/workers/create', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify(data),
  })
}


export async function getAllPincodes(authHeader) {
  return http('/pincode', { headers: authHeader })
}

export async function getPincodeByCode(pincode, authHeader) {
  return http(`/pincode/code?pincode=${pincode}`, { headers: authHeader })
}


export async function getUserById(id, authHeader) {
  return http(`/users/${id}`, { headers: authHeader })
}


export async function getComplaintHistory(complainId, authHeader) {
  return http(`/complain-history/${complainId}`, { headers: authHeader })
}


export async function createFeedback(data, authHeader) {
  return http('/feedback/create', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify(data),
  })
}

export async function getFeedbackByComplaint(complainId, authHeader) {
  return http(`/feedback/complain/${complainId}`, { headers: authHeader })
}


export async function uploadImage(complainId, imageType, file, authHeader) {
  const form = new FormData()
  form.append('complainId', complainId)
  form.append('imageType', imageType)
  form.append('file', file)
  const res = await fetch(`${BASE}/images/upload`, {
    method: 'POST',
    headers: { ...authHeader },
    body: form,
  })
  if (!res.ok) throw new Error('Image upload failed')
  return res.json()
}