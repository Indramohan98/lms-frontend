import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth.js';
import { AuthProvider } from './contexts/AuthProvider.jsx';
import { USER_ROLES } from './utils/constants.js';

// Auth Components
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';

// Layout Components
import Header from './components/layout/Header.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

// Course Components
import CourseList from './components/courses/CourseList.jsx';
import CourseDetail from './components/courses/CourseDetail.jsx';
import CourseForm from './components/courses/CourseForm.jsx';

// Enrollment Components
import StudentEnrollments from './components/enrollment/StudentEnrollments.jsx';

// Instructor Components
import InstructorCourses from './components/instructor/InstructorCourses.jsx'
import CourseStudents from './components/instructor/CourseStudents.jsx'
import { API_BASE_URL } from './utils/constants.js';

// Main App Component
const AppContent = () => {
  const [currentView, setCurrentView] = useState('courses');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState(null);

 console.log('API_BASE_URL in App:', API_BASE_URL);
 console.log('All env variables:', import.meta.env);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading application..." />
      </div>
    );
  }

  // Show auth forms if user is not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Navigation handlers
  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedCourseId(null);
    setEditingCourse(null);
    setShowCourseForm(false);
  };
  

  // const handleSelectCourse = (courseId) => {
  //   setSelectedCourseId(courseId);
  //   setCurrentView('course-detail');
  // };

  const handleSelectCourse = (courseId, mode = 'course-detail') => {
  setSelectedCourseId(courseId);
  setViewMode(mode);
  setCurrentView(mode === 'enrolled-students' ? 'course-students' : 'course-detail');
};

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setCurrentView('courses');
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleCloseCourseForm = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const handleSaveCourse = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
    setRefreshKey(prev => prev + 1);
    // Refresh current view by re-triggering the component
    if (currentView === 'course-detail') {
      // Stay on course detail - the component will refresh automatically
    } else {
      setCurrentView('courses');
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'courses':
        return (
          <CourseList
            key={refreshKey}
            onSelectCourse={handleSelectCourse}
            onCreateCourse={handleCreateCourse}
          />
        );
      
      case 'course-detail':
        if (!selectedCourseId) {
          handleNavigate('courses');
          return null;
        }
        return (
          <CourseDetail
          key={refreshKey}
            courseId={selectedCourseId}
            onBack={handleBackToCourses}
            onEditCourse={handleEditCourse}
          />
        );
      
      case 'my-enrollments':
        if (user.role !== USER_ROLES.STUDENT) {
          handleNavigate('courses');
          return null;
        }
        return (
          <StudentEnrollments onSelectCourse={handleSelectCourse} />
        );

      case 'my-courses':
        if (user.role !== USER_ROLES.INSTRUCTOR) {
          handleNavigate('courses');
          return null;
        }
        return (
          <InstructorCourses 
            onSelectCourse={handleSelectCourse}
            onEditCourse={handleEditCourse}
          />
        );

      case 'course-students':
        if (user.role !== USER_ROLES.INSTRUCTOR || !selectedCourseId) {
          handleNavigate('courses');
          return null;
        }
        return (
          <CourseStudents 
            courseId={selectedCourseId}
            onBack={() => handleNavigate('my-courses')}
          />
        );

      default:
        return (
          <CourseList
            onSelectCourse={handleSelectCourse}
            onCreateCourse={handleCreateCourse}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      {/* Course Form Modal */}
      {showCourseForm && (
        <CourseForm
          course={editingCourse}
          onClose={handleCloseCourseForm}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
};

// Authentication Screen Component
const AuthScreen = () => {
  const [authMode, setAuthMode] = useState('login');

  const handleSwitchToRegister = () => {
    setAuthMode('register');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">LH</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LearnHub</h1>
          <p className="text-gray-600">
            <br/>
            {authMode === 'login' 
              ? 'Sign in to continue your learning journey' 
              : 'Create an account to get started'}
          </p>
        </div>

        {/* Auth Forms - Add debugging here too */}
        <div>
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={handleSwitchToRegister} />
          ) : (
            <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 LearnHub. Built with React & Django REST Framework
          </p>
        </div>
      </div>
    </div>
  );
};

// Root App Component with Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;