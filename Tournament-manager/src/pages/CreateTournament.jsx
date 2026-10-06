import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tournaments, upload } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/common/Loading';
import ImageUpload from '../components/ui/ImageUpload';
import { Trophy, ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateTournament = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    season: new Date().getFullYear(),
  });
  const [formErrors, setFormErrors] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogoUpload = (file) => {
    setLogoFile(file);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Tournament name is required';
    if (!formData.season) errors.season = 'Season is required';
    if (formData.season && formData.season < 2000) errors.season = 'Season must be year 2000 or later';
    if (formData.season && formData.season > 2100) errors.season = 'Season must be year 2100 or earlier';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'season' ? parseInt(value) : value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Step 1: Create tournament without logo
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('slogan', formData.slogan?.trim() || '');
      formDataToSend.append('season', formData.season);
      const res = await tournaments.create(formDataToSend);
      
      if (res.data.success) {
        const tournamentId = res.data.data.id;
        
        // Step 2: Upload logo if exists
        if (logoFile) {
          setUploadingLogo(true);
          try {
            const uploadRes = await upload.logo('tournament', tournamentId, logoFile);
            if (uploadRes.data.success) {
              toast.success('Tournament created with logo!');
            }
          } catch (uploadErr) {
            console.error('Logo upload failed:', uploadErr);
            toast.warning('Tournament created but logo upload failed');
          } finally {
            setUploadingLogo(false);
          }
        } else {
          toast.success('Tournament created successfully!');
        }
        
        navigate(`/t/${tournamentId}/admin`);
      }
    } catch (error) {
      console.error('Failed to create tournament:', error);
      toast.error(error.response?.data?.error || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/my-tournaments');
  };

  if (!isAuthenticated) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="container-custom max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-tournaments')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to My Tournaments
        </button>

        <Card>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Tournament</h1>
            <p className="text-gray-600 mt-1">
              Set up your new tournament and start managing teams and matches
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Tournament Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tournament Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Kaizen Cup 2026"
                  error={formErrors.name}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be displayed publicly on your tournament page
                </p>
              </div>

              {/* Slogan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slogan
                </label>
                <Input
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  placeholder="e.g., Building Champions Through Football"
                />
                <p className="mt-1 text-xs text-gray-500">
                  A short tagline for your tournament
                </p>
              </div>

              {/* ✅ NEW: Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tournament Logo
                </label>
                <ImageUpload
                  onUploadComplete={handleLogoUpload}
                  label="Upload Tournament Logo"
                />
                {uploadingLogo && (
                  <p className="text-sm text-blue-600 mt-1">Uploading logo...</p>
                )}
                {logoFile && !uploadingLogo && (
                  <p className="text-sm text-green-600 mt-1">✅ Logo selected</p>
                )}
              </div>

              {/* Season */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season *
                </label>
                <Input
                  name="season"
                  type="number"
                  value={formData.season}
                  onChange={handleChange}
                  placeholder={new Date().getFullYear()}
                  min={2000}
                  max={2100}
                  error={formErrors.season}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The year this tournament takes place
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {formData.name || '(Not set)'}</p>
                <p><span className="font-medium">Slogan:</span> {formData.slogan || '(Not set)'}</p>
                <p><span className="font-medium">Season:</span> {formData.season || '(Not set)'}</p>
                <p><span className="font-medium">Logo:</span> {logoFile ? '✅ Uploaded' : 'Not uploaded'}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={18} className="mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save size={18} className="mr-2" />
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📌 Next Steps</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Create age categories (e.g., U7, U9, U11)</li>
              <li>Add teams to each category</li>
              <li>Schedule matches</li>
              <li>Enter scores and update standings</li>
              <li>Share the public link with participants</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateTournament;