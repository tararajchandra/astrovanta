import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lon: number, city: string) => void;
  initialLat?: number;
  initialLon?: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function LocationPickerModal({
  open, onClose, onSelect,
  initialLat = 20.5937, initialLon = 78.9629,
}: LocationPickerProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<any>(null);

  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selName, setSelName]     = useState('');
  const [selLat, setSelLat]       = useState(initialLat);
  const [selLon, setSelLon]       = useState(initialLon);
  const [revLoading, setRevLoading] = useState(false);

  const dQuery = useDebounce(query, 500);

  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.maps) return resolve((window as any).google.maps);
      
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve((window as any).google.maps));
        existingScript.addEventListener('error', reject);
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve((window as any).google.maps);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      if (!mapDivRef.current || mapRef.current) return;

      if (GOOGLE_MAPS_API_KEY) {
        try {
          const googleMaps: any = await loadGoogleMaps();
          autocompleteServiceRef.current = new googleMaps.places.AutocompleteService();
          geocoderRef.current = new googleMaps.Geocoder();
          
          const map = new googleMaps.Map(mapDivRef.current, {
            center: { lat: initialLat, lng: initialLon },
            zoom: 5,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy'
          });

          map.addListener('dragend', () => {
            const center = map.getCenter();
            setSelLat(center.lat());
            setSelLon(center.lng());
            reverseGeocodeGoogle(center.lat(), center.lng());
          });
          
          map.addListener('click', (e: any) => {
            map.panTo(e.latLng);
            setSelLat(e.latLng.lat());
            setSelLon(e.latLng.lng());
            reverseGeocodeGoogle(e.latLng.lat(), e.latLng.lng());
          });

          mapRef.current = map;
        } catch (e) {
          console.error("Failed to load Google Maps", e);
        }
      } else {
        import('leaflet').then((leafletModule) => {
          const Lf = leafletModule.default || leafletModule;
          const map = Lf.map(mapDivRef.current!, {
            center: [initialLat, initialLon],
            zoom: 5,
            zoomControl: true,
          });

          Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
          }).addTo(map);

          map.on('moveend', () => {
            const { lat, lng } = map.getCenter();
            setSelLat(lat);
            setSelLon(lng);
            reverseGeocodeOSM(lat, lng);
          });

          map.on('click', (e: any) => {
            map.panTo(e.latlng);
          });

          mapRef.current = map;
          setTimeout(() => map.invalidateSize(), 100);
        });
      }
    }, 80);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open && mapRef.current) {
      if (!GOOGLE_MAPS_API_KEY) {
         mapRef.current.remove();
      }
      mapRef.current = null;
    }
  }, [open]);

  async function reverseGeocodeGoogle(lat: number, lon: number) {
    setRevLoading(true);
    try {
      const response = await geocoderRef.current.geocode({ location: { lat, lng: lon } });
      if (response.results && response.results[0]) {
        let city = '';
        for (const component of response.results[0].address_components) {
          if (component.types.includes('locality')) {
            city = component.long_name;
            break;
          }
        }
        if (!city) {
          city = response.results[0].formatted_address.split(',')[0];
        }
        setSelName(city);
      } else {
        setSelName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch {
      setSelName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } finally {
      setRevLoading(false);
    }
  }

  async function reverseGeocodeOSM(lat: number, lon: number) {
    setRevLoading(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const name = data.address?.city
        || data.address?.town
        || data.address?.village
        || data.address?.county
        || data.display_name?.split(',')[0]
        || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setSelName(name);
    } catch {
      setSelName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } finally {
      setRevLoading(false);
    }
  }

  useEffect(() => {
    if (!dQuery || dQuery.length < 2) { setResults([]); return; }
    setSearching(true);
    
    if (GOOGLE_MAPS_API_KEY && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions({ input: dQuery }, (predictions: any, status: any) => {
        setSearching(false);
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
          setResults(predictions.map((p: any) => ({
            id: p.place_id,
            display_name: p.description,
            isGoogle: true
          })));
        } else {
          setResults([]);
        }
      });
    } else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dQuery)}&limit=6`)
        .then(r => r.json())
        .then(data => setResults(data.map((d: any) => ({
          ...d,
          isGoogle: false
        }))))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }
  }, [dQuery]);

  function flyToGoogle(placeId: string, name: string) {
    setQuery(name);
    setResults([]);
    setSearching(true);
    
    geocoderRef.current.geocode({ placeId }, (results: any, status: any) => {
      setSearching(false);
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lon = location.lng();
        setSelLat(lat);
        setSelLon(lon);
        setSelName(name.split(',')[0].trim());
        
        if (mapRef.current) {
          mapRef.current.panTo(location);
          mapRef.current.setZoom(12);
        }
      }
    });
  }

  function flyToOSM(lat: number, lon: number, name: string) {
    setSelLat(lat); setSelLon(lon); setSelName(name);
    setResults([]); setQuery(name);
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 12, { duration: 1 });
    }
  }

  function handleResultClick(r: any) {
    if (r.isGoogle) {
      flyToGoogle(r.id, r.display_name);
    } else {
      flyToOSM(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',')[0].trim());
    }
  }

  function handleConfirm() {
    const city = selName || `${selLat.toFixed(4)}, ${selLon.toFixed(4)}`;
    onSelect(selLat, selLon, city);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        width: '700px', maxWidth: '95vw',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={15} color="var(--accent-light)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Pick Birth Location</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            {searching
              ? <Loader2 size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
              : <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />}
            <input
              className="input-field"
              style={{ paddingLeft: 32 }}
              placeholder="Search city, area or locality…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          {results.length > 0 && (
            <div style={{
              position: 'absolute', left: 16, right: 16, top: 'calc(100% - 2px)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 10,
            }}>
              {results.map((r: any, i: number) => (
                <div
                  key={i}
                  onClick={() => handleResultClick(r)}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {r.isGoogle ? r.display_name.split(',')[0].trim() : r.display_name.split(',')[0].trim()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.display_name}
                  </div>
                  {!r.isGoogle && (
                    <div style={{ fontSize: '10.5px', color: 'var(--accent-light)', marginTop: 2 }}>
                      {parseFloat(r.lat).toFixed(4)}°N, {parseFloat(r.lon).toFixed(4)}°E
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: '380px', cursor: 'grab' }}>
          <div
            ref={mapDivRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
          
          {/* Fixed Center Marker Overlay */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -100%)',
            zIndex: 1000, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <MapPin size={36} color="#00f2fe" fill="rgba(0, 242, 254, 0.2)" strokeWidth={2} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
            <div style={{ width: 6, height: 6, background: '#00f2fe', borderRadius: '50%', marginTop: -4, boxShadow: '0 0 10px #00f2fe' }}></div>
          </div>

          {/* Hint overlay */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(13,15,20,0.85)', backdropFilter: 'blur(6px)',
            border: '1px solid var(--border)', borderRadius: 20,
            padding: '5px 14px', fontSize: '11.5px', color: 'var(--text-secondary)',
            zIndex: 999, whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            Drag the map to place the pin at your birth location
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {revLoading
              ? <><span className="loader" style={{ width: 12, height: 12, borderWidth: 2 }} /> Looking up…</>
              : selName
                ? <><MapPin size={12} color="var(--success)" /> <span><strong style={{ color: 'var(--text-primary)' }}>{selName}</strong> — {selLat.toFixed(4)}°, {selLon.toFixed(4)}°</span></>
                : `Lat: ${selLat.toFixed(4)}, Lon: ${selLon.toFixed(4)}`
            }
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirm}>
              <MapPin size={13} /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
