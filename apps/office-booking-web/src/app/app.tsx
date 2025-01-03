// src/app/app.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserRole } from '@office-booking-monorepo/types';
import Layout from './components/Layout';
import { AdminRoute } from './components/AdminRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';

// Admin pages
import UsersAdminPage from './pages/admin/UsersAdminPage';
import CabinsAdminPage from './pages/admin/CabinsAdminPage';
import BookingsAdminPage from './pages/admin/BookingsAdminPage';
import PaymentsAdminPage from './pages/admin/PaymentsAdminPage';

// Global styles
import '../styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected User Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <AdminRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<UsersAdminPage />} />
            <Route path="users" element={<UsersAdminPage />} />
            <Route path="cabins" element={<CabinsAdminPage />} />
            <Route path="bookings" element={<BookingsAdminPage />} />
            <Route path="payments" element={<PaymentsAdminPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;