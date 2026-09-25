import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { tournaments, upload } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/common/Loading';
import ImageUpload from '../components/ui/ImageUpload';
import { Save, RefreshCw, Share2, Copy, Check, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getShareUrl, copyToClipboard, resolveImageUrl } from '../utils/helpers';

const Settings = () => {
  const { tournament, tournamentId, loading: tournamentLoading, refreshTournament } = useTournament();
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    logo_url: '',
    season: '',
    status: 'setup',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogoUpload = (file) => {
    setLogoFile(file);
  };

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name || '',
        slogan: tournament.slogan || '',
        logo_url: tournament.logo_url || '',
        season: tournament.season || '',
        status: tournament.status || 'setup',
      });
    }
  }, [tournament]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload = { ...formData };

      if (logoFile) {
        const uploadRes = await upload.logo('tournament', tournamentId, logoFile);
        payload.logo_url = uploadRes.data.data.url;
      }

      await tournaments.update(tournamentId, payload);
      toast.success('Settings updated successfully');
      refreshTournament();
      setLogoFile(null);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = getShareUrl(tournamentId);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm('This will generate a new share link. The old link will stop working. Continue?')) return;
    
    setLoading(true);
    try {
      const newToken = crypto.randomUUID();
      await tournaments.update(tournamentId, { share_token: newToken });
      toast.success('New share link generated');
      refreshTournament();
    } catch (error) {
      console.error('Failed to regenerate token:', error);
      toast.error('Failed to regenerate share link');
    } finally {
      setLoading(false);
    }
  };

  if (tournamentLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tournament Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your tournament details and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2">
            <Card title="General Settings">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tournament Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter tournament name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slogan
                  </label>
                  <Input
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleChange}
                    placeholder="Enter tournament slogan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tournament Logo
                  </label>
                  <ImageUpload
                    onUploadComplete={handleLogoUpload}
                    existingImage={formData.logo_url}
                    imageFolder="tournaments"
                    label="Upload Tournament Logo"
                  />
                  {logoFile && (
                    <p className="text-sm text-green-600 mt-2">✅ New logo selected</p>
                  )}
                  {!logoFile && formData.logo_url && (
                    <p className="text-sm text-blue-600 mt-2">Current logo will be kept</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Season
                  </label>
                  <Input
                    name="season"
                    type="number"
                    value={formData.season}
                    onChange={handleChange}
                    placeholder="2026"
                    min={2000}
                    max={2100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="setup">Setup</option>
                    <option value="active">Active</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button type="submit" disabled={loading}>
                    <Save size={18} className="mr-2" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Share Settings */}
            <Card title="Share Tournament">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Public Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={getShareUrl(tournamentId)}
                      readOnly
                      className="flex-1 bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex-shrink-0"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateToken}
                    disabled={loading}
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Regenerate Link
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Warning: This will invalidate the current share link
                  </p>
                </div>
              </div>
            </Card>

            {/* Tournament Info */}
            <Card title="Tournament Info">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">ID</span>
                  <span className="font-mono text-gray-900">#{tournamentId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900">
                    {tournament?.created_at ? new Date(tournament.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-900">
                    {tournament?.updated_at ? new Date(tournament.updated_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tournament?.status === 'active' ? 'bg-green-100 text-green-800' :
                    tournament?.status === 'finished' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament?.status || 'setup'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card title="Danger Zone" className="border-2 border-red-200">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Permanently delete this tournament and all associated data.
                </p>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this tournament? This action cannot be undone!')) {
                      // Handle delete
                      toast.error('Delete functionality coming soon');
                    }
                  }}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Tournament
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;