import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

export function AstrologerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAstrologer } = useAuth();

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

  if (!user) {
    return <Navigate to="/astrologer/login" replace />;
  }

  if (!isAstrologer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 mb-6">
            You do not have permission to access the Astrologer Portal. Only authorized astrologers can view this section.
          </p>
          <Link to="/" className="inline-block bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2 rounded-xl transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
