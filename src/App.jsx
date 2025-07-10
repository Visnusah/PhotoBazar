import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import PhotoDetail from './pages/PhotoDetail';
import Sell from './pages/Sell';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/photo/:id" element={<PhotoDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes - require authentication only */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sell" 
                element={
                  <ProtectedRoute>
                    <Sell />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all - 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{
              top: 20,
              right: 20,
              zIndex: 9999,
            }}
            toastOptions={{
              // Default options for all toasts
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                maxWidth: '400px',
                cursor: 'pointer',
              },
              // Success toasts
              success: {
                duration: 4000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              // Error toasts
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              // Loading toasts
              loading: {
                duration: Infinity,
                style: {
                  background: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;