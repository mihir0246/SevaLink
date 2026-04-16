import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Filter, X, Navigation, Loader2, Globe, Map as MapIcon, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { recipientsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function MapView() {
  const { t } = useLanguage();
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeed, setSelectedNeed] = useState<any>(null);
  const [filters, setFilters] = useState({ area: 'all', type: 'all', distance: 15 });
  const [showFilters, setShowFilters] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // High-fidelity map markers
  const createCustomIcon = (color: string) => {
    return new L.DivIcon({
      html: `
        <div class="relative group">
          <div class="w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shadow-2xl border-2 border-white transform transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-[1px]"></div>
        </div>
      `,
      className: 'custom-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-teal-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredNeeds = useMemo(() => {
    return needs.filter(need => {
      if (filters.type !== 'all' && need.needType !== filters.type) return false;
      if (filters.area !== 'all' && need.city !== filters.area) return false;
      return true;
    });
  }, [filters, needs]);

  // Fetch Live Data
  useEffect(() => {
    setLoading(true);
    recipientsAPI.getAll()
      .then(res => {
        // Map backend Recipient model to UI expected format if necessary
        const mapped = res.data.map((r: any) => {
          // Local Mumbai Geocoding Fallback
          let lat = r.lat;
          let lng = r.long;

          if (!lat || !lng) {
            const searchText = `${r.city || ''} ${r.address1 || ''}`.toLowerCase();
            const MUMBAI_LOCS: Record<string, [number, number]> = {
              'kurla': [19.0726, 72.8845],
              'andheri': [19.1136, 72.8697],
              'bandra': [19.0596, 72.8295],
              'borivali': [19.2307, 72.8567],
              'colaba': [18.9067, 72.8147],
              'dadar': [19.0178, 72.8478],
              'juhu': [19.1075, 72.8263],
              'powai': [19.1176, 72.9060],
              'thane': [19.2183, 72.9781],
              'navi mumbai': [19.0330, 73.0297],
              'mumbai': [19.0760, 72.8777]
            };

            let foundMatch = null;
            for (const key of Object.keys(MUMBAI_LOCS)) {
              if (searchText.includes(key)) {
                foundMatch = MUMBAI_LOCS[key];
                break;
              }
            }
            
            // Jitter so markers at the same region don't perfectly overlap
            const center = foundMatch || [19.0760, 72.8777]; // Default to general Mumbai
            lat = center[0] + (Math.random() - 0.5) * 0.02;
            lng = center[1] + (Math.random() - 0.5) * 0.02;
          }
          
          return {
            ...r,
            id: r._id,
            title: `${r.firstName} ${r.lastName}`,
            location: `${r.city || 'Unknown City'}, ${r.address1 || ''}`.replace(/,\s*$/, ''),
            type: r.needType,
            lat,
            lng,
            volunteers: r.assignedAction ? 1 : 0
          };
        });
        
        setNeeds(mapped);
      })
      .catch(err => console.error("Map Fetch Error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Initial Map Load
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([19.0760, 72.8777], 11); // Centered on Mumbai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Add Attribution back at bottom right
    L.control.attribution({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers when filters change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    filteredNeeds.forEach(need => {
      const marker = L.marker([need.lat, need.lng], {
        icon: createCustomIcon(getUrgencyColor(need.urgency))
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div class="p-2 font-sans min-w-[180px]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A]">${need.type}</span>
            <div class="w-2 h-2 rounded-full ${getUrgencyColor(need.urgency)}"></div>
          </div>
          <h3 class="text-sm font-bold text-gray-900 mb-1">${need.title}</h3>
          <p class="text-xs text-gray-500 mb-3">${need.location}</p>
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <span class="text-[10px] font-bold text-gray-400">${need.volunteers} ${t('map.marker.volunteers')}</span>
            <button class="px-3 py-1 bg-[#1E3A8A] text-white rounded-lg text-[10px] font-bold hover:bg-blue-900 transition-colors">${t('common.details')}</button>
          </div>
        </div>
      `, {
        className: 'sevalink-popup',
        closeButton: false
      });

      marker.on('click', () => setSelectedNeed(need));
      markersRef.current.push(marker);
    });
  }, [filteredNeeds]);

  // Sync map center when selection changes
  // Hard-lock the entire dashboard to the viewport height to prevent clipping
  useEffect(() => {
    const originalStyles = {
      htmlHeight: document.documentElement.style.height,
      bodyHeight: document.body.style.height,
      bodyOverflow: document.body.style.overflow,
    };

    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';

    // Ensure the Layout's main container also respects the height
    const main = document.querySelector('main');
    if (main) {
      main.style.height = '100vh';
      main.style.overflow = 'hidden';
    }

    return () => {
      document.documentElement.style.height = originalStyles.htmlHeight;
      document.body.style.height = originalStyles.bodyHeight;
      document.body.style.overflow = originalStyles.bodyOverflow;
      if (main) {
        main.style.height = '';
        main.style.overflow = '';
      }
    };
  }, []);

  // Sync map center when selection changes
  useEffect(() => {
    if (selectedNeed && mapRef.current) {
      mapRef.current.setView([selectedNeed.lat, selectedNeed.lng], 15, { animate: true });
    }
  }, [selectedNeed]);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans bg-gray-50 antialiased">
      {/* Sidebar */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white border-r border-gray-100 flex flex-col z-20 shadow-2xl relative`}>
        <div className="p-6 border-b border-gray-100 bg-white z-30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1E3A8A] tracking-tight">{t('map.title')}</h2>
            <button onClick={() => setShowFilters(false)} className="md:hidden"><X className="w-5 h-5 text-gray-400" /></button>
          </div>

          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-blue-50/50 rounded-2xl -z-10 blur-sm group-focus-within:bg-blue-100 transition-all" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors" />
              <input
                type="text"
                placeholder={t('needs.filter.search')}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#1E3A8A]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 transition-colors hover:border-blue-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('map.filter.area')}</label>
              <select
                value={filters.area}
                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 p-0 cursor-pointer"
              >
                <option value="all">{t('map.filter.global')}</option>
                {Array.from(new Set(needs.map(n => n.city))).filter(Boolean).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('map.filter.category')}</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', l: t('needs.filter.all') },
                  { id: 'Food', l: t('cat.food') },
                  { id: 'Medical', l: t('cat.medical') },
                  { id: 'Shelter', l: t('cat.shelter') },
                  { id: 'Education', l: t('cat.education') }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setFilters({ ...filters, type: c.id })}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm ${
                      filters.type === c.id ? 'bg-[#1E3A8A] text-white' : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {c.l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pb-16" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          {filteredNeeds.map((need) => (
            <motion.div
              layout
              key={need.id}
              onClick={() => setSelectedNeed(need)}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedNeed?.id === need.id ? 'border-[#1E3A8A] bg-blue-50/40 shadow-sm' : 'border-gray-50 hover:bg-gray-50/80 hover:border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{need.title}</h3>
                <div className={`w-2 h-2 rounded-full ${getUrgencyColor(need.urgency)} shadow-sm`} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-gray-400">{need.location} • {need.distance}</p>
                <span className="text-[10px] font-bold text-[#1E3A8A] bg-blue-50 px-1.5 py-0.5 rounded">{need.volunteers}v</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Real Map Native Container */}
      <div className="flex-1 relative bg-gray-100 h-full overflow-hidden">
        <div ref={containerRef} className="h-full w-full z-10" />

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white z-[1000] hidden sm:block">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t('map.legend.title')}</h4>
          <div className="space-y-2.5">
            {[
              { l: t('needs.stat.critical'), c: 'bg-red-600' },
              { l: t('map.legend.high'), c: 'bg-orange-500' },
              { l: t('map.legend.medium'), c: 'bg-teal-500' },
              { l: t('map.legend.low'), c: 'bg-gray-400' }
            ].map(i => (
              <div key={i.l} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${i.c} shadow-sm`} />
                <span className="text-[11px] font-semibold text-gray-700">{i.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .leaflet-container { background: #f8fafc; cursor: crosshair; height: 100% !important; }
        .sevalink-popup .leaflet-popup-content-wrapper { 
          border-radius: 20px; 
          padding: 8px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.15);
        }
        .sevalink-popup .leaflet-popup-tip { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
