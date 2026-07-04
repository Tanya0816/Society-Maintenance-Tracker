import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { 
  PhotoIcon, 
  XMarkIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { createComplaint } = useComplaints();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    photos: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState([]);

  const categories = [
    'Plumbing',
    'Electrical', 
    'Structural',
    'Cleaning',
    'Security',
    'Garden',
    'Other',
  ];

  const categoryIcons = {
    'Plumbing': '🔧',
    'Electrical': '⚡',
    'Structural': '🏗️',
    'Cleaning': '🧹',
    'Security': '🔒',
    'Garden': '🌿',
    'Other': '📋'
  };

  const priorityColors = {
    'low': 'from-emerald-500 to-green-500',
    'medium': 'from-amber-500 to-yellow-500', 
    'high': 'from-red-500 to-orange-500',
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [...formData.photos, ...files];
    const newPreviews = [...previewPhotos, ...files.map(file => URL.createObjectURL(file))];
    
    setFormData({ ...formData, photos: newPhotos });
    setPreviewPhotos(newPreviews);
  };

  const removePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = previewPhotos.filter((_, i) => i !== index);
    
    setFormData({ ...formData, photos: newPhotos });
    setPreviewPhotos(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await createComplaint(formData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8 slide-in">
        <div className="flex items-center space-x-3 mb-2">
          <SparklesIcon className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            New Complaint
          </h1>
        </div>
        <p className="text-gray-600 text-lg mt-2">
          Submit a maintenance request and we'll take care of it!
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8 slide-in">
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              <SparklesIcon className="h-4 w-4 mr-2 text-purple-600" />
              Complaint Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-modern text-lg"
              placeholder="e.g., Leaking faucet in kitchen sink"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              <BuildingOfficeIcon className="h-4 w-4 mr-2 text-purple-600" />
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <label key={cat} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={formData.category === cat}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="sr-only"
                    required
                  />
                  <div className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      formData.category === cat 
                        ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105' 
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}>
                    <div className="text-3xl mb-2">{categoryIcons[cat]}</div>
                    <div className="text-sm font-semibold text-gray-800">{cat}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              <SparklesIcon className="h-4 w-4 mr-2 text-purple-600" />
              Priority Level *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['low', 'medium', 'high'].map((priority) => (
                <label key={priority} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      formData.priority === priority 
                        ? `border-purple-500 shadow-xl transform scale-105` 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}>
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${priorityColors[priority]} text-white mb-2`}>
                      <span className="text-xl font-bold">{priority.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-800 capitalize">{priority}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              <PaperAirplaneIcon className="h-4 w-4 mr-2 text-purple-600" />
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="6"
              className="input-modern"
              placeholder="Please describe the issue in detail, including location, when it started, and any other relevant information..."
              required
            />
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              <PhotoIcon className="h-4 w-4 mr-2 text-purple-600" />
              Photos (Optional)
            </label>
            
            {previewPhotos.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {previewPhotos.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${idx + 1}`} 
                      className="w-full h-24 object-cover rounded-xl border-2 border-purple-200 shadow-md" 
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors duration-200 bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient-blue py-4 text-lg font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Submitting Complaint...</span>
                </>
              ) : (
                <>
                  <span>Submit Complaint</span>
                  <PaperAirplaneIcon className="h-6 w-6" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Tips Section */}
      <div className="mt-8 glass-card p-6 slide-in">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <span>Tips for Faster Resolution</span>
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-purple-600 mt-1">✓</span>
            <span>Be specific about the exact location of the issue</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-600 mt-1">✓</span>
            <span>Include clear photos if the issue is visible</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-600 mt-1">✓</span>
            <span>Mention when the issue started and if it's getting worse</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-600 mt-1">✓</span>
            <span>Choose the appropriate priority level based on urgency</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ComplaintForm;