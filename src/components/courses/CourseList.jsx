import React, { useState, useEffect } from 'react';
import { Plus, Eye, Users, Calendar, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { courseAPI, enrollmentAPI } from '../../services/api.js';
import { USER_ROLES } from '../../utils/constants.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const CourseList = ({ onSelectCourse, onCreateCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingCourses, setEnrollingCourses] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ type: '', title: '', message: '', course: null });
  const { user, hasRole } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      const data = await response.json();
      
      if (response.ok) {
        setCourses(data);
        setError('');
      } else {
        setError('Failed to fetch courses');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showEnrollmentModal = (type, title, message, course = null) => {
    setModalData({ type, title, message, course });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData({ type: '', title: '', message: '', course: null });
  };

  const handleEnroll = async (course) => {
    if (enrollingCourses.has(course.id)) return;

    try {
      setEnrollingCourses(prev => new Set([...prev, course.id]));
      const response = await enrollmentAPI.enroll(course.id);
      const data = await response.json();
      
      if (response.ok) {
        showEnrollmentModal(
          'success',
          'Enrollment Successful!',
          `You have been successfully enrolled in "${course.title}". You can now access all course materials and lessons.`,
          course
        );
      } else {
        // Handle different error types
        if (response.status === 400 && data.error?.includes('already enrolled')) {
          showEnrollmentModal(
            'warning',
            'Already Enrolled',
            `You are already enrolled in "${course.title}". You can access the course from your enrolled courses.`,
            course
          );
        } else if (response.status === 403) {
          showEnrollmentModal(
            'error',
            'Enrollment Restricted',
            data.error || 'You do not have permission to enroll in this course.',
            course
          );
        } else {
          showEnrollmentModal(
            'error',
            'Enrollment Failed',
            data.error || data.message || 'Unable to enroll in this course. Please try again.',
            course
          );
        }
      }
    } catch (error) {
      showEnrollmentModal(
        'error',
        'Network Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        course
      );
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(course.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getModalStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: CheckCircle,
          buttonBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          icon: AlertTriangle,
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'error':
      default:
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCourses} />;

  const modalStyles = getModalStyles(modalData.type);
  const IconComponent = modalStyles.icon;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Available Courses</h2>
          <p className="text-gray-600 mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        {(hasRole(USER_ROLES.INSTRUCTOR) || hasRole(USER_ROLES.ADMIN)) && (
          <button
            onClick={onCreateCourse}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </button>
        )}
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
          <p className="text-gray-500">
            {hasRole(USER_ROLES.INSTRUCTOR) ? 
              'Create your first course to get started!' : 
              'Check back later for new courses.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(course.created_at)}</span>
                  </div>
                </div>

                {course.enrolled_count > 0 && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    {course.enrolled_count} student{course.enrolled_count !== 1 ? 's' : ''} enrolled
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onSelectCourse(course.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center text-sm transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                
                {hasRole(USER_ROLES.STUDENT) && (
                  <button
                    onClick={() => handleEnroll(course)}
                    disabled={enrollingCourses.has(course.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors flex items-center justify-center"
                  >
                    {enrollingCourses.has(course.id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enrolling...
                      </>
                    ) : (
                      'Enroll'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${modalStyles.iconBg} flex items-center justify-center mr-3`}>
                <IconComponent className={`w-6 h-6 ${modalStyles.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{modalData.title}</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                {modalData.message}
              </p>
              
              {modalData.course && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {modalData.course.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Instructor: {modalData.course.instructor}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              {modalData.type === 'success' && modalData.course && (
                <button
                  onClick={() => {
                    closeModal();
                    onSelectCourse(modalData.course.id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View Course
                </button>
              )}
              
              <button
                onClick={closeModal}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${modalStyles.buttonBg}`}
              >
                {modalData.type === 'success' ? 'Great!' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;