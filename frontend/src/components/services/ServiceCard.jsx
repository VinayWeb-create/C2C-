import { Link } from 'react-router-dom';
import { MapPinIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { formatPrice, CATEGORY_ICONS } from '../../utils/helpers';
import StarRating from '../common/StarRating';

const ServiceCard = ({ service, compact = false }) => {
  const {
    _id, title, category, price, rating,
    location, provider, images, availability, totalBookings,
  } = service;

  return (
    <Link to={`/services/${_id}`} className="group block">
      <div className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative h-44 bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
          {images?.[0] ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">{CATEGORY_ICONS[category] || '🛠️'}</span>
            </div>
          )}
          {/* Category badge */}
          <span className="absolute top-3 left-3 badge bg-white/90 dark:bg-gray-900/90 text-primary-700 dark:text-primary-300 shadow-sm">
            {category}
          </span>
          {totalBookings > 0 && (
            <span className="absolute top-3 right-3 badge bg-black/60 text-white text-[10px]">
              🔥 {totalBookings}+ booked
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>

          {/* Provider */}
          <div className="flex items-center gap-1.5 mb-2">
            {provider?.avatar ? (
              <img src={provider.avatar} alt={provider.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-300 text-[10px] font-bold">
                  {provider?.name?.[0]}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">{provider?.name}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <StarRating rating={rating?.average || 0} size="sm" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {rating?.average?.toFixed(1) || '0.0'} ({rating?.count || 0})
            </span>
          </div>

          {/* Location + Availability */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            {location?.city && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {location.city}
              </span>
            )}
            {availability && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                {availability.startTime}–{availability.endTime}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(price?.amount)}
              </span>
              <span className="text-xs text-gray-400 ml-1">
                /{price?.unit?.replace('per_', '')}
              </span>
            </div>
            <span className="text-xs font-medium text-primary-600 dark:text-primary-400 group-hover:underline">
              Book now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
