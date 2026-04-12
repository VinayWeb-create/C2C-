/**
 * MapServiceSearch — Native Leaflet (No react-leaflet)
 * This is 100% stable and avoids React Context Consumer errors common in some Vite/React18 setups.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinIcon, AdjustmentsHorizontalIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatPrice, CATEGORY_ICONS } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
const DEFAULT_CENTER = [17.385, 78.4867]; // Hyderabad

const MapServiceSearch = ({ services = [], onLocationChange, activeLocation }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerGroup = useRef(null);
  const radiusCircle = useRef(null);
  const myLocationMarker = useRef(null);

  const [locating,     setLocating]     = useState(false);
  const [radius,       setRadius]       = useState(10);
  const [cityQuery,    setCityQuery]    = useState('');
  const [suggestions,  setSuggestions]  = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const debounceRef = useRef(null);

  /* ── Initialize Map ── */
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(
      activeLocation ? [activeLocation.lat, activeLocation.lng] : DEFAULT_CENTER,
      activeLocation ? 13 : 11
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    markerGroup.current = L.layerGroup().addTo(mapInstance.current);

    mapInstance.current.on('moveend', () => {
      if (!mapInstance.current) return;
      const c = mapInstance.current.getCenter();
      
      // If we move away from the active location center, show the "Search Area" button
      if (activeLocation) {
        const dist = L.latLng(c.lat, c.lng).distanceTo(L.latLng(activeLocation.lat, activeLocation.lng));
        if (dist > 500) { // 500 meters threshold
          setShowSearchArea(true);
        }
      } else {
        setShowSearchArea(true);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  /* ── Update Service Markers ── */
  useEffect(() => {
    if (!markerGroup.current) return;
    markerGroup.current.clearLayers();

    services.forEach(svc => {
      const [lng, lat] = svc.location?.coordinates || [0, 0];
      if (!lat || !lng) return;

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#4f46e5;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.2);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:14px;">${CATEGORY_ICONS[svc.category] || '🛠️'}</div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(markerGroup.current);
      
      const popupHtml = `
        <div style="font-family:sans-serif;padding:5px;min-width:150px;">
          <p style="margin:0 0 5px;font-weight:bold;font-size:14px;">${svc.title}</p>
          <p style="margin:0 0 8px;color:#666;font-size:12px;">${svc.location?.city}</p>
          <p style="margin:0 0 10px;font-weight:bold;color:#4f46e5;">${formatPrice(svc.price?.amount)}</p>
          <button onclick="window.location.href='/services/${svc._id}'" style="background:#4f46e5;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:11px;width:100%;">View Details</button>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });
  }, [services]);

  /* ── Update Radius Circle ── */
  useEffect(() => {
    if (!mapInstance.current) return;
    if (radiusCircle.current) mapInstance.current.removeLayer(radiusCircle.current);

    const loc = activeLocation;
    if (loc && loc.lat && loc.lng) {
      radiusCircle.current = L.circle([loc.lat, loc.lng], {
        radius: (loc.radius || radius) * 1000,
        color: '#4f46e5',
        fillColor: '#4f46e5',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(mapInstance.current);
    }
  }, [activeLocation, radius]);

  /* ── Fly To logic ── */
  useEffect(() => {
    if (mapInstance.current && activeLocation) {
      mapInstance.current.flyTo([activeLocation.lat, activeLocation.lng], 13);
    }
  }, [activeLocation?.lat, activeLocation?.lng]);

  /* ── City Search (Nominatim) ── */
  const handleCityInput = (e) => {
    const q = e.target.value;
    setCityQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) return setSuggestions([]);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {} finally { setSearching(false); }
    }, 400);
  };

  const selectSuggestion = (s) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setCityQuery(s.display_name.split(',')[0]);
    setSuggestions([]);
    onLocationChange({ lat, lng, radius });
  };

  const useMyGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      onLocationChange({ lat: coords.latitude, lng: coords.longitude, radius });
      setShowSearchArea(false);
      setLocating(false);
    }, () => setLocating(false));
  };

  const handleSearchArea = () => {
    if (!mapInstance.current) return;
    const center = mapInstance.current.getCenter();
    onLocationChange({ lat: center.lat, lng: center.lng, radius });
    setShowSearchArea(false);
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-900">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <input
            type="text"
            value={cityQuery}
            onChange={handleCityInput}
            placeholder="Search city or area..."
            className="input-field pl-9 py-2 text-sm w-full"
            autoComplete="off"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[2000] overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-400" />
          <select
            value={radius}
            onChange={(e) => {
              const r = parseInt(e.target.value);
              setRadius(r);
              if (activeLocation) onLocationChange({ ...activeLocation, radius: r });
            }}
            className="input-field py-1.5 text-xs w-24"
          >
            {RADIUS_OPTIONS.map((r) => <option key={r} value={r}>{r} km</option>)}
          </select>
        </div>
        <button onClick={useMyGPS} disabled={locating} className="btn-primary py-2 text-xs h-9">
          {locating ? '...' : <><MapPinIcon className="w-3.5 h-3.5" /> Near Me</>}
        </button>
        {activeLocation && (
          <button onClick={() => { setCityQuery(''); onLocationChange(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="relative">
        <div ref={mapRef} style={{ height: '420px', width: '100%', zIndex: 10 }} />
        
        {/* Floating Search Area Button */}
        {showSearchArea && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              onClick={handleSearchArea}
              className="bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 px-4 py-2 
                         rounded-full shadow-xl border border-primary-200 dark:border-primary-800
                         flex items-center gap-2 hover:bg-primary-50 dark:hover:bg-primary-950 
                         transition-all active:scale-95 text-xs font-bold ring-2 ring-primary-500/20"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              SEARCH THIS AREA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapServiceSearch;
