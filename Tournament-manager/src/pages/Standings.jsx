import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { standings, categories } from '../api/axios';
import Card from '../components/ui/Card';
import Loading from '../components/common/Loading';
import { Trophy, Users, Calendar, TrendingUp, Medal } from 'lucide-react';
import { getImageUrl } from '../utils/helpers'; // ✅ Import the correct helper

const Standings = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const [standingsData, setStandingsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState('');

  useEffect(() => {
    if (tournamentId) {
      loadCategories();
    }
  }, [tournamentId]);

  useEffect(() => {
    if (selectedCategory) {
      loadStandings();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await categories.get(tournamentId);
      setCategoriesData(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedCategory(res.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStandings = async () => {
    setLoading(true);
    try {
      const res = await standings.get(selectedCategory);
      setStandingsData(res.data.data || []);
      
      // Get unique pools
      const pools = new Set();
      res.data.data?.forEach(s => {
        if (s.pool) pools.add(s.pool);
      });
      if (pools.size > 0) {
        setSelectedPool(Array.from(pools)[0]);
      }
    } catch (error) {
      console.error('Failed to load standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-gray-300';
  };

  const getMedalIcon = (rank) => {
    if (rank <= 3) return <Medal className={`h-5 w-5 ${getMedalColor(rank)}`} />;
    return <span className="text-gray-400 w-5 text-center">{rank}</span>;
  };

  const filteredStandings = standingsData.filter(s => 
    !selectedPool || s.pool === selectedPool
  );

  const getPools = () => {
    const pools = new Set();
    standingsData.forEach(s => {
      if (s.pool) pools.add(s.pool);
    });
    return Array.from(pools);
  };

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Standings</h1>
          <p className="text-gray-600 mt-1">
            {tournament?.name} - Current Standings
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          {getPools().length > 0 && (
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
          )}
        </div>

        {/* Standings Table */}
        {filteredStandings.length === 0 ? (
          <Card className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Standings Available</h3>
            <p className="text-gray-500 mt-2">
              {selectedCategory ? 'No matches have been completed yet' : 'Select a category to view standings'}
            </p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      D
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      L
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GF
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GA
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GD
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStandings.map((team) => (
                    <tr 
                      key={team.team_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMedalIcon(team.rank)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {team.logo_url && (
                            <img
                              src={getImageUrl(team.logo_url, 'teams')} // ✅ Fixed
                              alt={team.team_name}
                              className="h-8 w-8 object-contain"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="font-medium text-gray-900">
                            {team.team_name}
                          </span>
                          {team.pool && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {team.pool}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {team.played}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">
                        {team.won}
                      </td>
                      <td className="px-4 py-3 text-center text-yellow-600 font-medium">
                        {team.drawn}
                      </td>
                      <td className="px-4 py-3 text-center text-red-600 font-medium">
                        {team.lost}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {team.goals_for}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {team.goals_against}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        <span className={team.goal_diff >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {team.goal_diff > 0 ? '+' : ''}{team.goal_diff}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600 text-lg">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Gold - 1st Place
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                Silver - 2nd Place
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-amber-700 rounded-full mr-2"></span>
                Bronze - 3rd Place
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Standings;