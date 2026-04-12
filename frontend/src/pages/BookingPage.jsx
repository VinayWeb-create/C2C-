import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api/axios';
import Loader, { PageLoader } from '../components/common/Loader';
import { formatPrice, CATEGORY_ICONS } from '../utils/helpers';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '08:00–09:00','09:00–10:00','10:00–11:00','11:00–12:00',
  '12:00–13:00','13:00–14:00','14:00–15:00','15:00–16:00',
  '16:00–17:00','17:00–18:00','18:00–19:00',
];

const BookingPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [service,  setService]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date,     setDate]     = useState(null);
  const [slot,     setSlot]     = useState('');
  const [payment,  setPayment]  = useState('cash');
  const [notes,    setNotes]    = useState('');
  const [address,  setAddress]  = useState({ street: '', city: '', state: '', pincode: '' });
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    api.get(`/services/${id}`)
      .then(({ data }) => setService(data.service))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const e = {};
    if (!date)              e.date    = 'Please select a date';
    if (!slot)              e.slot    = 'Please select a time slot';
    if (!address.street)    e.street  = 'Street is required';
    if (!address.city)      e.city    = 'City is required';
    if (!address.state)     e.state   = 'State is required';
    if (!address.pincode)   e.pincode = 'Pincode is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const [start, end] = slot.split('–');
      const { data } = await api.post('/bookings', {
        serviceId: id,
        bookingDate: date,
        timeSlot: { start, end },
        address,
        notes,
        paymentMethod: payment,
      });
      toast.success('Booking confirmed! 🎉');
      navigate(`/dashboard/user`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!service) return <div className="page-container text-center py-20">Service not found</div>;

  const tax   = service.price.amount * 0.18;
  const total = service.price.amount + tax;

  return (
    <div className="page-container page-enter max-w-4xl">
      <h1 className="section-title mb-8">Confirm Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

          {/* Date */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-primary-600" /> Select Date
            </h3>
            <DatePicker
              selected={date}
              onChange={setDate}
              minDate={new Date()}
              placeholderText="Pick a date"
              className="input-field w-full"
              dateFormat="dd/MM/yyyy"
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          {/* Time slot */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary-600" /> Select Time Slot
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition border ${
                    slot === s
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.slot && <p className="text-xs text-red-500 mt-2">{errors.slot}</p>}
          </div>

          {/* Address */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-primary-600" /> Service Address
            </h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Street address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className={`input-field ${errors.street ? 'border-red-400' : ''}`}
                />
                {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className={`input-field ${errors.city ? 'border-red-400' : ''}`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className={`input-field ${errors.state ? 'border-red-400' : ''}`}
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
              </div>
              <input
                type="text"
                placeholder="Pincode"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                className={`input-field ${errors.pincode ? 'border-red-400' : ''}`}
              />
              {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            </div>
          </div>

          {/* Payment + Notes */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {['cash','upi','card','netbanking'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayment(m)}
                    className={`py-2 rounded-xl text-xs font-medium border capitalize transition ${
                      payment === m
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {m === 'upi' ? 'UPI' : m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                className="input-field resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center py-3.5 text-base"
          >
            {submitting ? <Loader size="sm" /> : `Confirm Booking — ${formatPrice(Math.round(total))}`}
          </button>
        </form>

        {/* ── Summary sidebar ── */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Order Summary</h3>

            {/* Service info */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
                {CATEGORY_ICONS[service.category]}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{service.title}</p>
                <p className="text-xs text-gray-400">{service.category}</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Base price</span>
                <span>{formatPrice(service.price.amount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>GST (18%)</span>
                <span>{formatPrice(Math.round(tax))}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span>
                <span className="text-primary-600 dark:text-primary-400">{formatPrice(Math.round(total))}</span>
              </div>
            </div>

            {date && slot && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>📅 {date?.toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                <p>⏰ {slot}</p>
                {address.city && <p>📍 {address.city}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
