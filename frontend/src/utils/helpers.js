import { format, formatDistanceToNow } from 'date-fns';

export const formatPrice = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy');

export const formatDateTime = (date) => format(new Date(date), 'dd MMM yyyy, hh:mm a');

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + '...' : str;

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed:   'bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  completed:   'bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-200',
  cancelled:   'bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-200',
  rejected:    'bg-gray-100   text-gray-800   dark:bg-gray-900   dark:text-gray-200',
};

export const CATEGORIES = [
  'Web Development',
  'Graphic Design',
  'Digital Marketing & SEO',
  'Video & Photo Editing',
  'PPT Presentations',
  'Content Writing',
  'UI/UX Design',
  'Data Science',
  'IT Support',
  'Business Consulting',
  'Translation',
  'Voice Over',
  'Other',
];

export const CATEGORY_ICONS = {
  'Web Development': '💻',
  'Graphic Design': '🎨',
  'Digital Marketing & SEO': '🚀',
  'Video & Photo Editing': '🎬',
  'PPT Presentations': '📊',
  'Content Writing': '✍️',
  'UI/UX Design': '✨',
  'Data Science': '🧪',
  'IT Support': '🛠️',
  'Business Consulting': '📈',
  'Translation': '🌐',
  'Voice Over': '🎙️',
  'Other': '🔗',
};
