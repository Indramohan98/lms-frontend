import React, { useState } from 'react';
import { X } from 'lucide-react';
import { lessonAPI } from '../../services/api.js';
import ErrorMessage from '../common/ErrorMessage.jsx';

const LessonForm = ({ courseId, lesson, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    content: lesson?.content || '',
    video_link: lesson?.video_link || '',
    duration: lesson?.duration || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = lesson 
        ? await lessonAPI.update(lesson.id, formData)
        : await lessonAPI.create(courseId, formData);
      
      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        setError(data.detail || data.message || 'Failed to save lesson');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {lesson ? 'Edit Lesson' : 'Create New Lesson'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}
          
          <div className="mb-4">
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lesson Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter lesson title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="content" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lesson Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write the lesson content, instructions, or materials"
              required
            />
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="video_link" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Video Link (Optional)
            </label>
            <input
              type="url"
              id="video_link"
              name="video_link"
              value={formData.video_link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/video"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add a YouTube, Vimeo, or other video URL
            </p>
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="duration" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Duration (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
              required
              min="1"
              max="600"
            />
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (lesson ? 'Update Lesson' : 'Create Lesson')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonForm;