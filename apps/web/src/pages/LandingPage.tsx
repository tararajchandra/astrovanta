import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Moon, Sun, Calendar, FileText, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <span className="text-2xl font-bold text-white tracking-wide">AstroVanta</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/chambers" className="text-yellow-400 text-sm hover:underline hidden md:block">
            Astrologer Login
          </Link>
          <Link to="/login" className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
            Login
          </Link>
          <Link to="/register" className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-yellow-400/30 transition-all">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 pt-24 pb-20 relative overflow-hidden">
        {/* Decorative stars */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white/30 rounded-full" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `pulse ${2 + Math.random() * 2}s infinite`,
          }} />
        ))}
        
        <div className="inline-flex items-center gap-2 bg-white/10 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-yellow-400/20">
          <Sparkles className="w-4 h-4" />
          আপনার জীবনের সঠিক দিকনির্দেশনা পান
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          তারার আলোয়<br />
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            জানুন আপনার ভাগ্য
          </span>
        </h1>

        <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          বিশেষজ্ঞ জ্যোতিষীর সাথে ব্যক্তিগত পরামর্শ নিন। কুণ্ডলী বিশ্লেষণ, দশা পূর্বাভাস এবং জীবনের গুরুত্বপূর্ণ সিদ্ধান্তে সঠিক গাইডেন্স পান।
        </p>

        <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-10 py-4 rounded-full text-lg hover:shadow-2xl hover:shadow-yellow-400/40 transition-all hover:scale-105">
          অ্যাপয়েন্টমেন্ট বুক করুন
          <ArrowRight className="w-5 h-5" />
        </Link>

        <div className="flex items-center justify-center gap-8 mt-12 text-white/50 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            ১০০০+ সন্তুষ্ট গ্রাহক
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            ১৫+ বছরের অভিজ্ঞতা
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            নিরাপদ পেমেন্ট
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-4">আমাদের সেবাসমূহ</h2>
        <p className="text-center text-white/50 mb-14">আপনার প্রয়োজন অনুযায়ী সেরা পরামর্শ</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Sun className="w-7 h-7 text-yellow-400" />,
              title: 'কুণ্ডলী বিশ্লেষণ',
              desc: 'জন্ম তথ্যের উপর ভিত্তি করে বিস্তারিত কুণ্ডলী তৈরি এবং গ্রহের প্রভাব বিশ্লেষণ।',
              color: 'from-yellow-500/10 to-orange-500/10',
              border: 'border-yellow-500/20',
            },
            {
              icon: <Moon className="w-7 h-7 text-blue-400" />,
              title: 'দশা পূর্বাভাস',
              desc: 'বিম্শোত্তরী দশা পদ্ধতিতে আগামী বছরের শুভ-অশুভ সময়ের সম্পূর্ণ বিশ্লেষণ।',
              color: 'from-blue-500/10 to-purple-500/10',
              border: 'border-blue-500/20',
            },
            {
              icon: <FileText className="w-7 h-7 text-green-400" />,
              title: 'পূর্ণ রিপোর্ট',
              desc: 'পরামর্শের পর বিস্তারিত PDF রিপোর্ট, প্রতিকার ও উপায়সহ আপনার কাছে পাঠানো হবে।',
              color: 'from-green-500/10 to-teal-500/10',
              border: 'border-green-500/20',
            },
          ].map((f, i) => (
            <div key={i} className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform`}>
              <div className="bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-20 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-14">কিভাবে বুক করবেন?</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '১', title: 'রেজিস্ট্রেশন করুন', desc: 'নাম, ফোন ও ইমেইল দিয়ে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন', icon: '📝' },
              { step: '২', title: 'চেম্বার বেছে নিন', desc: 'আপনার কাছের চেম্বার ও পছন্দের তারিখ সিলেক্ট করুন', icon: '📍' },
              { step: '৩', title: 'সময় বেছে নিন', desc: 'উপলব্ধ টাইম স্লট থেকে সুবিধামতো সময় বেছে নিন', icon: '⏰' },
              { step: '৪', title: 'পেমেন্ট করুন', desc: 'অগ্রিম পেমেন্ট করুন, অ্যাপয়েন্টমেন্ট কনফার্ম হবে', icon: '✅' },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-yellow-400/40 to-transparent" />}
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 font-bold w-8 h-8 rounded-full text-sm flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <h4 className="text-white font-semibold mb-1">{s.title}</h4>
                <p className="text-white/40 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-24 px-4">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/10 rounded-3xl p-12 backdrop-blur-sm">
          <MessageCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">আজই শুরু করুন</h2>
          <p className="text-white/60 mb-8">জীবনের সঠিক পথ খুঁজে নিতে এখনই অ্যাপয়েন্টমেন্ট বুক করুন।</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-10 py-4 rounded-full text-lg hover:shadow-2xl hover:shadow-yellow-400/40 transition-all">
            এখনই শুরু করুন
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-white/60 text-sm">© 2026 AstroVanta</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/30">
          <span>Powered by Swiss Ephemeris · Vedic Astrology</span>
          <div className="w-px h-4 bg-white/20"></div>
          <Link to="/astrologer/login" className="hover:text-yellow-400 transition-colors">
            Astrologer Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
