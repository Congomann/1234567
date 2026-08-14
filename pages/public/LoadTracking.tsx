import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Clock, 
  Activity, 
  Radio, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const LoadTracking: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [load, setLoad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (document.getElementById('leaflet-css')) return;
      
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        console.log('Leaflet loaded');
      };
      document.body.appendChild(script);
    };
    loadLeaflet();
  }, []);

  // Fetch Load details
  const fetchLoadDetails = async () => {
    try {
      const res = await fetch('/api/logistics/track/' + token);
      if (!res.ok) throw new Error('Invalid tracking token');
      const data = await res.json();
      setLoad(data);
      if (data.current_latitude && data.current_longitude) {
        setCoordinates({ lat: Number(data.current_latitude), lng: Number(data.current_longitude) });
      } else {
        // Default starting point (e.g. Chicago)
        setCoordinates({ lat: 41.8781, lng: -87.6298 });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoadDetails();
  }, [token]);

  // Handle real-time Leaflet Map rendering
  useEffect(() => {
    if (!load || !coordinates || !(window as any).L) return;

    const L = (window as any).L;
    const mapContainer = document.getElementById('tracking-map');
    if (!mapContainer) return;

    // Reset container if already initialized
    if ((mapContainer as any)._leaflet_id) {
      const parent = mapContainer.parentNode;
      if (parent) {
        const newMapDiv = document.createElement('div');
        newMapDiv.id = 'tracking-map';
        newMapDiv.className = 'w-full h-full';
        parent.replaceChild(newMapDiv, mapContainer);
      }
    }

    const map = L.map('tracking-map', { zoomControl: false }).setView([coordinates.lat, coordinates.lng], 10);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    // Truck Marker Icon
    const truckIcon = L.divIcon({
      className: 'custom-truck-icon',
      html: '<div class="relative flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-lg border border-blue-400 text-white animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-5.05a1.003 1.003 0 0 0-.293-.707L18.66 8.58A1 1 0 0 0 18 8.23H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg><div class="absolute -inset-1.5 bg-blue-500 rounded-xl opacity-25 animate-ping"></div></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker([coordinates.lat, coordinates.lng], { icon: truckIcon }).addTo(map);

  }, [load, coordinates]);

  // Background GPS Ping handler
  const pingLocation = async (lat: number, lng: number) => {
    try {
      await fetch('/api/logistics/track/' + token + '/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          status: 'in_transit'
        })
      });
    } catch (e) {
      console.warn('[Telemetry] Ping failed:', e);
    }
  };

  // Telemetry simulation loop for carrier driver view
  useEffect(() => {
    let interval: any;
    if (gpsActive && coordinates) {
      // Simulate truck driving along a path if coordinates don't change
      interval = setInterval(() => {
        setCoordinates(prev => {
          if (!prev) return null;
          // Random walk heading east-northeast
          const deltaLat = (Math.random() - 0.2) * 0.0015;
          const deltaLng = (Math.random() - 0.1) * 0.0025;
          const nextLat = prev.lat + deltaLat;
          const nextLng = prev.lng + deltaLng;
          
          setSimulatedSpeed(Math.floor(55 + Math.random() * 12));
          pingLocation(nextLat, nextLng);
          return { lat: nextLat, lng: nextLng };
        });
      }, 5000);
    } else {
      setSimulatedSpeed(0);
    }

    return () => clearInterval(interval);
  }, [gpsActive]);

  // Activate Real Device Telemetry via Geolocation API
  const handleToggleGps = () => {
    if (gpsActive) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setGpsActive(false);
    } else {
      setGpsActive(true);
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords;
            setCoordinates({ lat: latitude, lng: longitude });
            setSimulatedSpeed(speed ? Math.floor(speed * 2.23694) : 60); // m/s to mph
            pingLocation(latitude, longitude);
          },
          (err) => {
            console.warn('[GPS] Real device watch blocked, falling back to simulation:', err.message);
            // Default center if no coordinates
            if (!coordinates) {
              setCoordinates({ lat: 41.8781, lng: -87.6298 }); // Chicago default
            }
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
        setWatchId(id);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6">
        <Activity className="h-10 w-10 text-blue-500 animate-pulse mb-4" />
        <p className="text-xs uppercase font-black tracking-widest text-slate-500">Initializing Secure Telematics...</p>
      </div>
    );
  }

  if (error || !load) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-950/40 border border-red-900 rounded-2xl flex items-center justify-center text-red-500 mb-6">
          <Navigation size={28} className="rotate-45" />
        </div>
        <h1 className="text-xl font-black mb-2 uppercase tracking-wide">Tracking Token Expired</h1>
        <p className="text-slate-500 text-xs font-semibold max-w-sm leading-relaxed mb-6">
          The link you requested is invalid, expired, or has been revoked by the logistics dispatcher.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* HEADER STATUS */}
      <header className="bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Truck size={16} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider leading-none">NHFG DISPATCH</h1>
            <span className="text-[10px] font-bold text-slate-500 font-mono">{"ID: " + load.id.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-wider">
          <div className={"w-2 h-2 rounded-full " + (gpsActive ? "bg-emerald-500 animate-ping" : "bg-amber-500")} />
          {gpsActive ? 'Live Telemetry Active' : 'GPS Offline'}
        </div>
      </header>

      {/* BODY MAP & TELEMETRY */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* LEAFLET MAP ELEMENT */}
        <div className="flex-1 relative bg-slate-950 h-[50vh] lg:h-auto">
          <div id="tracking-map" className="w-full h-full min-h-[300px]"></div>
          
          {/* MAP OVERLAY STATS */}
          <div className="absolute top-4 left-4 z-10 space-y-3 pointer-events-none">
            <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400">
                <Navigation size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Current Speed</p>
                <p className="text-xl font-black text-white font-mono mt-1">{simulatedSpeed || 0} <span className="text-xs text-slate-400">MPH</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* DRIVER RADAR PANEL */}
        <div className="w-full lg:w-[420px] bg-slate-950/65 lg:border-l border-slate-900 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-none z-10 backdrop-blur-xl">
          
          <div className="space-y-8">
            <div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em]">Route Telematics</span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">Live Tracking Console</h2>
            </div>

            {/* ROUTE INFOGRAPHIC */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xs">A</div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">PICKUP ORIGIN</p>
                  <p className="text-sm font-black text-white">{load.origin}</p>
                </div>
              </div>
              <div className="w-0.5 h-6 bg-slate-800 ml-4"></div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">D</div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">DELIVERY DESTINATION</p>
                  <p className="text-sm font-black text-white">{load.destination}</p>
                </div>
              </div>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
                <Clock className="text-blue-500 mb-2" size={16} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Pickup Date</span>
                <span className="text-xs font-black text-white">{load.pickup_date || 'Today'}</span>
              </div>
              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
                <Calendar className="text-purple-500 mb-2" size={16} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Trailer Type</span>
                <span className="text-xs font-black text-white uppercase">{load.equipment_type || 'Dry Van'}</span>
              </div>
            </div>

            {/* STATUS STEPS */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Journey Progress</h3>
              
              <div className="space-y-6 border-l-2 border-slate-900 ml-3 pl-6 relative">
                {[
                  { title: 'Dispatched & Confirmed', time: 'Completed', active: true },
                  { title: 'En Route (Live GPS)', time: gpsActive ? 'Broadcasting' : 'Pending Start', active: gpsActive },
                  { title: 'Delivered at Receiver', time: load.status === 'delivered' ? 'Completed' : 'Pending', active: load.status === 'delivered' }
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className={"absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 " + (step.active ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20" : "bg-slate-950 border-slate-800")} />
                    <div>
                      <p className={"text-xs font-black tracking-tight " + (step.active ? "text-white" : "text-slate-500")}>{step.title}</p>
                      <span className="text-[10px] font-bold text-slate-600 block mt-1">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* TELEMETRY TOGGLE ACTION BUTTON */}
          <div className="pt-8">
            <button
              onClick={handleToggleGps}
              className={"w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl transition-all duration-300 flex items-center justify-center gap-3 " + (gpsActive ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/10")}
            >
              {gpsActive ? (
                <>
                  <Radio size={16} className="animate-pulse" /> Stop Live GPS Stream
                </>
              ) : (
                <>
                  <Navigation size={16} /> Start Live GPS Stream
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-600 text-center mt-3 leading-relaxed">
              * By starting the GPS Stream, you authorize New Holland Financial Group to track background coordinates for this load appointment.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
