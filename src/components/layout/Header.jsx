import React, { useState } from 'react';
import { BookOpen, User, LogOut, Home, GraduationCap, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { USER_ROLES } from '../../utils/constants.js';

const Header = ({ currentView, onNavigate }) => {
  const { user, logout, hasRole } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      // Handle any logout errors if needed
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case USER_ROLES.INSTRUCTOR:
        return 'bg-green-100 text-green-800';
      case USER_ROLES.STUDENT:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.INSTRUCTOR:
        return <GraduationCap className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('courses')}>
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">LearnHub</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Learning Management System</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => onNavigate('courses')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'courses' || currentView === 'course-detail'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4 inline mr-2" />
                All Courses
              </button>
              
              {hasRole(USER_ROLES.STUDENT) && (
                <button
                  onClick={() => onNavigate('my-enrollments')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'my-enrollments'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  My Courses
                </button>
              )}

              {hasRole(USER_ROLES.INSTRUCTOR) && (
                  <button
                    onClick={() => onNavigate('my-courses')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'my-courses' || currentView === 'course-students'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    My Courses
                  </button>
              )}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => onNavigate('courses')}
                className={`p-2 rounded-md ${
                  currentView === 'courses' || currentView === 'course-detail'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="All Courses"
              >
                <Home className="w-5 h-5" />
              </button>
              
              {hasRole(USER_ROLES.STUDENT) && (
                <button
                  onClick={() => onNavigate('my-enrollments')}
                  className={`p-2 rounded-md ${
                    currentView === 'my-enrollments'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="My Courses"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
              )}

              {hasRole(USER_ROLES.INSTRUCTOR) && (
                <button
                  onClick={() => onNavigate('my-courses')}
                  className={`p-2 rounded-md ${
                    currentView === 'my-courses' || currentView === 'course-students'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="My Courses"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* User Info and Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <div className="flex items-center justify-end">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </span>
                  </div>
                </div>
                
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Mobile user info */}
              <div className="sm:hidden">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogoutClick}
                className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={handleLogoutCancel}
              disabled={isLoggingOut}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full p-1 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to log out of your account?
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                You'll need to sign in again to access your account.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Logging out...
                  </>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;