import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login    from './pages/Login'
import Register from './pages/Register'

import CitizenDashboard from './pages/citizen/CitizenDashboard'
import NewComplaint     from './pages/citizen/NewComplaint'
import MyComplaints     from './pages/citizen/MyComplaints'

import AdminDashboard   from './pages/admin/AdminDashboard'
import AllComplaints    from './pages/admin/AllComplaints'
import AssignWorker     from './pages/admin/AssignWorker'
import WorkerManagement from './pages/admin/WorkerManagement'

import WorkerDashboard from './pages/worker/WorkerDashboard'
import AssignedJobs    from './pages/worker/AssignedJobs'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/citizen/dashboard"     element={<ProtectedRoute role="CITIZEN"><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/citizen/new-complaint" element={<ProtectedRoute role="CITIZEN"><NewComplaint /></ProtectedRoute>} />
          <Route path="/citizen/complaints"    element={<ProtectedRoute role="CITIZEN"><MyComplaints /></ProtectedRoute>} />

          <Route path="/admin/dashboard"  element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/complaints" element={<ProtectedRoute role="ADMIN"><AllComplaints /></ProtectedRoute>} />
          <Route path="/admin/assign"     element={<ProtectedRoute role="ADMIN"><AssignWorker /></ProtectedRoute>} />
          <Route path="/admin/workers"    element={<ProtectedRoute role="ADMIN"><WorkerManagement /></ProtectedRoute>} />

          <Route path="/worker/dashboard" element={<ProtectedRoute role="WORKER"><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/worker/jobs"      element={<ProtectedRoute role="WORKER"><AssignedJobs /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}