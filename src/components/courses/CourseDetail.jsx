import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Plus, Clock, Video, Trash2, Users, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { courseAPI, lessonAPI } from '../../services/api.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import LessonForm from '../lessons/LessonForm.jsx';

const CourseDetail = ({ courseId, onBack, onEditCourse }) => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const { user, canEditCourse } = useAuth();

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      const [courseResponse, lessonsResponse] = await Promise.all([
        courseAPI.getById(courseId),
        lessonAPI.getByCourse(courseId)
      ]);
      
      const courseData = await courseResponse.json();
      const lessonsData = await lessonsResponse.json();
      
      if (courseResponse.ok && lessonsResponse.ok) {
        setCourse(courseData);
        setLessons(lessonsData);
        setError('');
      } else {
        setError('Failed to fetch course details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLessonClick = (lesson) => {
    setLessonToDelete(lesson);
    setShowDeleteModal(true);
  };

  const handleDeleteLessonConfirm = async () => {
    if (!lessonToDelete) return;

    try {
      setDeletingLessonId(lessonToDelete.id);
      const response = await lessonAPI.delete(lessonToDelete.id);
      
      if (response.ok) {
        // Remove the deleted lesson from the state
        setLessons(prevLessons => 
          prevLessons.filter(lesson => lesson.id !== lessonToDelete.id)
        );
        setShowDeleteModal(false);
        setLessonToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete lesson');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleDeleteLessonCancel = () => {
    setShowDeleteModal(false);
    setLessonToDelete(null);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setShowCreateLesson(true);
  };

  const handleLessonSaved = () => {
    setShowCreateLesson(false);
    setEditingLesson(null);
    fetchCourseAndLessons();
  };

  const handleCloseLessonForm = () => {
    setShowCreateLesson(false);
    setEditingLesson(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalDuration = () => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0);
  };

  const getLessonIndex = (lessonId) => {
    return lessons.findIndex(lesson => lesson.id === lessonId) + 1;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCourseAndLessons} />;
  if (!course) return <ErrorMessage message="Course not found" />;

  const canEdit = canEditCourse(course);

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 focus:outline-none focus:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </button>
      
      {/* Course header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{course.title}</h1>
            <p className="text-gray-600 text-lg mb-4">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>Instructor: {course.instructor}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Created: {formatDate(course.created_at)}</span>
              </div>
              {lessons.length > 0 && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{getTotalDuration()} minutes total</span>
                </div>
              )}
            </div>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onEditCourse(course)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Course
              </button>
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setShowCreateLesson(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Lessons section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Course Lessons ({lessons.length})
          </h2>
        </div>
        
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Video className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-500 mb-4">
              {canEdit ? 
                'Add your first lesson to get started!' : 
                'Lessons will appear here when available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                        Lesson {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{lesson.content}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{lesson.duration} minutes</span>
                      </div>
                      
                      {lesson.video_link && (
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          <a 
                            href={lesson.video_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Watch Video
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {canEdit && (
                    <div className="flex space-x-2 ml-4">
                      {/* Edit button */}
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="text-yellow-600 hover:text-yellow-800 p-2 rounded-md hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                        title="Edit lesson"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteLessonClick(lesson)}
                        disabled={deletingLessonId === lesson.id}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                        title="Delete lesson"
                      >
                        {deletingLessonId === lesson.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Lesson form modal */}
      {showCreateLesson && (
        <LessonForm
          courseId={courseId}
          lesson={editingLesson}
          onClose={handleCloseLessonForm}
          onSave={handleLessonSaved}
        />
      )}

      {/* Delete Lesson Confirmation Modal */}
      {showDeleteModal && lessonToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Lesson</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Are you sure you want to delete this lesson?
              </p>
              <div className="bg-gray-50 p-3 rounded-md mb-3">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Lesson {getLessonIndex(lessonToDelete.id)}: "{lessonToDelete.title}"
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{lessonToDelete.duration} minutes</span>
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone. The lesson content will be permanently removed.
              </p>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleDeleteLessonCancel}
                disabled={deletingLessonId === lessonToDelete.id}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLessonConfirm}
                disabled={deletingLessonId === lessonToDelete.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              >
                {deletingLessonId === lessonToDelete.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Lesson'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;