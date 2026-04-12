import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.svg" alt="C2C Logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              Campus<span className="text-primary-600">to</span>Corporate
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Connecting students and freelancers with corporate opportunities. From classroom projects to career-defining roles.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/"         className="hover:text-primary-600 transition">Home</Link></li>
            <li><Link to="/services" className="hover:text-primary-600 transition">Services</Link></li>
            <li><Link to="/register" className="hover:text-primary-600 transition">Become a Provider</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/support" className="hover:text-primary-600 transition">Help Center</Link></li>
            <li><Link to="/support" className="hover:text-primary-600 transition">Privacy Policy</Link></li>
            <li><Link to="/support" className="hover:text-primary-600 transition">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Smart Local Life. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
