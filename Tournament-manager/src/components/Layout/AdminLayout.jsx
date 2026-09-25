// src/components/Layout/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTournament } from '../../context/TournamentContext';
import Loading from '../common/Loading';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Calendar, 
  Image, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  AlertCircle
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, isAuthenticated } = useAuth();
  const { tournament, tournamentId, loading, error } = useTournament();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  // Show loading state
  if (loading) {
    return <Loading fullScreen />;
  }

  // Show error state
  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || `Tournament with ID "${tournamentId}" does not exist.`}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/my-tournaments')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Tournaments
            </button>
            <button
              onClick={() => navigate('/create-tournament')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create New Tournament
            </button>
          </div>
        </div>
      </div>
    );
  }

 const navItems = [
  { label: 'Dashboard', path: `/t/${tournamentId}/admin` },
  { label: 'Matches', path: `/t/${tournamentId}/admin/matches` },
  { label: 'Bracket', path: `/t/${tournamentId}/admin/bracket` },
  { label: 'Teams', path: `/t/${tournamentId}/admin/teams` },
  { label: 'Categories', path: `/t/${tournamentId}/admin/categories` },
  { label: 'Gallery', path: `/t/${tournamentId}/admin/gallery` },
  { label: 'Settings', path: `/t/${tournamentId}/admin/settings` },
];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600 truncate">
              {tournament?.name || 'Admin Panel'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Tournament Admin</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link
              to={`/t/${tournamentId}`}
              className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Home size={20} className="mr-3" />
              View Public Site
            </Link>
            
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;