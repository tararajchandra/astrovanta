import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Calendar, Clock, MapPin, ChevronRight, Star, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function PersonalDetailsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    dob: '',
    tob: '',
    birthPlace: '',
    latitude: '',
    longitude: '',
  });

  const [scriptLoaded, setScriptLoaded] = useState(false);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not found in env variables.");
      return;
    }

    if ((window as any).google?.maps?.places) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (scriptLoaded && inputRef.current && !autocompleteRef.current) {
      const google = (window as any).google;
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const city = place.name || place.formatted_address?.split(',')[0];
          
          setForm(f => ({
            ...f,
            birthPlace: city || '',
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
        }
      });
    }
  }, [scriptLoaded]);

  function handleContinue() {
    if (!form.name || !form.dob || !form.tob || !form.birthPlace) return;
    navigate('/book/chamber', { state: { personalDetails: form } });
  }

  const isValid = form.name && form.dob && form.tob && form.birthPlace;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-bold text-white">AstroVanta</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/admin/chambers" className="text-yellow-400 text-sm hover:underline hidden md:block">
            অ্যাডমিন প্যানেল (চেম্বার সেটআপ)
          </Link>
          <span className="text-white/50 text-sm hidden md:block">{user?.email}</span>
          <button onClick={signOut} className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress — 5 steps */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {['ব্যক্তিগত তথ্য', 'চেম্বার ও তারিখ', 'সময়', 'পেমেন্ট', 'নিশ্চিত'].map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${i === 0 ? 'text-yellow-400' : 'text-white/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${i === 0 ? 'bg-yellow-400 text-gray-900' : 'bg-white/10 text-white/30'}`}>{i + 1}</div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 4 && <div className="flex-1 h-px bg-white/10 min-w-[10px]" />}
            </React.Fragment>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">আপনার জন্ম বিবরণ দিন</h1>
        <p className="text-white/50 mb-8">কুণ্ডলী বিশ্লেষণের জন্য সঠিক তথ্য দিন</p>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
              <User className="w-4 h-4" /> পুরো নাম *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors placeholder:text-white/30"
              placeholder="আপনার পুরো নাম লিখুন"
              required
            />
          </div>

          {/* DOB + TOB */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" /> জন্ম তারিখ *
              </label>
              <input
                type="date"
                value={form.dob}
                onChange={e => update('dob', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                <Clock className="w-4 h-4" /> জন্ম সময় *
              </label>
              <input
                type="time"
                value={form.tob}
                onChange={e => update('tob', e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* Birth Place */}
          <div className="relative">
            <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4" /> জন্মস্থান *
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                defaultValue={form.birthPlace}
                onChange={e => update('birthPlace', e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 pr-10 outline-none focus:border-yellow-400 transition-colors placeholder:text-white/30"
                placeholder="শহরের নাম টাইপ করুন..."
                autoComplete="off"
              />
            </div>

            {/* Selected place confirmation */}
            {form.latitude && form.longitude && form.birthPlace && (
              <div className="mt-2 flex items-center gap-2 text-green-400 text-xs">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {form.birthPlace} ({parseFloat(form.latitude).toFixed(2)}°N, {parseFloat(form.longitude).toFixed(2)}°E)
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
            <p className="text-blue-300 text-xs leading-relaxed">
              ℹ️ এই তথ্যগুলো কুণ্ডলী গণনার জন্য ব্যবহার করা হবে। সঠিক জন্ম সময় দিলে বিশ্লেষণ আরও নির্ভুল হবে।
            </p>
          </div>

          {/* Continue */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleContinue}
              disabled={!isValid}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              পরবর্তী: চেম্বার বেছে নিন
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
