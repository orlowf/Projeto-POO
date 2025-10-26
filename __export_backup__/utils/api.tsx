import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-66c2aef3`;

// Store token in memory
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || publicAnonKey}`,
    ...options.headers as Record<string, string>,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// ==================== AUTH API ====================

export const signUp = async (data: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'professor';
  height?: number;
  weight?: number;
  goal?: string;
}) => {
  return fetchAPI('/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const signIn = async (email: string, password: string) => {
  const result = await fetchAPI('/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (result.session?.access_token) {
    setAuthToken(result.session.access_token);
  }
  
  return result;
};

export const getCurrentUser = async () => {
  return fetchAPI('/me');
};

// ==================== WORKOUT API ====================

export const getWorkouts = async () => {
  return fetchAPI('/workouts');
};

export const createWorkout = async (workout: any) => {
  return fetchAPI('/workouts', {
    method: 'POST',
    body: JSON.stringify(workout),
  });
};

export const updateWorkout = async (id: string, workout: any) => {
  return fetchAPI(`/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(workout),
  });
};

export const deleteWorkout = async (id: string) => {
  return fetchAPI(`/workouts/${id}`, {
    method: 'DELETE',
  });
};

export const completeWorkout = async (id: string) => {
  return fetchAPI(`/workouts/${id}/complete`, {
    method: 'POST',
  });
};

// ==================== TEMPLATE API ====================

export const getTemplates = async () => {
  return fetchAPI('/templates');
};

export const createTemplate = async (template: any) => {
  return fetchAPI('/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
};

export const updateTemplate = async (id: string, template: any) => {
  return fetchAPI(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
};

export const deleteTemplate = async (id: string) => {
  return fetchAPI(`/templates/${id}`, {
    method: 'DELETE',
  });
};

export const assignTemplate = async (id: string, studentIds: string[]) => {
  return fetchAPI(`/templates/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ studentIds }),
  });
};

// ==================== STUDENT API ====================

export const getStudents = async () => {
  return fetchAPI('/students');
};

export const addStudent = async (student: { name: string; email: string }) => {
  return fetchAPI('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
};

// ==================== GAMIFICATION API ====================

export const getGamificationData = async () => {
  return fetchAPI('/gamification');
};

// ==================== PROFILE API ====================

export const getProfileData = async () => {
  return fetchAPI('/profile');
};

export const updateProfile = async (data: {
  name?: string;
  email?: string;
  goal?: string;
  height?: number;
  weight?: number;
}) => {
  return fetchAPI('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// ==================== DEBUG API ====================

export const checkHealth = async () => {
  return fetchAPI('/health');
};

export const resetStats = async (simple = true) => {
  const endpoint = simple ? '/reset-stats-simple' : '/reset-stats';
  return fetchAPI(endpoint, {
    method: 'POST',
  });
};
