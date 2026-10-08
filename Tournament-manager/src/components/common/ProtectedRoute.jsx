import { Navigate, Outlet } from 'react-router-dom';
// ✅ FIXED: Changed from "../context" to "../../context"
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. Show a loading spinner while checking if the token is valid
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. If not logged in (no user data), redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;