// src/pages/Matches.jsx
import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { matches, categories } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/common/Loading';
import { Calendar, Clock, MapPin, Trophy, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '../utils/helpers';
import { getImageUrl } from '../utils/helpers';

const Matches = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const [matchesData, setMatchesData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPool, setSelectedPool] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedMatch, setExpandedMatch] = useState(null);

  // Load categories on mount
  useEffect(() => {
    if (tournamentId) {
      loadCategories();
    }
  }, [tournamentId]);

  // Load matches when filters change
  useEffect(() => {
    if (tournamentId && selectedCategory) {
      loadMatches();
    }
  }, [tournamentId, selectedCategory, selectedPool, selectedStatus]);

  const loadCategories = async () => {
    try {
      const res = await categories.get(tournamentId);
      setCategoriesData(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedCategory(res.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const loadMatches = async () => {
    setLoading(true);
    try {
      const params = {
        tournament_id: tournamentId,  // ✅ crucial
        category_id: selectedCategory || undefined,
        pool: selectedPool || undefined,
        status: selectedStatus || undefined,
      };
      const res = await matches.get(params);
      setMatchesData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique pools from loaded matches
  const getPools = () => {
    const pools = new Set();
    matchesData.forEach(m => {
      if (m.pool) pools.add(m.pool);
    });
    return Array.from(pools);
  };

  const toggleExpand = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 mt-1">
            {tournament?.name || 'Tournament'} – Match Schedule & Results
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pool
              </label>
              <select
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Pools</option>
                {getPools().map((pool) => (
                  <option key={pool} value={pool}>
                    {pool}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={loadMatches}>
              <Filter size={16} className="mr-1" />
              Apply Filters
            </Button>
          </div>
        </Card>

        {/* Matches List */}
        {matchesData.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Matches Found</h3>
            <p className="text-gray-500 mt-2">
              {selectedCategory || selectedPool || selectedStatus
                ? 'Try adjusting your filters'
                : 'No matches have been scheduled yet'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {matchesData.map((match) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                {/* Match Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(match.status)}`}>
                      {getStatusLabel(match.status)}
                    </span>
                    <span className="text-sm text-gray-500">{match.pool || 'No Pool'}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {match.round || 'Group Stage'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(match.match_time)}
                    </span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatTime(match.match_time)}
                    </span>
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {match.venue || 'TBD'}
                    </span>
                  </div>
                </div>

                {/* Match Teams & Score */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {match.team_1_logo && (
                        <img
                          src={getImageUrl(match.team_1_logo, 'teams')}
                          alt={match.team_1_name}
                          className="h-10 w-10 object-contain"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      )}
                      <span className="text-lg font-semibold">{match.team_1_name}</span>
                    </div>
                  </div>

                  <div className="mx-4 text-center">
                    {match.status === 'completed' ? (
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {match.team_1_score}
                        </span>
                        <span className="text-gray-400 font-bold">VS</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {match.team_2_score}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">VS</span>
                      </div>
                    )}
                    {match.winner_name && (
                      <div className="mt-1 flex items-center justify-center text-sm text-green-600">
                        <Trophy size={14} className="mr-1" />
                        Winner: {match.winner_name}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold">{match.team_2_name}</span>
                      {match.team_2_logo && (
                        <img
                          src={getImageUrl(match.team_2_logo, 'teams')}
                          alt={match.team_2_name}
                          className="h-10 w-10 object-contain"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand Details */}
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(match.id)}
                  >
                    {expandedMatch === match.id ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>

                {expandedMatch === match.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="font-medium">
                          {categoriesData.find(c => c.id === match.category_id)?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Venue</p>
                        <p className="font-medium">{match.venue || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(match.match_time)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">{formatTime(match.match_time)}</p>
                      </div>
                      {match.notes && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Notes</p>
                          <p className="font-medium">{match.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;