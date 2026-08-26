import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CreditCard, Smartphone, Building2, ChevronLeft, Star, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { chamber, date, slot } = (location.state as any) || {};
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loading, setLoading] = useState(false);

  if (!chamber || !date || !slot) {
    navigate('/book');
    return null;
  }

  const displayDate = new Date(date).toLocaleDateString('bn-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  async function handlePay() {
    setLoading(true);
    // Demo: Simulate payment processing for 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    // Create appointment record in Supabase
    const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
    const personalDetails = (location.state as any)?.personalDetails || {};
    
    try {
      await supabase.from('appointments').insert([{
        id: crypto.randomUUID(),
        tenant_id: chamber.tenant_id || user?.id,
        customer_id: user?.id,
        start_time: `${date}T${slot}:00`,
        end_time: `${date}T${slot}:00`,
        status: 'CONFIRMED',
        notes: JSON.stringify({
          bookingId,
          chamberName: chamber.name,
          birthDetails: personalDetails
        }),
      }]);
    } catch (e) {
      console.error("Error saving appointment:", e);
    }

    navigate('/book/confirm', {
      state: { chamber, date: displayDate, slot, bookingId, amount: chamber.advance_amount },
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-bold text-white">AstroVanta</span>
        </Link>
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Shield className="w-4 h-4 text-green-400" />
          নিরাপদ পেমেন্ট
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {['চেম্বার ও তারিখ', 'সময় বেছে নিন', 'পেমেন্ট', 'নিশ্চিত'].map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 text-sm font-medium ${i <= 2 ? 'text-yellow-400' : 'text-white/30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 2 ? 'bg-yellow-400 text-gray-900' : i < 2 ? 'bg-yellow-400/30 text-yellow-400' : 'bg-white/10 text-white/30'}`}>
                  {i < 2 ? '✓' : i + 1}
                </div>
                <span className="hidden md:inline">{s}</span>
              </div>
              {i < 3 && <div className="flex-1 h-px bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* Booking summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4 text-lg">বুকিং সারাংশ</h2>
          <div className="space-y-3">
            {[
              { label: 'চেম্বার', value: chamber.name },
              { label: 'ঠিকানা', value: chamber.address },
              { label: 'তারিখ', value: displayDate },
              { label: 'সময়', value: slot },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start">
                <span className="text-white/50 text-sm">{item.label}</span>
                <span className="text-white text-sm font-medium text-right max-w-[60%]">{item.value}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white font-semibold">অগ্রিম পেমেন্ট</span>
              <span className="text-2xl font-bold text-yellow-400">₹{chamber.advance_amount}</span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-4">পেমেন্ট পদ্ধতি বেছে নিন</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {([
              { id: 'upi', label: 'UPI', icon: <Smartphone className="w-5 h-5" /> },
              { id: 'card', label: 'কার্ড', icon: <CreditCard className="w-5 h-5" /> },
              { id: 'netbanking', label: 'নেট ব্যাংকিং', icon: <Building2 className="w-5 h-5" /> },
            ] as const).map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                  ${paymentMethod === m.id
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'}
                `}
              >
                {m.icon}
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Demo payment form */}
          {paymentMethod === 'upi' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <label className="block text-white/70 text-sm mb-2">UPI আইডি</label>
              <input
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-400 placeholder:text-white/30"
                placeholder="yourname@upi"
                defaultValue="demo@upi"
              />
              <p className="text-white/30 text-xs mt-2">* এটি একটি ডেমো — আসল পেমেন্ট হবে না</p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <input className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-400 placeholder:text-white/30" placeholder="কার্ড নম্বর: 1234 5678 9012 3456" defaultValue="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-3">
                <input className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-400 placeholder:text-white/30" placeholder="MM/YY" defaultValue="12/27" />
                <input className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-400 placeholder:text-white/30" placeholder="CVV" defaultValue="123" />
              </div>
              <p className="text-white/30 text-xs">* এটি একটি ডেমো — আসল পেমেন্ট হবে না</p>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <select className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-400">
                <option value="">ব্যাংক বেছে নিন</option>
                <option>SBI</option>
                <option>HDFC</option>
                <option>ICICI</option>
                <option>Axis</option>
              </select>
              <p className="text-white/30 text-xs mt-2">* এটি একটি ডেমো — আসল পেমেন্ট হবে না</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> আগে যান
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'প্রসেস হচ্ছে...' : `₹${chamber.advance_amount} পেমেন্ট করুন`}
          </button>
        </div>
      </div>
    </div>
  );
}
