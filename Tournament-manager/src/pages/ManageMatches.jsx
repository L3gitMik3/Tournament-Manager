import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { matches, categories, teams } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/common/Loading';
import { 
  Plus, Edit, Trash2, Calendar, 
  CheckCircle, Search, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/helpers'; // ✅ Import the helper

const ManageMatches = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const [matchesData, setMatchesData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    team_1_id: '',
    team_2_id: '',
    pool: '',
    round: 'Group Stage',
    next_match_id: '',
    next_team_slot: '',
    match_time: '',
    venue: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Score modal states
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoringMatch, setScoringMatch] = useState(null);
  const [scoreData, setScoreData] = useState({
    team_1_score: '',
    team_2_score: '',
  });

  useEffect(() => {
    if (tournamentId) {
      loadData();
    }
  }, [tournamentId]);

  useEffect(() => {
    if (selectedCategory) {
      loadTeamsForCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const categoriesRes = await categories.get(tournamentId);
      setCategoriesData(categoriesRes.data.data || []);
      
      if (categoriesRes.data.data && categoriesRes.data.data.length > 0) {
        const firstCategory = categoriesRes.data.data[0];
        setSelectedCategory(firstCategory.id);
        await loadMatches(firstCategory.id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async (categoryId) => {
    try {
      const params = { category_id: categoryId, tournament_id: tournamentId };
      if (selectedStatus) params.status = selectedStatus;
      const res = await matches.get(params);
      setMatchesData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast.error('Failed to load matches');
    }
  };

  const loadTeamsForCategory = async (categoryId) => {
    try {
      const res = await teams.get(categoryId);
      setTeamsData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = Number(e.target.value);
    setSelectedCategory(categoryId);
    loadMatches(categoryId);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    if (selectedCategory) {
      const params = { category_id: selectedCategory, tournament_id: tournamentId };
      if (status) params.status = status;
      matches.get(params).then(res => setMatchesData(res.data.data || []));
    }
  };

  const openCreateModal = () => {
    setEditingMatch(null);
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    setFormData({
      category_id: selectedCategory || categoriesData[0]?.id || '',
      team_1_id: '',
      team_2_id: '',
      pool: '',
      round: 'Group Stage',
      next_match_id: '',
      next_team_slot: '',
      match_time: localDateTime,
      venue: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
    loadTeamsForCategory(selectedCategory || categoriesData[0]?.id);
  };

  const openEditModal = (match) => {
    setEditingMatch(match);
    const matchTime = match.match_time ? new Date(match.match_time).toISOString().slice(0, 16) : '';
    
    setFormData({
      category_id: match.category_id,
      team_1_id: match.team_1_id,
      team_2_id: match.team_2_id,
      pool: match.pool || '',
      round: match.round || 'Group Stage',
      next_match_id: match.next_match_id || '',
      next_team_slot: match.next_team_slot || '',
      match_time: matchTime,
      venue: match.venue || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
    loadTeamsForCategory(match.category_id);
  };

  const openScoreModal = (match) => {
    setScoringMatch(match);
    setScoreData({
      team_1_score: match.team_1_score || '',
      team_2_score: match.team_2_score || '',
    });
    setIsScoreModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.category_id) errors.category_id = 'Category is required';
    if (!formData.team_1_id) errors.team_1_id = 'Team 1 is required';
    if (!formData.team_2_id) errors.team_2_id = 'Team 2 is required';
    if (formData.team_1_id === formData.team_2_id) errors.team_2_id = 'Teams must be different';
    if (!formData.match_time) errors.match_time = 'Match time is required';
    if (!formData.venue) errors.venue = 'Venue is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data = {
        tournament_id: tournamentId,
        category_id: formData.category_id,
        team_1_id: formData.team_1_id,
        team_2_id: formData.team_2_id,
        pool: formData.pool || null,
        round: formData.round || 'Group Stage',
        next_match_id: formData.next_match_id || null,
        next_team_slot: formData.next_team_slot || null,
        match_time: formData.match_time,
        venue: formData.venue,
      };

      if (editingMatch) {
        await matches.update(editingMatch.id, data);
        toast.success('Match updated successfully');
      } else {
        await matches.create(data);
        toast.success('Match created successfully');
      }

      setIsModalOpen(false);
      loadMatches(selectedCategory);
    } catch (error) {
      console.error('Failed to save match:', error);
      toast.error(error.response?.data?.error || 'Failed to save match');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteMatch = async () => {
    if (!scoreData.team_1_score || !scoreData.team_2_score) {
      toast.error('Please enter both scores');
      return;
    }

    setSubmitting(true);
    try {
      await matches.complete(scoringMatch.id, {
        team_1_score: Number(scoreData.team_1_score),
        team_2_score: Number(scoreData.team_2_score),
      });
      toast.success('Match completed successfully');
      setIsScoreModalOpen(false);
      loadMatches(selectedCategory);
    } catch (error) {
      console.error('Failed to complete match:', error);
      toast.error(error.response?.data?.error || 'Failed to complete match');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (match) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    try {
      await matches.delete(match.id);
      toast.success('Match deleted successfully');
      loadMatches(selectedCategory);
    } catch (error) {
      console.error('Failed to delete match:', error);
      toast.error('Failed to delete match');
    }
  };

  const filteredMatches = matchesData.filter(match => {
    const search = searchTerm.toLowerCase();
    return match.team_1_name?.toLowerCase().includes(search) ||
           match.team_2_name?.toLowerCase().includes(search) ||
           match.pool?.toLowerCase().includes(search) ||
           match.venue?.toLowerCase().includes(search);
  });

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Matches</h1>
            <p className="text-gray-600 mt-1">
              {tournament?.name} - Schedule, update, and score matches
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus size={18} className="mr-2" />
            Create Match
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search teams, venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Matches Table */}
        <Card>
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">No Matches Found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? 'No matches match your search' : 'Create your first match to get started'}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={openCreateModal}>
                  <Plus size={18} className="mr-2" /> Create Match
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMatches.map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {/* ✅ Team 1 logo */}
                          {match.team_1_logo && (
                            <img
                              src={getImageUrl(match.team_1_logo, 'teams')}
                              alt={match.team_1_name}
                              className="h-6 w-6 object-contain rounded"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="font-medium">#{match.id} · {match.team_1_name}</span>
                          <span className="text-gray-400 text-sm">vs</span>
                          {match.team_2_logo && (
                            <img
                              src={getImageUrl(match.team_2_logo, 'teams')}
                              alt={match.team_2_name}
                              className="h-6 w-6 object-contain rounded"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="font-medium">{match.team_2_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {match.pool ? (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{match.pool}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{new Date(match.match_time).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(match.match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{match.venue || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {match.status === 'completed' ? (
                          <span className="font-bold text-lg">{match.team_1_score} - {match.team_2_score}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          match.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        {match.next_match_id ? (
                          <span className="inline-flex flex-col rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                            <span>Winner → Match {match.next_match_id}</span>
                            <span className="font-semibold">{match.next_team_slot || 'slot not set'}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">No link</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          {match.status !== 'completed' && (
                            <Button variant="success" size="sm" onClick={() => openScoreModal(match)}>
                              <CheckCircle size={16} />
                            </Button>
                          )}
                          {match.status !== 'completed' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => openEditModal(match)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDelete(match)}>
                                <Trash2 size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="mt-4 text-sm text-gray-500">
          Total: {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Create/Edit Match Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMatch ? 'Edit Match' : 'Create New Match'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setFormData({ ...formData, category_id: id });
                  loadTeamsForCategory(id);
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {formErrors.category_id && <p className="mt-1 text-sm text-red-600">{formErrors.category_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
              <select
                value={formData.round}
                onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Group Stage">Group Stage</option>
                <option value="Quarter-final">Quarter-final</option>
                <option value="Semi-final">Semi-final</option>
                <option value="Final">Final</option>
                <option value="3rd Place">3rd Place</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Match</label>
              <select
                value={formData.next_match_id}
                onChange={(e) => setFormData({ ...formData, next_match_id: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No progression</option>
                {matchesData
                  .filter((match) => match.id !== editingMatch?.id)
                  .map((match) => (
                    <option key={match.id} value={match.id}>
                      Match #{match.id} · {match.round || 'Group Stage'} · {match.team_1_name} vs {match.team_2_name}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Select the match this winner should enter.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Winner Slot</label>
              <select
                value={formData.next_team_slot}
                onChange={(e) => setFormData({ ...formData, next_team_slot: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No progression</option>
                <option value="team_1">Next match: Team 1</option>
                <option value="team_2">Next match: Team 2</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Choose the slot in the next match.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team 1 *</label>
              <select
                value={formData.team_1_id}
                onChange={(e) => setFormData({ ...formData, team_1_id: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.team_1_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Team</option>
                {teamsData.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              {formErrors.team_1_id && <p className="mt-1 text-sm text-red-600">{formErrors.team_1_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team 2 *</label>
              <select
                value={formData.team_2_id}
                onChange={(e) => setFormData({ ...formData, team_2_id: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.team_2_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Team</option>
                {teamsData.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              {formErrors.team_2_id && <p className="mt-1 text-sm text-red-600">{formErrors.team_2_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pool / Group</label>
              <Input
                value={formData.pool}
                onChange={(e) => setFormData({ ...formData, pool: e.target.value })}
                placeholder="e.g., Group A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Field 1"
                error={formErrors.venue}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Match Date & Time *</label>
              <Input
                type="datetime-local"
                value={formData.match_time}
                onChange={(e) => setFormData({ ...formData, match_time: e.target.value })}
                error={formErrors.match_time}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (editingMatch ? 'Update Match' : 'Create Match')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Score Modal */}
      <Modal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        title="Enter Match Score"
        size="sm"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-semibold">
              {scoringMatch?.team_1_name} vs {scoringMatch?.team_2_name}
            </p>
            <p className="text-sm text-gray-500">{scoringMatch?.pool && `Pool: ${scoringMatch.pool}`}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                {scoringMatch?.team_1_name}
              </label>
              <Input
                type="number"
                value={scoreData.team_1_score}
                onChange={(e) => setScoreData({ ...scoreData, team_1_score: e.target.value })}
                placeholder="0"
                min={0}
                className="text-center text-2xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                {scoringMatch?.team_2_name}
              </label>
              <Input
                type="number"
                value={scoreData.team_2_score}
                onChange={(e) => setScoreData({ ...scoreData, team_2_score: e.target.value })}
                placeholder="0"
                min={0}
                className="text-center text-2xl"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsScoreModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="button" variant="success" onClick={handleCompleteMatch} disabled={submitting}>
              <CheckCircle size={18} className="mr-2" />
              {submitting ? 'Saving...' : 'Complete Match'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageMatches;