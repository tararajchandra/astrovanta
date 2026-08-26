import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Booking flow (protected)
import { PersonalDetailsPage } from './pages/booking/PersonalDetailsPage';
import { BookingPage } from './pages/booking/BookingPage';
import { TimeSlotsPage } from './pages/booking/TimeSlotsPage';
import { PaymentPage } from './pages/booking/PaymentPage';
import { ConfirmationPage } from './pages/booking/ConfirmationPage';

// Astrologer Portal
import { AstrologerLoginPage } from './pages/astrologer/AstrologerLoginPage';
import { AstrologerLayout } from './pages/astrologer/AstrologerLayout';
import { DashboardPage } from './pages/astrologer/DashboardPage';
import { ClientsPage } from './pages/astrologer/ClientsPage';
import { KundliPage } from './pages/astrologer/KundliPage';
import { AppointmentsPage } from './pages/astrologer/AppointmentsPage';
import { ConsultationsPage } from './pages/astrologer/ConsultationsPage';
import { SettingsPage } from './pages/astrologer/SettingsPage';

import { ClientDetailsPage } from './pages/astrologer/ClientDetailsPage';

// Auth context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AstrologerProtectedRoute } from './components/AstrologerProtectedRoute';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/astrologer/login" element={<AstrologerLoginPage />} />

      {/* Protected booking flow */}
      <Route path="/book" element={<ProtectedRoute><PersonalDetailsPage /></ProtectedRoute>} />
      <Route path="/book/chamber" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/book/slots" element={<ProtectedRoute><TimeSlotsPage /></ProtectedRoute>} />
      <Route path="/book/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/book/confirm" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />

      {/* Astrologer Portal */}
      <Route path="/astrologer" element={<AstrologerProtectedRoute><AstrologerLayout /></AstrologerProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailsPage />} />
        <Route path="kundli" element={<KundliPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="consultations" element={<ConsultationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <AppRoutes />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
