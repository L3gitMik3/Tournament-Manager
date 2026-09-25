import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { categories } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/common/Loading';
import { Plus, Edit, Trash2, Trophy, Users, Calendar, Settings } from 'lucide-react';
import { toast } from 'react-toastify';

const ManageCategories = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    teams_per_group: 4,
    status: 'setup',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      loadCategories();
    }
  }, [tournamentId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categories.get(tournamentId);
      setCategoriesData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      teams_per_group: 4,
      status: 'setup',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      teams_per_group: category.teams_per_group || 4,
      status: category.status || 'setup',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Category name is required';
    if (formData.teams_per_group < 2) errors.teams_per_group = 'Must have at least 2 teams per group';
    if (formData.teams_per_group > 20) errors.teams_per_group = 'Maximum 20 teams per group';
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
        name: formData.name.trim(),
        teams_per_group: formData.teams_per_group,
        status: formData.status,
      };

      if (editingCategory) {
        await categories.update(editingCategory.id, data);
        toast.success('Category updated successfully');
      } else {
        await categories.create(data);
        toast.success('Category created successfully');
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will also delete all teams and matches in this category.`)) return;
    
    try {
      await categories.delete(category.id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      setup: 'bg-gray-100 text-gray-800',
      group_stage: 'bg-blue-100 text-blue-800',
      knockout: 'bg-purple-100 text-purple-800',
      finished: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      setup: 'Setup',
      group_stage: 'Group Stage',
      knockout: 'Knockout',
      finished: 'Finished',
    };
    return labels[status] || status;
  };

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Age Categories</h1>
            <p className="text-gray-600 mt-1">
              {tournament?.name} - Manage age groups and divisions
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus size={18} className="mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        {categoriesData.length === 0 ? (
          <Card className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Categories Yet</h3>
            <p className="text-gray-500 mt-2">
              Create your first age category to get started
            </p>
            <Button className="mt-4" onClick={openCreateModal}>
              <Plus size={18} className="mr-2" />
              Create Category
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesData.map((category) => (
              <Card 
                key={category.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Trophy size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(category.status)}`}>
                        {getStatusLabel(category.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-500">Teams per Group</p>
                    <p className="text-xl font-bold text-gray-900">{category.teams_per_group || 4}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Calendar className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-500">Teams</p>
                    <p className="text-xl font-bold text-gray-900">0</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(category)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Category Count */}
        {categoriesData.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Total: {categoriesData.length} categor{categoriesData.length !== 1 ? 'ies' : 'y'}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., U7, U9, U11"
                error={formErrors.name}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Examples: U7, U9, U11, U13, U15, Open, Women's, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teams Per Group
              </label>
              <Input
                type="number"
                value={formData.teams_per_group}
                onChange={(e) => setFormData({ ...formData, teams_per_group: Number(e.target.value) })}
                placeholder="4"
                min={2}
                max={20}
                error={formErrors.teams_per_group}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 2, Maximum 20. Default is 4 teams per group.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="setup">Setup</option>
                <option value="group_stage">Group Stage</option>
                <option value="knockout">Knockout</option>
                <option value="finished">Finished</option>
              </select>
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
              {submitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategories;