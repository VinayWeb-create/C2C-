import { useState } from 'react';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CATEGORIES } from '../../utils/helpers';

const ServiceFilter = ({ filters, onChange }) => {
  const [open, setOpen] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const reset = () =>
    onChange({ category: '', minPrice: '', maxPrice: '', rating: '', city: '', sort: '-rating.average' });

  const activeCount = ['category','minPrice','maxPrice','rating','city']
    .filter((k) => filters[k]).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-40 w-72 card shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Filters</h4>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => update('category', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price Range (₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => update('minPrice', e.target.value)}
                className="input-field text-sm w-1/2"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => update('maxPrice', e.target.value)}
                className="input-field text-sm w-1/2"
              />
            </div>
          </div>

          {/* Min rating */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => update('rating', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Any Rating</option>
              {[4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r}+ Stars</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
            <input
              type="text"
              placeholder="e.g. Hyderabad"
              value={filters.city}
              onChange={(e) => update('city', e.target.value)}
              className="input-field text-sm"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => update('sort', e.target.value)}
              className="input-field text-sm"
            >
              <option value="-rating.average">Top Rated</option>
              <option value="price.amount">Price: Low to High</option>
              <option value="-price.amount">Price: High to Low</option>
              <option value="-createdAt">Newest First</option>
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={reset} className="btn-secondary text-xs flex-1 py-2">Reset</button>
            <button onClick={() => setOpen(false)} className="btn-primary text-xs flex-1 py-2">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFilter;
