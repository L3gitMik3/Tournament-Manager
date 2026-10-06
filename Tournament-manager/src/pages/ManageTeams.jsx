import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { teams, categories } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/common/Loading';
import ImageUpload from '../components/ui/ImageUpload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/helpers'; // ✅ Import the helper

const ManageTeams = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const [teamsData, setTeamsData] = useState([]);
  const [availablePools, setAvailablePools] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [creatingPool, setCreatingPool] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    logo_url: '',
    pool: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      loadData();
    }
  }, [tournamentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesRes = await categories.get(tournamentId);
      setCategoriesData(categoriesRes.data.data || []);
      
      // Load teams for first category
      if (categoriesRes.data.data && categoriesRes.data.data.length > 0) {
        const firstCategory = categoriesRes.data.data[0];
        setSelectedCategory(firstCategory.id);
        await loadTeams(firstCategory.id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async (categoryId) => {
    try {
      const res = await teams.get(categoryId);
      const loadedTeams = res.data.data || [];
      setTeamsData(loadedTeams);
      setAvailablePools([...new Set(loadedTeams.map(team => team.pool?.trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })));
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast.error('Failed to load teams');
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = Number(e.target.value);
    setSelectedCategory(categoryId);
    loadTeams(categoryId);
  };

  const handleFormCategoryChange = async (e) => {
    const categoryId = Number(e.target.value);
    setFormData(prev => ({ ...prev, category_id: categoryId, pool: '' }));
    setCreatingPool(false);
    try {
      const res = await teams.get(categoryId);
      const categoryTeams = res.data.data || [];
      setAvailablePools([...new Set(categoryTeams.map(team => team.pool?.trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })));
    } catch (error) {
      console.error('Failed to load saved groups:', error);
      setAvailablePools([]);
    }
  };

  const handleLogoUpload = (file) => {
    setLogoFile(file);
  };

  const openCreateModal = () => {
    setEditingTeam(null);
    setLogoFile(null);
    setCreatingPool(availablePools.length === 0);
    setFormData({
      category_id: selectedCategory || categoriesData[0]?.id || '',
      name: '',
      logo_url: '',
      pool: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setLogoFile(null);
    setCreatingPool(!team.pool);
    setFormData({
      category_id: team.category_id,
      name: team.name,
      logo_url: team.logo_url || '',
      pool: team.pool || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Team name is required';
    if (!formData.category_id) errors.category_id = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Step 1: Create/Update team
      if (editingTeam) {
        // For update, we need to use FormData to handle logo
        const formDataToSend = new FormData();
        formDataToSend.append('tournament_id', tournamentId);
        formDataToSend.append('category_id', formData.category_id);
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('pool', formData.pool.trim());
        if (logoFile) {
          formDataToSend.append('logo', logoFile);
        }

        // Use FormData for update
        await teams.update(editingTeam.id, formDataToSend);
        toast.success('Team updated successfully');
      } else {
        // Create team with FormData
        const formDataToSend = new FormData();
        formDataToSend.append('tournament_id', tournamentId);
        formDataToSend.append('category_id', formData.category_id);
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('pool', formData.pool.trim());
        if (logoFile) {
          formDataToSend.append('logo', logoFile);
        }

        await teams.create(formDataToSend);
        toast.success('Team created successfully');
      }

      setIsModalOpen(false);
      setSelectedCategory(Number(formData.category_id));
      loadTeams(Number(formData.category_id));
    } catch (error) {
      console.error('Failed to save team:', error);
      toast.error(error.response?.data?.error || 'Failed to save team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (team) => {
    if (!confirm(`Are you sure you want to delete "${team.name}"?`)) return;
    
    try {
      await teams.delete(team.id);
      toast.success('Team deleted successfully');
      loadTeams(selectedCategory);
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Failed to delete team');
    }
  };

  const filteredTeams = teamsData.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.pool && team.pool.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const teamsByPool = filteredTeams.reduce((groups, team) => {
    const pool = team.pool?.trim() || 'Unassigned';
    groups[pool] = [...(groups[pool] || []), team];
    return groups;
  }, {});
  const poolNames = Object.keys(teamsByPool).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Teams</h1>
            <p className="text-gray-600 mt-1">
              {tournament?.name} - Add, edit, or remove teams
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={openCreateModal}>
              <Plus size={18} className="mr-2" />
              Add Team
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
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
              Search Teams
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or pool..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Teams Table */}
        <Card>
          {filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">No Teams Found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? 'No teams match your search' : 'Add your first team to get started'}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={openCreateModal}>
                  <Plus size={18} className="mr-2" />
                  Add Team
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pool
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Logo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {poolNames.map((poolName) => (
                    <React.Fragment key={poolName}>
                      <tr className="bg-blue-50/70">
                        <th colSpan="4" className="px-4 py-2 text-left text-sm font-semibold text-blue-900">
                          {poolName} <span className="font-normal text-blue-700">({teamsByPool[poolName].length} teams)</span>
                        </th>
                      </tr>
                      {teamsByPool[poolName].map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {team.logo_url ? (
                            <img
                              src={getImageUrl(team.logo_url, 'teams')} // ✅ Fixed
                              alt={team.name}
                              className="h-10 w-10 object-contain rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.querySelector('.fallback-logo').style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center fallback-logo" style={{ display: team.logo_url ? 'none' : 'flex' }}>
                            <Users size={20} className="text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-900">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {team.pool ? (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {team.pool}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {team.logo_url ? (
                          <span className="text-sm text-gray-500">Yes</span>
                        ) : (
                          <span className="text-sm text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(team)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(team)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Team Count */}
        <div className="mt-4 text-sm text-gray-500">
          Total: {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
          {searchTerm && ` (filtered from ${teamsData.length})`}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? 'Edit Team' : 'Add New Team'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={handleFormCategoryChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formErrors.category_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.category_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter team name"
                error={formErrors.name}
                required
              />
            </div>

            {/* ✅ Logo Upload with resolved existing image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Logo
              </label>
              <ImageUpload
                onUploadComplete={handleLogoUpload}
                existingImage={getImageUrl(formData.logo_url, 'teams')} // ✅ Pass resolved URL
                label="Upload Team Logo"
              />
              {logoFile && (
                <p className="text-sm text-green-600 mt-1">✅ New logo selected</p>
              )}
              {editingTeam && formData.logo_url && !logoFile && (
                <p className="text-sm text-blue-600 mt-1">Current logo will be kept</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pool / Group</label>
              {creatingPool ? (
                <div className="space-y-2">
                  <Input
                    value={formData.pool}
                    onChange={(e) => setFormData({ ...formData, pool: e.target.value })}
                    placeholder="Enter a new group, e.g. Pool 1"
                  />
                  {availablePools.length > 0 && (
                    <button type="button" className="text-sm text-blue-700 hover:underline" onClick={() => {
                      setCreatingPool(false);
                      setFormData({ ...formData, pool: '' });
                    }}>
                      Choose a saved group
                    </button>
                  )}
                </div>
              ) : (
                <select
                  value={formData.pool}
                  onChange={(e) => {
                    if (e.target.value === '__create_group__') {
                      setCreatingPool(true);
                      setFormData({ ...formData, pool: '' });
                    } else {
                      setFormData({ ...formData, pool: e.target.value });
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No group</option>
                  {availablePools.map((pool) => <option key={pool} value={pool}>{pool}</option>)}
                  <option value="__create_group__">Create a new group...</option>
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTeams;