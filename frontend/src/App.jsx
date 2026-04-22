import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute    from './components/common/ProtectedRoute';
import Navbar   from './components/common/Navbar';
import Footer   from './components/common/Footer';
import AIChatbot from './components/ai/AIChatbot';
import { motion, AnimatePresence } from 'framer-motion';


// Pages
import HomePage          from './pages/HomePage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ServicesPage      from './pages/ServicesPage';
import ProjectsPage      from './pages/ProjectsPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BookingPage       from './pages/BookingPage';
import UserDashboard     from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import SupportPage       from './pages/SupportPage';
import ForgotPassword    from './pages/ForgotPassword';
import LearningPage      from './pages/LearningPage';
import AdminDashboard     from './pages/AdminDashboard';
import WorkroomPage      from './pages/WorkroomPage';
import ProfileSetupPage   from './pages/ProfileSetupPage';
import ProfilePage from './pages/ProfilePage';
import Loader from './components/common/Loader';
import PlacementPage from './pages/PlacementPage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, initialLoad } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!initialLoad && user) {
      if (!user.isProfileComplete && 
          location.pathname !== '/profile-setup' && 
          location.pathname !== '/login' && 
          location.pathname !== '/register' &&
          location.pathname !== '/forgot-password') {
        navigate('/profile-setup');
      } else if (user.isProfileComplete && location.pathname === '/profile-setup') {
        navigate(user.role === 'provider' ? '/dashboard/provider' : '/dashboard/user');
      }
    }
  }, [location.pathname, user, navigate, initialLoad]);

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Routes location={location}>
              {/* Public */}
              <Route path="/"         element={<HomePage />} />
               <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/projects" element={
                  <ProtectedRoute roles={['provider', 'admin']}>
                    <ProjectsPage />
                  </ProtectedRoute>
                } />
                <Route path="/services" element={
                  <ProtectedRoute roles={['provider', 'admin']}>
                    <ProjectsPage />
                  </ProtectedRoute>
                } />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/learning" element={
                <ProtectedRoute>
                  <LearningPage />
                </ProtectedRoute>
              } />

              {/* Protected — users */}
              <Route path="/book/:id" element={
                <ProtectedRoute roles={['user']}>
                  <BookingPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/user" element={
                <ProtectedRoute roles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } />

              {/* Protected — providers */}
              <Route path="/dashboard/provider" element={
                <ProtectedRoute roles={['provider', 'admin']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/workroom/:id" element={
                <ProtectedRoute roles={['provider', 'admin']}>
                  <WorkroomPage />
                </ProtectedRoute>
              } />

              <Route path="/profile-setup" element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
              <Route path="/placement" element={
                <ProtectedRoute>
                  <PlacementPage />
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={
                <div className="page-container text-center py-32">
                  <p className="text-8xl mb-6 font-black text-gray-200 dark:text-gray-800">404</p>
                  <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Page not found</p>
                  <p className="text-gray-400 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
                  <Link to="/" className="btn-primary">
                    ← Back to Home
                  </Link>
                </div>
              } />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
          <AIChatbot />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
    </>
  );
};

export default App;
