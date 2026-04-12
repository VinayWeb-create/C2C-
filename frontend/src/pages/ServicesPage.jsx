import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import ServiceCard from '../components/services/ServiceCard';
import ServiceFilter from '../components/services/ServiceFilter';
import MapServiceSearch from '../components/services/MapServiceSearch';
import Loader from '../components/common/Loader';
import useDebounce from '../hooks/useDebounce';
import useAIStore from '../hooks/useAIStore';
import { SkeletonGrid } from '../components/common/Skeleton';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const aiFilters = useAIStore((state) => state.aiFilters);
  const clearAIFilters = useAIStore((state) => state.clearAIFilters);
  const [geoFilter, setGeoFilter] = useState(
    searchParams.get('lat') && searchParams.get('lng')
      ? { lat: parseFloat(searchParams.get('lat')), lng: parseFloat(searchParams.get('lng')), radius: 10 }
      : null
  );

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    rating:   '',
    city:     '',
    sort:     '-rating.average',
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort: filters.sort });
      if (debouncedSearch)  params.append('search',   debouncedSearch);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.rating)   params.append('rating',   filters.rating);
      if (filters.city)     params.append('city',     filters.city);

      // Geo params
      if (geoFilter) {
        params.append('lat',    geoFilter.lat);
        params.append('lng',    geoFilter.lng);
        params.append('radius', geoFilter.radius || 10);
      }

      const { data } = await api.get(`/services?${params}`);
      setServices(data.services);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.category, filters.minPrice, filters.maxPrice,
      filters.rating, filters.city, filters.sort, geoFilter, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);
  useEffect(() => { setPage(1); }, [filters, geoFilter]);

  // Sync with AI Filters
  useEffect(() => {
    if (aiFilters) {
      setFilters(prev => ({
        ...prev,
        category: aiFilters.category || prev.category,
        maxPrice: aiFilters.maxPrice || prev.maxPrice,
        city: aiFilters.city || prev.city,
      }));
      // Optional: clear after applying or keep it? 
      // Professional UX usually adds a "Sync" badge that can be cleared
    }
  }, [aiFilters]);

  const handleLocationChange = useCallback((loc) => {
    if (!loc) {
      setGeoFilter(null);
      return;
    }
    setGeoFilter({ lat: loc.lat, lng: loc.lng, radius: loc.radius || geoFilter?.radius || 10 });
  }, [geoFilter?.radius]);

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-1">All Services</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {loading ? 'Searching...' : total > 0
              ? `${total} services found${geoFilter ? ' near this location' : ''}`
              : 'No services found'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <ListBulletIcon className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              viewMode === 'map'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search services, skills, providers..."
            className="input-field pl-9"
          />
        </div>
        <ServiceFilter filters={filters} onChange={setFilters} />
      </div>

      {/* Active filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {geoFilter && (
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 gap-1 flex items-center">
            📍 Within {geoFilter.radius} km
            <button onClick={() => setGeoFilter(null)} className="ml-1 hover:text-primary-900">×</button>
          </span>
        )}
        {filters.category && (
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 gap-1">
            {filters.category}
            <button onClick={() => setFilters({ ...filters, category: '' })} className="ml-1 hover:text-primary-900">×</button>
          </span>
        )}
        {filters.city && (
          <span className="badge bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            📍 {filters.city}
            <button onClick={() => setFilters({ ...filters, city: '' })} className="ml-1">×</button>
          </span>
        )}
        {(filters.minPrice || filters.maxPrice) && (
          <span className="badge bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            ₹{filters.minPrice || 0}–{filters.maxPrice || '∞'}
            <button onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })} className="ml-1">×</button>
          </span>
        )}
        
        <AnimatePresence>
          {aiFilters && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="badge bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 gap-1.5 border border-amber-200 dark:border-amber-800"
            >
              <SparklesIcon className="w-3 h-3" />
              Synced with AI
              <button onClick={clearAIFilters} className="ml-1 hover:text-amber-900">×</button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── MAP VIEW ── */}
      {viewMode === 'map' && (
        <div className="mb-8 relative">
          <MapServiceSearch
            services={services}
            onLocationChange={handleLocationChange}
            activeLocation={geoFilter}
          />
        </div>
      )}

      {/* ── LIST / GRID VIEW ── */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : services.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">No services found</h3>
          <p className="text-gray-400 text-sm mb-6">
            {geoFilter ? 'Try increasing the search radius or removing the location filter.' : 'Try adjusting your filters or search query.'}
          </p>
          <button
            onClick={() => {
              setFilters({ search: '', category: '', minPrice: '', maxPrice: '', rating: '', city: '', sort: '-rating.average' });
              setGeoFilter(null);
            }}
            className="btn-secondary text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {services.map((svc) => <ServiceCard key={svc._id} service={svc} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServicesPage;
