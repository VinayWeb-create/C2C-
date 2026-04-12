import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPinIcon, PhoneIcon, StarIcon, ClockIcon,
  CalendarDaysIcon, CheckCircleIcon, LockClosedIcon,
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import { PageLoader } from '../components/common/Loader';
import StarRating from '../components/common/StarRating';
import { formatPrice, formatDate, timeAgo, CATEGORY_ICONS, STATUS_COLORS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import PrivacyGuard, { isContactRevealed } from '../components/common/PrivacyGuard';

const ServiceDetailPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const [service,        setService]        = useState(null);
  const [reviews,        setReviews]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeImg,      setActiveImg]      = useState(0);
  const [userBooking,    setUserBooking]    = useState(null); // confirmed/in_progress booking

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const requests = [
          api.get(`/services/${id}`),
          api.get(`/reviews/service/${id}`),
        ];
        // Also check if logged-in user has a confirmed booking
        if (user) requests.push(api.get('/bookings/my'));

        const results = await Promise.all(requests);
        setService(results[0].data.service);
        setReviews(results[1].data.reviews);
        if (user && results[2]) {
          const match = results[2].data.bookings.find(
            (b) => b.service?._id === id || b.service === id
          );
          setUserBooking(match || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, user]);

  if (loading) return <PageLoader />;
  if (!service) return (
    <div className="page-container text-center py-20">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-xl font-semibold mb-2">Service not found</h2>
      <Link to="/services" className="btn-primary mt-4">Browse Services</Link>
    </div>
  );

  const { title, category, description, price, rating, location,
          provider, images, availability, tags } = service;

  return (
    <div className="page-container page-enter max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="card overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
              {images?.length > 0 ? (
                <img src={images[activeImg]} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-7xl">{CATEGORY_ICONS[category]}</span>
                </div>
              )}
            </div>
            {images?.length > 1 && (
              <div className="flex gap-2 p-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-primary-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Meta */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 mb-2">
                  {CATEGORY_ICONS[category]} {category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(price?.amount)}
                </div>
                <div className="text-xs text-gray-400">/{price?.unit?.replace('per_', '')}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <StarRating rating={rating?.average || 0} size="sm" />
                <span className="font-medium text-gray-700 dark:text-gray-200">{rating?.average?.toFixed(1)}</span>
                <span>({rating?.count} reviews)</span>
              </div>
              {location?.city && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" /> {location.city}, {location.state}
                </span>
              )}
              {availability && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {availability.startTime}–{availability.endTime}
                </span>
              )}
            </div>

            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">About this service</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Availability */}
          {availability && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" /> Availability
              </h2>
              <div className="flex flex-wrap gap-2">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
                  <span key={day}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      availability.days?.includes(day)
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Customer Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-gray-100 dark:border-gray-800 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 dark:text-primary-300 text-sm font-bold">
                          {rev.user?.name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{rev.user?.name}</p>
                          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(rev.createdAt)}</span>
                        </div>
                        <StarRating rating={rev.rating} size="sm" />
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rev.comment}</p>
                        {rev.providerResponse?.text && (
                          <div className="mt-2 pl-3 border-l-2 border-primary-300 dark:border-primary-700">
                            <p className="text-xs font-medium text-primary-600 dark:text-primary-400">Provider replied:</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{rev.providerResponse.text}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Book CTA */}
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-5">
              <div className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                {formatPrice(price?.amount)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">per {price?.unit?.replace('per_','')}</div>
            </div>

            {user && user.role === 'user' ? (
              <button
                onClick={() => navigate(`/book/${id}`)}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                Book Now
              </button>
            ) : !user ? (
              <button onClick={() => navigate('/login')} className="btn-primary w-full justify-center py-3">
                Login to Book
              </button>
            ) : null}

            <div className="mt-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[
                'Free cancellation up to 24h',
                'Verified professional',
                'Satisfaction guaranteed',
              ].map((txt) => (
                <div key={txt} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {txt}
                </div>
              ))}
            </div>
          </div>

          {/* Provider card */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">About the Provider</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-300 font-bold">{provider?.name?.[0]}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{provider?.name}</p>
                <p className="text-xs text-gray-400">Member since {formatDate(provider?.createdAt)}</p>
              </div>
            </div>

            {/* Privacy-guarded phone */}
            {provider?.phone ? (
              <div className="mb-3">
                {isContactRevealed(userBooking?.status) ? (
                  <a
                    href={`tel:${provider.phone}`}
                    className="btn-secondary w-full justify-center py-2 text-sm"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    {provider.phone}
                  </a>
                ) : (
                  <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <LockClosedIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Phone number is private</p>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {user
                        ? userBooking
                          ? 'Waiting for provider to accept your booking.'
                          : 'Book this service to get the provider\'s contact details.'
                        : 'Login and book this service to unlock contact details.'
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Map link if coordinates are set */}
            {provider?.location?.coordinates?.some(Boolean) && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${provider.location.coordinates[1]},${provider.location.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2"
              >
                <MapPinIcon className="w-3.5 h-3.5" /> View on Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
