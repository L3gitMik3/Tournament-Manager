import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { useAuth } from '../hooks/useAuth';
import { tournaments, matches } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/common/Loading';
import { 
  Trophy, Users, Calendar, Image, 
  Clock, CheckCircle, Plus, ArrowRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_categories: 0,
    total_teams: 0,
    total_matches: 0,
    scheduled_matches: 0,
    completed_matches: 0,
    ongoing_matches: 0,
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tournamentId) {
      loadDashboardData();
    }
  }, [tournamentId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await tournaments.getStats(tournamentId);
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const matchesRes = await matches.get({ 
        tournament_id: tournamentId,
        limit: 5 
      });
      setRecentMatches(matchesRes.data.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Categories',
      value: stats.total_categories,
      icon: Trophy,
      color: 'bg-blue-500',
      path: `/t/${tournamentId}/admin/categories`,
    },
    {
      title: 'Teams',
      value: stats.total_teams,
      icon: Users,
      color: 'bg-green-500',
      path: `/t/${tournamentId}/admin/teams`,
    },
    {
      title: 'Total Matches',
      value: stats.total_matches,
      icon: Calendar,
      color: 'bg-purple-500',
      path: `/t/${tournamentId}/admin/matches`,
    },
    {
      title: 'Completed',
      value: stats.completed_matches,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      path: `/t/${tournamentId}/admin/matches`,
    },
  ];

  const quickActions = [
    { label: 'Create Match', icon: Plus, path: `/t/${tournamentId}/admin/matches`, color: 'bg-blue-500' },
    { label: 'Add Team', icon: Users, path: `/t/${tournamentId}/admin/teams`, color: 'bg-green-500' },
    { label: 'Add Category', icon: Trophy, path: `/t/${tournamentId}/admin/categories`, color: 'bg-purple-500' },
    { label: 'Upload Photo', icon: Image, path: `/t/${tournamentId}/admin/gallery`, color: 'bg-pink-500' },
  ];

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="text-gray-600 mt-1">
            {tournament?.name} - Quick overview of your tournament
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link to={stat.path} key={index}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card title="Quick Actions">
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link to={action.path} key={index}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-gray-50"
                    >
                      <div className={`${action.color} p-1.5 rounded mr-3`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      {action.label}
                      <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                    </Button>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Tournament Status */}
            <Card title="Tournament Status" className="mt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    tournament?.status === 'active' ? 'bg-green-100 text-green-800' :
                    tournament?.status === 'finished' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament?.status || 'Setup'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Season</span>
                  <span className="font-medium">{tournament?.season || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-medium">{stats.total_categories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Teams</span>
                  <span className="font-medium">{stats.total_teams}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card title="Recent Matches">
              {recentMatches.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No matches scheduled yet</p>
                  <Link to={`/t/${tournamentId}/admin/matches`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus size={16} className="mr-1" />
                      Create First Match
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{match.team_1_name}</span>
                          <span className="text-gray-400 text-sm">vs</span>
                          <span className="font-medium">{match.team_2_name}</span>
                        </div>
                        {match.status === 'completed' ? (
                          <span className="text-sm font-bold text-green-600">
                            {match.team_1_score} - {match.team_2_score}
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {match.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {new Date(match.match_time).toLocaleDateString()}
                        <Clock size={14} className="ml-3 mr-1" />
                        {new Date(match.match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {recentMatches.length > 0 && (
                <div className="mt-4 text-center">
                  <Link to={`/t/${tournamentId}/admin/matches`}>
                    <Button variant="outline" size="sm">
                      View All Matches
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Match Progress */}
            {stats.total_matches > 0 && (
              <Card title="Match Progress" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium">
                        {stats.completed_matches} / {stats.total_matches}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(stats.completed_matches / stats.total_matches) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-blue-600">{stats.scheduled_matches || 0}</p>
                      <p className="text-xs text-gray-500">Scheduled</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-yellow-600">{stats.ongoing_matches || 0}</p>
                      <p className="text-xs text-gray-500">Ongoing</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-green-600">{stats.completed_matches || 0}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;