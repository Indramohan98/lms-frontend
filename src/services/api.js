import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants.js';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  return fetch(url, config);
};

// Auth API calls
export const authAPI = {
  register: (userData) => apiRequest(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (credentials) => apiRequest(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  logout: (refreshToken) => apiRequest(API_ENDPOINTS.LOGOUT, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ refresh: refreshToken })
  }),

  refreshToken: (refreshToken) => apiRequest(API_ENDPOINTS.TOKEN_REFRESH, {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken })
  })
};

// Course API calls
export const courseAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.COURSES),
  
  getById: (id) => apiRequest(API_ENDPOINTS.COURSE_DETAIL(id)),
  
  create: (courseData) => apiRequest(API_ENDPOINTS.COURSE_CREATE, {
    method: 'POST',
   headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseData)
  }),
  
  update: (id, courseData) => apiRequest(API_ENDPOINTS.COURSE_EDIT(id), {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseData)
  }),
  
  delete: (id) => apiRequest(API_ENDPOINTS.COURSE_EDIT(id), {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
};

// Lesson API calls
export const lessonAPI = {
  getByCourse: (courseId) => apiRequest(API_ENDPOINTS.LESSONS(courseId)),
  
  getById: (id) => apiRequest(API_ENDPOINTS.LESSON_DETAIL(id)),
  
  create: (courseId, lessonData) => apiRequest(API_ENDPOINTS.LESSON_CREATE(courseId), {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lessonData)
  }),
  
  update: (id, lessonData) => apiRequest(API_ENDPOINTS.LESSON_EDIT(id), {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lessonData)
  }),
  
  delete: (id) => apiRequest(API_ENDPOINTS.LESSON_EDIT(id), {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
};

// Enrollment API calls
export const enrollmentAPI = {
  enroll: (courseId) => apiRequest(API_ENDPOINTS.ENROLL(courseId), {
    method: 'POST',
    headers: getAuthHeaders()
  }),
  
  getStudentEnrollments: (studentId) => apiRequest(API_ENDPOINTS.STUDENT_ENROLLMENTS(studentId), {
    headers: getAuthHeaders()
  })
};

// Instructor specific apis
export const instructorAPI = {
  getMyCourses: () => apiRequest(API_ENDPOINTS.INSTRUCTOR_COURSES, {
    headers: getAuthHeaders()
  }),
  
  getCourseStudents: (courseId) => apiRequest(API_ENDPOINTS.COURSE_ENROLLED_STUDENTS(courseId), {
    headers: getAuthHeaders()
  })
};