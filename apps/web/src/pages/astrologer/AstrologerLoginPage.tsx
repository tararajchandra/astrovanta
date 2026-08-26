import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function AstrologerLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: signInError, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
      setError(`Login Error: ${signInError.message}`);
      setLoading(false);
      return;
    }
    
    // Check role locally first before redirecting to save UX if wrong role
    const user = data.session?.user;
    const role = user?.app_metadata?.role || user?.user_metadata?.role;
    const isAstrologer = role === 'astrologer' || (import.meta.env.VITE_ASTROLOGER_EMAIL && user?.email === import.meta.env.VITE_ASTROLOGER_EMAIL);

    if (!isAstrologer) {
      setError(`Access Denied: Not an Astrologer. (Tip: Add VITE_ASTROLOGER_EMAIL=${user?.email} in .env file)`);
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    
    navigate('/astrologer');
    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    setError('');
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    
    if (signUpError) {
      setError(`Registration Failed: ${signUpError.message}`);
    } else {
      setError('অ্যাকাউন্ট তৈরি হয়েছে! দয়া করে এবার "লগইন করুন" বাটনে ক্লিক করুন। (Note: If Supabase Email Confirmation is ON, you must verify your email first)');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0b0a1a 0%, #1a1740 50%, #0d0b20 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <span className="text-3xl font-bold text-white">AstroVanta</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Astrologer Portal</h1>
          <p className="text-white/50">আপনার অ্যাস্ট্রোলজার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors placeholder:text-white/20"
                placeholder="astrologer@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors placeholder:text-white/20 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                লগইন করুন
              </button>
            </div>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-60"
            >
              অ্যাকাউন্ট নেই? নতুন তৈরি করুন
            </button>
          </div>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <Link to="/" className="text-white/40 font-medium text-sm hover:text-white transition-colors">
              &larr; Customer booking site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
