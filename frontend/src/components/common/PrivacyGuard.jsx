/**
 * PrivacyGuard — Hides sensitive contact/address information
 * behind a lock overlay until the booking reaches a "safe" status.
 *
 * Rules:
 *   - Provider phone on ServiceDetailPage: hidden until user has a
 *     confirmed/in_progress/completed booking for that service.
 *   - Customer address on ProviderDashboard: hidden until provider accepted (confirmed+).
 *   - Provider address on UserDashboard booking card: hidden until confirmed+.
 *
 * Usage:
 *   <PrivacyGuard revealed={booking.status !== 'pending'} label="Customer phone">
 *     <a href="tel:+91...">{phone}</a>
 *   </PrivacyGuard>
 */
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

const PrivacyGuard = ({
  revealed,          // boolean — show content vs. lock shield
  children,          // the sensitive content
  label = 'Information',
  hint,              // optional hint text shown under the lock
  size = 'md',       // 'sm' | 'md' | 'lg'
}) => {
  if (revealed) {
    return (
      <div className="flex items-center gap-1.5 group">
        <LockOpenIcon className={`flex-shrink-0 text-green-500 ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
        <span>{children}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border border-dashed transition
      ${size === 'sm'
        ? 'px-2.5 py-1 border-gray-300 dark:border-gray-600'
        : 'px-3 py-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
      }`}
    >
      <LockClosedIcon className={`flex-shrink-0 text-amber-500 ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      <div>
        <p className={`font-medium text-amber-700 dark:text-amber-400 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          {label} hidden
        </p>
        {hint && size !== 'sm' && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
};

/* ── Convenience: blur a piece of text (e.g. phone number) ── */
export const BlurredText = ({ text, revealed, placeholder = '••••••••••' }) => {
  if (revealed) return <span>{text}</span>;
  return (
    <span className="inline-flex items-center gap-1 select-none">
      <LockClosedIcon className="w-3 h-3 text-amber-500" />
      <span className="text-amber-600 dark:text-amber-400 font-mono text-xs tracking-widest">{placeholder}</span>
    </span>
  );
};

/* ── Status helper: which statuses count as "revealed" ── */
export const isContactRevealed = (status) =>
  ['confirmed', 'in_progress', 'completed'].includes(status);

export default PrivacyGuard;
