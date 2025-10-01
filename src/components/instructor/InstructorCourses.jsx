// Create components/instructor/InstructorCourses.jsx
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { instructorAPI, courseAPI } from '../../services/api.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const InstructorCourses = ({ onSelectCourse, onEditCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getMyCourses();
      const data = await response.json();
      
      if (response.ok) {
        setCourses(data);
        setError('');
      } else {
        setError('Failed to fetch your courses');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setDeletingCourseId(courseToDelete.id);
      const response = await courseAPI.delete(courseToDelete.id);
      
      if (response.ok) {
        // Remove the deleted course from the state
        setCourses(prevCourses => 
          prevCourses.filter(course => course.id !== courseToDelete.id)
        );
        setShowDeleteModal(false);
        setCourseToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete course');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMyCourses} />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
        <p className="text-gray-600 mt-1">
          {courses.length} course{courses.length !== 1 ? 's' : ''} created
        </p>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses created yet</h3>
          <p className="text-gray-500">
            Create your first course to start teaching!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800 flex-1 mr-2">
                    {course.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteClick(course)}
                    disabled={deletingCourseId === course.id}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    title="Delete Course"
                  >
                    {deletingCourseId === course.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(course.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{course.enrolled_count || 0} students</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onSelectCourse(course.id, 'enrolled-students')}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center text-sm transition-colors"
                >
                  <Users className="w-4 h-4 mr-1" />
                  View Students
                </button>
                
                <button
                  onClick={() => onSelectCourse(course.id, 'course-detail')}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center text-sm transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Course Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Course</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Are you sure you want to delete this course?
              </p>
              <p className="text-sm font-medium text-gray-900 mb-2">
                "{courseToDelete.title}"
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone. All enrolled students will lose access to this course.
                {courseToDelete.enrolled_count > 0 && (
                  <span className="block mt-1 font-medium">
                    {courseToDelete.enrolled_count} student{courseToDelete.enrolled_count !== 1 ? 's are' : ' is'} currently enrolled.
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deletingCourseId === courseToDelete.id}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingCourseId === courseToDelete.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              >
                {deletingCourseId === courseToDelete.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Course'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;