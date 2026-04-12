import { useState } from 'react';
import { 
  QuestionMarkCircleIcon, ShieldCheckIcon, DocumentTextIcon, 
  LifebuoyIcon, UserGroupIcon, BriefcaseIcon 
} from '@heroicons/react/24/outline';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('help');

  const TABS = [
    { id: 'help',    label: 'Help Center',    icon: QuestionMarkCircleIcon },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheckIcon },
    { id: 'terms',   label: 'Terms of Service', icon: DocumentTextIcon },
  ];

  return (
    <div className="page-container page-enter pb-20">
      <div className="text-center mb-12">
        <h1 className="section-title text-4xl mb-4">Support & Legal</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Everything you need to know about using Smart Local Life securely and efficiently.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-100 dark:border-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card max-w-4xl mx-auto p-8 md:p-12">
        {activeTab === 'help' && (
          <div className="animate-enter">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <LifebuoyIcon className="w-8 h-8 text-primary-600" />
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary-600">
                  <UserGroupIcon className="w-5 h-5" /> For Users
                </h3>
                <div className="space-y-6">
                  <div className="group">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition">How do I book a service?</p>
                    <p className="text-sm text-gray-500 mt-1">Browse our services, select a provider, and click "Book Now". You can choose a time slot that fits your schedule.</p>
                  </div>
                  <div className="group">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition">When do I pay?</p>
                    <p className="text-sm text-gray-500 mt-1">Payments are settled directly with the provider after the service is completed. We support Cash, UPI, and Card.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-600">
                  <BriefcaseIcon className="w-5 h-5" /> For Providers
                </h3>
                <div className="space-y-6">
                  <div className="group">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">How do I get more leads?</p>
                    <p className="text-sm text-gray-500 mt-1">Ensure your profile is complete with high-quality images and maintain a high rating by providing excellent service.</p>
                  </div>
                  <div className="group">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">What is the platform fee?</p>
                    <p className="text-sm text-gray-500 mt-1">Smart Local Life is currently free to use for both users and providers. We want to empower local businesses first.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="animate-enter prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6">Privacy Policy</h2>
            <p className="text-gray-600 dark:text-gray-400">Last Updated: April 12, 2026</p>
            <div className="mt-8 space-y-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              <section>
                <h4 className="font-bold text-gray-900 dark:text-white underline decoration-primary-500 underline-offset-4 mb-3">1. Information We Collect</h4>
                <p>We collect information you provide directly to us when you create an account, including name, phone number, and location details for service matching.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 dark:text-white underline decoration-primary-500 underline-offset-4 mb-3">2. How We Use Information</h4>
                <p>Your data is used solely to facilitate service bookings. We mask your exact address from providers until they accept your booking request to protect your privacy.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 dark:text-white underline decoration-primary-500 underline-offset-4 mb-3">3. Data Security</h4>
                <p>We implement industry-standard encryption and security measures to protect your personal information from unauthorized access.</p>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="animate-enter prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6">Terms of Service</h2>
            <p className="text-gray-600 dark:text-gray-400">Effective Date: April 12, 2026</p>
            <div className="mt-8 space-y-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              <section>
                <h4 className="font-bold text-gray-900 dark:text-white underline decoration-indigo-500 underline-offset-4 mb-3">1. Service Acceptance</h4>
                <p>By using Smart Local Life, you agree to these terms. We act as a marketplace connecting users with independent local service providers.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 dark:text-white underline decoration-indigo-500 underline-offset-4 mb-3">2. User Responsibilities</h4>
                <p>Users must provide accurate information and respect the scheduled time slots. Cancellation within 2 hours of the service may result in temporary account restriction.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 dark:text-white underline decoration-indigo-500 underline-offset-4 mb-3">3. Provider Conduct</h4>
                <p>Providers must maintain high standards of professionalism and honesty. Any harassment or fraudulent activity will result in immediate permanent ban.</p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
