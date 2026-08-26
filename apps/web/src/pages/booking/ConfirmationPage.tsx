import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Star, Calendar, Clock, MapPin, Download, Home } from 'lucide-react';

export function ConfirmationPage() {
  const location = useLocation();
  const { chamber, date, slot, bookingId, amount } = (location.state as any) || {
    chamber: { name: 'চেম্বার' },
    date: 'তারিখ',
    slot: 'সময়',
    bookingId: 'BK-DEMO',
    amount: 0,
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 print:bg-white print:min-h-0 print:block" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <div className="w-full max-w-lg print:max-w-full print:border-none print:shadow-none">
        {/* Success animation */}
        <div className="text-center mb-8 print:mb-4">
          <div className="relative inline-block print:hidden">
            <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            {[...Array(6)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 print:text-black">অ্যাপয়েন্টমেন্ট নিশ্চিত!</h1>
          <p className="text-white/60 print:text-gray-600">আপনার বুকিং সফলভাবে নিবন্ধিত হয়েছে।</p>
        </div>

        {/* Booking details card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-6 print:border-gray-300 print:shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-white/10 px-6 py-4 flex items-center justify-between print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 print:text-gray-800" />
              <span className="text-white font-semibold print:text-gray-900">বুকিং কনফার্মেশন</span>
            </div>
            <span className="text-yellow-400 text-sm font-mono font-bold print:text-gray-900">{bookingId}</span>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0 print:text-gray-500" />
              <div>
                <div className="text-white/50 text-xs mb-0.5 print:text-gray-500">চেম্বার</div>
                <div className="text-white font-medium print:text-black">{chamber.name}</div>
                <div className="text-white/40 text-xs print:text-gray-600">{chamber.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 print:text-gray-500" />
              <div>
                <div className="text-white/50 text-xs mb-0.5 print:text-gray-500">তারিখ</div>
                <div className="text-white font-medium print:text-black">{date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-green-400 flex-shrink-0 print:text-gray-500" />
              <div>
                <div className="text-white/50 text-xs mb-0.5 print:text-gray-500">সময়</div>
                <div className="text-white font-medium print:text-black">{slot}</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between print:border-gray-200">
              <div>
                <div className="text-white/50 text-xs print:text-gray-500">পরিশোধিত অগ্রিম</div>
                <div className="text-green-400 font-bold text-xl print:text-black">₹{amount}</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-full px-4 py-1.5 text-xs font-semibold print:border-gray-400 print:text-gray-700">
                ✓ কনফার্মড
              </div>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 mb-8 print:hidden">
          <p className="text-blue-300 text-sm leading-relaxed">
            📱 আপনার নিবন্ধিত ফোন নম্বর ও ইমেইলে বিস্তারিত পাঠানো হয়েছে। পরামর্শের দিন ৫ মিনিট আগে উপস্থিত থাকুন।
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white py-3 rounded-xl hover:bg-white/15 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            রিসিট ডাউনলোড / প্রিন্ট
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            হোম পেজে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
