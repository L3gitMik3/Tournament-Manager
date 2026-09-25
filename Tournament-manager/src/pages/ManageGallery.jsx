import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { gallery } from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/common/Loading';
import ImageUpload from '../components/ui/ImageUpload';
import { Plus, Trash2, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import { resolveImageUrl } from '../utils/helpers';

const ManageGallery = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    image_title: '',
    image_url: '',
    category: 'General',
    display_order: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (tournamentId) {
      loadGallery();
    }
  }, [tournamentId]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await gallery.get();
      setGalleryData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      image_title: '',
      image_url: '',
      category: 'General',
      display_order: galleryData.length + 1,
    });
    setImageFile(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.image_title.trim()) errors.image_title = 'Image title is required';
    const hasLocalFile = Boolean(imageFile);
    const hasUrl = Boolean(formData.image_url.trim()) && /^https?:\/\/.+/.test(formData.image_url.trim());
    if (!hasLocalFile && !hasUrl) {
      errors.image_url = 'Choose an image file or enter a valid image URL';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('tournament_name', tournament?.name || 'Kaizen Cup 2026');
      payload.append('image_title', formData.image_title.trim());
      payload.append('category', formData.category);
      payload.append('display_order', String(formData.display_order || 0));

      if (imageFile) {
        payload.append('image', imageFile);
      } else {
        payload.append('image_url', formData.image_url.trim());
      }

      await gallery.add(payload);
      toast.success('Image added successfully');
      setIsModalOpen(false);
      setImageFile(null);
      loadGallery();
    } catch (error) {
      console.error('Failed to add image:', error);
      toast.error(error.response?.data?.error || 'Failed to add image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (image) => {
    if (!confirm(`Are you sure you want to delete "${image.image_title}"?`)) return;
    
    try {
      await gallery.delete(image.id);
      toast.success('Image deleted successfully');
      loadGallery();
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    }
  };

  const categories = ['General', 'U7', 'U9', 'U11', 'U13', 'U15', 'Awards', 'Opening Ceremony', 'Closing Ceremony'];

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Gallery</h1>
            <p className="text-gray-600 mt-1">
              {tournament?.name} - Manage tournament photos
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus size={18} className="mr-2" />
            Add Image
          </Button>
        </div>

        {/* Gallery Grid */}
        {galleryData.length === 0 ? (
          <Card className="text-center py-12">
            <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Gallery Images</h3>
            <p className="text-gray-500 mt-2">
              Add photos to showcase your tournament
            </p>
            <Button className="mt-4" onClick={openCreateModal}>
              <Plus size={18} className="mr-2" />
              Add First Image
            </Button>
          </Card>
        ) : (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    // Filter functionality can be added here
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryData.map((image) => (
                <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative group">
                    <img
                      src={resolveImageUrl(image.image_url, 'gallery')}
                      alt={image.image_title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(image)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs bg-black bg-opacity-60 text-white rounded-full">
                        {image.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {image.image_title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Gallery Count */}
            <div className="mt-4 text-sm text-gray-500">
              Total: {galleryData.length} image{galleryData.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {/* Add Image Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Gallery Image"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Title *
              </label>
              <Input
                value={formData.image_title}
                onChange={(e) => setFormData({ ...formData, image_title: e.target.value })}
                placeholder="e.g., U7 Champions"
                error={formErrors.image_title}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Upload or URL *
              </label>
              <ImageUpload
                onUploadComplete={(file) => setImageFile(file)}
                existingImage={formData.image_url}
                imageFolder="gallery"
                label="Upload Gallery Image"
              />
              <div className="mt-3">
                <Input
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    if (e.target.value.trim()) setImageFile(null);
                  }}
                  placeholder="https://example.com/image.jpg"
                  error={formErrors.image_url}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload a local image or paste a direct image URL.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                placeholder="1"
                min={0}
              />
              <p className="mt-1 text-xs text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            {(formData.image_url || imageFile) && (
              <div className="border rounded-lg p-2">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : resolveImageUrl(formData.image_url, 'gallery')}
                  alt="Preview"
                  className="max-h-48 mx-auto object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+URL';
                  }}
                />
              </div>
            )}
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
              {submitting ? 'Adding...' : 'Add Image'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageGallery;