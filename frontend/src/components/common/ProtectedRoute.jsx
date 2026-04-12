import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loader';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, initialLoad } = useAuth();
  const location = useLocation();

  if (initialLoad) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
