// API Configuration
export const API_BASE_URL = import.meta.VITE_API_URL;


console.log('Environment variable VITE_API_URL in constants:', import.meta.env.VITE_API_URL);
console.log('Final API_BASE_URL constants:', API_BASE_URL);

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/register/',
  LOGIN: '/login/',
  LOGOUT: '/logout/',
  TOKEN_REFRESH: '/token/refresh/',
  
  // Courses
  COURSES: '/courses/',
  COURSE_CREATE: '/courses/create/',
  COURSE_DETAIL: (id) => `/courses/${id}/`,
  COURSE_EDIT: (id) => `/courses/${id}/edit/`,
  
  // Lessons
  LESSONS: (courseId) => `/courses/${courseId}/lessons/`,
  LESSON_CREATE: (courseId) => `/courses/${courseId}/lessons/create/`,
  LESSON_DETAIL: (id) => `/lessons/${id}/`,
  LESSON_EDIT: (id) => `/lessons/${id}/edit/`,
  
  // Enrollment
  ENROLL: (courseId) => `/courses/${courseId}/enroll/`,
  STUDENT_ENROLLMENTS: (studentId) => `/students/${studentId}/enrollments/`,


  // Instructor specific
  INSTRUCTOR_COURSES: '/instructor/courses/',
  COURSE_ENROLLED_STUDENTS: (courseId) => `/courses/${courseId}/students/`,

};