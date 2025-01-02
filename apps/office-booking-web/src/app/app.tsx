// apps/office-booking-web/src/app/app.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Regular pages
import HomePage from './pages/HomePage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';

// Admin pages
import UsersAdminPage from './pages/admin/UsersAdminPage';
import CabinsAdminPage from './pages/admin/CabinsAdminPage';
import BookingsAdminPage from './pages/admin/BookingsAdminPage';
import PaymentsAdminPage from './pages/admin/PaymentsAdminPage';

// Styles
import '../styles/global.css'; // Updated path

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* User Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/bookings" element={
            <ProtectedRoute>
              <Layout>
                <BookingsPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
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