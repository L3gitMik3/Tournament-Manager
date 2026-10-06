import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tournaments } from '../api/axios';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/common/Loading';
import { Plus, Trophy, ExternalLink, Trash2, Edit, Share2, LogOut } from 'lucide-react';
import { getStatusColor, getStatusLabel, getShareUrl, copyToClipboard, getImageUrl } from '../utils/helpers';
import { toast } from 'react-toastify';

const MyTournaments = () => {
  const [tournamentsList, setTournamentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadTournaments();
  }, [isAuthenticated]);

  const loadTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the working endpoint
      const response = await tournaments.getAll();
      console.log('API Response:', response); // Debug log
      
      // Handle the response correctly
      if (response && response.data) {
        // Check if data is in response.data.data or response.data directly
        const data = response.data.data || response.data;
        setTournamentsList(Array.isArray(data) ? data : []);
        
        if (data.length === 0) {
          toast.info('No tournaments found. Create your first tournament!');
        }
      } else {
        setTournamentsList([]);
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err);
      setError(err.response?.data?.error || 'Failed to load tournaments');
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await tournaments.delete(id);
      setTournamentsList(tournamentsList.filter(t => t.id !== id));
      toast.success(`Tournament "${name}" deleted successfully`);
    } catch (err) {
      toast.error('Failed to delete tournament');
    }
  };

  const handleCopyLink = (id) => {
    const url = getShareUrl(id);
    copyToClipboard(url);
    toast.success('Link copied to clipboard!');
  };

  const handleAccountSwitch = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tournaments</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your tournaments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAccountSwitch}>
              <LogOut size={18} className="mr-2" />
              Switch Account
            </Button>
            <Link to="/create-tournament">
              <Button>
                <Plus size={18} className="mr-2" />
                Create Tournament
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadTournaments}
              className="text-sm text-red-700 underline mt-2 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {tournamentsList.length === 0 ? (
          <Card className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Tournaments Yet</h3>
            <p className="text-gray-500 mt-2">
              Create your first tournament to get started
            </p>
            <Link to="/create-tournament" className="mt-6 inline-block">
              <Button>
                <Plus size={18} className="mr-2" />
                Create Tournament
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournamentsList.map((tournament) => (
                <Card 
                  key={tournament.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-md bg-gray-50">
                    {tournament.logo_url ? (
                      <img
                        src={getImageUrl(tournament.logo_url, 'tournaments')}
                        alt={`${tournament.name} logo`}
                        className="h-full w-full object-contain p-3"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Trophy className="h-12 w-12 text-gray-300" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {tournament.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Season: {tournament.season}
                      </p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(tournament.status)}`}>
                      {getStatusLabel(tournament.status)}
                    </span>
                  </div>

                  {tournament.slogan && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tournament.slogan}</p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xl font-bold text-blue-600">{tournament.categories_count || 0}</p>
                      <p className="text-xs text-gray-500">Categories</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xl font-bold text-green-600">{tournament.teams_count || 0}</p>
                      <p className="text-xs text-gray-500">Teams</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xl font-bold text-purple-600">{tournament.matches_count || 0}</p>
                      <p className="text-xs text-gray-500">Matches</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <Link to={`/t/${tournament.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink size={16} className="mr-1" />
                        View
                      </Button>
                    </Link>

                      <Link to={`/t/${tournament.id}/admin`}>
                        <Button variant="primary" size="sm" className="w-full">
                          <Edit size={16} className="mr-1" />
                          Manage
                        </Button>
                      </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyLink(tournament.id)}
                      className="px-3"
                    >
                      <Share2 size={16} />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(tournament.id, tournament.name)}
                      className="px-3"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <p className="text-xs text-gray-400 pt-4 border-t border-gray-100 mt-4">
                    Created: {tournament.created_at ? new Date(tournament.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </Card>
              ))}
            </div>

            {/* Total Count */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Total: {tournamentsList.length} tournament{tournamentsList.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyTournaments;