import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './components/Toast';
import { ProtectedAdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import UpdatesPage from './pages/UpdatesPage';
import CalendarPage from './pages/CalendarPage';
import ClientRequestPage from './pages/ClientRequestPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUpdatesPage from './pages/AdminUpdatesPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import AdminClientRequestsPage from './pages/AdminClientRequestsPage';
import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Admin Login - no navbar */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* All other routes have navbar */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <Routes>
                {/* Public / Viewer Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/updates" element={<UpdatesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/request" element={<ClientRequestPage />} />

                {/* Admin Pages */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboardPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/updates"
                  element={
                    <ProtectedAdminRoute requireManageUpdates>
                      <AdminUpdatesPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedAdminRoute requireManageEvents>
                      <AdminEventsPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/client-requests"
                  element={
                    <ProtectedAdminRoute requireManageEvents>
                      <AdminClientRequestsPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/approvals"
                  element={
                    <ProtectedAdminRoute requireApproveEvents>
                      <AdminApprovalsPage />
                    </ProtectedAdminRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
