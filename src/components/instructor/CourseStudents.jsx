// Create components/instructor/CourseStudents.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, User } from 'lucide-react';
import { instructorAPI, courseAPI } from '../../services/api.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const CourseStudents = ({ courseId, onBack }) => {
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseAndStudents();
  }, [courseId]);

  const fetchCourseAndStudents = async () => {
    try {
      setLoading(true);
      const [courseResponse, studentsResponse] = await Promise.all([
        courseAPI.getById(courseId),
        instructorAPI.getCourseStudents(courseId)
      ]);
      
      const courseData = await courseResponse.json();
      const studentsData = await studentsResponse.json();
      
      if (courseResponse.ok && studentsResponse.ok) {
        setCourse(courseData);
        setEnrollments(studentsData);
        setError('');
      } else {
        setError('Failed to fetch course and student data');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCourseAndStudents} />;
  if (!course) return <ErrorMessage message="Course not found" />;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 focus:outline-none focus:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Courses
      </button>
      
      {/* Course header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-2" />
          <span>{enrollments.length} student{enrollments.length !== 1 ? 's' : ''} enrolled</span>
        </div>
      </div>
      
      {/* Students list */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Enrolled Students</h2>
        
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</h3>
            <p className="text-gray-500">
              Students will appear here when they enroll in your course.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{enrollment.student}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Enrolled on {formatDate(enrollment.enrolled_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStudents;