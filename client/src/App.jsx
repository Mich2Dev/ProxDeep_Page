import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextDemo';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingBot from './components/FloatingBot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SmlCatalog from './pages/SmlCatalog';
import ClientDashboard from './pages/ClientDashboard';
import ClientWizard from './pages/ClientWizard';
import ClientProposal from './pages/ClientProposal';
import Workspace from './pages/Workspace';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between">
          <Navbar />
          
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/smls" element={<SmlCatalog />} />

              {/* Client Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/diagnostic"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proposal/:id"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientProposal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <Workspace />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <FloatingBot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
