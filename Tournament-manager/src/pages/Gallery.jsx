import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { gallery } from '../api/axios';
import Card from '../components/ui/Card';
import Loading from '../components/common/Loading';
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '../utils/helpers';

const Gallery = () => {
  const { tournament, tournamentId, loading: tournamentLoading } = useTournament();
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);

  // Load gallery images when tournament changes
  useEffect(() => {
    if (tournamentId) {
      loadGallery();
    }
  }, [tournamentId]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await gallery.get({
        tournament_id: tournamentId,
      });
      setGalleryData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories from loaded images
  const categories = ['All', ...new Set(galleryData.map(img => img.category || 'General'))];

  // Filter images by selected category
  const filteredImages = selectedCategory === 'All'
    ? galleryData
    : galleryData.filter(img => (img.category || 'General') === selectedCategory);

  // Lightbox controls
  const openLightbox = (image) => {
    setLightboxImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateLightbox = (direction) => {
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < filteredImages.length) {
      setLightboxImage(filteredImages[newIndex]);
    }
  };

  // Handle keyboard events for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  if (tournamentLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">
            {tournament?.name} – Photos and memories
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <Card className="text-center py-12">
            <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Images Found</h3>
            <p className="text-gray-500 mt-2">
              {selectedCategory !== 'All'
                ? `No images in category "${selectedCategory}"`
                : 'No images have been uploaded yet'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => openLightbox(image)}
              >
                <img
                  src={resolveImageUrl(image.image_url, 'gallery')}
                  alt={image.image_title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h4 className="font-semibold truncate">{image.image_title}</h4>
                    <p className="text-sm opacity-80">{image.category || 'General'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Count */}
        {filteredImages.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={36} />
          </button>

          <button
            onClick={() => navigateLightbox(-1)}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 disabled:opacity-50"
            disabled={filteredImages.indexOf(lightboxImage) === 0}
          >
            <ChevronLeft size={48} />
          </button>

          <div className="max-h-[90vh] max-w-[90vw]">
            <img
              src={resolveImageUrl(lightboxImage.image_url, 'gallery')}
              alt={lightboxImage.image_title}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
              <p className="text-lg font-semibold">{lightboxImage.image_title}</p>
              <p className="text-sm opacity-80">{lightboxImage.category || 'General'}</p>
            </div>
          </div>

          <button
            onClick={() => navigateLightbox(1)}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 disabled:opacity-50"
            disabled={filteredImages.indexOf(lightboxImage) === filteredImages.length - 1}
          >
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
            {filteredImages.indexOf(lightboxImage) + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;