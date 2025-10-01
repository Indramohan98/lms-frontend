import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ExternalLink } from 'lucide-react';
import { enrollmentAPI } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const StudentEnrollments = ({ onSelectCourse }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getStudentEnrollments(user.id);
      const data = await response.json();
      
      if (response.ok) {
        setEnrollments(data);
        setError('');
      } else {
        setError('Failed to fetch your enrolled courses');
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchEnrollments} />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Enrolled Courses</h2>
        <p className="text-gray-600 mt-1">
          {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>
      
      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
          <p className="text-gray-500 mb-4">
            You haven't enrolled in any courses yet. Browse available courses to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {enrollment.course}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Enrolled on {formatDate(enrollment.enrolled_at)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span>Student: {enrollment.student}</span>
                </div>
              </div>
              
              <button
                onClick={() => onSelectCourse(enrollment.course.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue Learning
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentEnrollments;