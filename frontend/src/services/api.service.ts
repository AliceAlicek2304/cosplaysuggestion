import axios from 'axios';
import { LoginRequest, RegisterRequest, LoginResponse, User, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth.types';
import { config } from '../config/config';

const API_BASE_URL = `${config.API_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types for cosplay suggestion
interface CosplaySuggestionRequest {
  characterName: string;
  budget?: number;
  height?: number;
  weight?: number;
  gender?: string;
  notes?: string;
}

interface CosplayProduct {
  id: number;
  title: string;
  titleEn: string;
  price: number;
  seller_name: string;
  img_url: string;
  link: string;
  priceVND: number;
}

interface CosplaySuggestionResponse {
  characterName: string;
  characterDescription: string;
  difficultyLevel: string;
  suitabilityScore: string;
  budgetAnalysis: string;
  recommendations: string;
  itemsList: string;
  tips: string;
  alternatives: string;
  taobaoKeywords: string[];
  processingTimeMs: string;
  products: CosplayProduct[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth service
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/account/register', data);
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/account/profile');
    return response.data.data;
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const response = await api.get(`/account/check-username?username=${username}`);
    return response.data.data;
  },

  checkEmailAvailability: async (email: string): Promise<boolean> => {
    const response = await api.get(`/account/check-email?email=${email}`);
    return response.data.data;
  },

  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post('/account/resend-verification', { email });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.get(`/auth/verify-email?token=${token}`);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  updateProfile: async (data: any): Promise<User> => {
    const response = await api.put('/account/profile', data);
    return response.data.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> => {
    await api.put('/account/change-password', data);
  },

  changeEmail: async (data: { newEmail: string; password: string }): Promise<void> => {
    await api.put('/account/change-email', data);
  },

  resendVerification: async (data: { email: string }): Promise<void> => {
    await api.post('/account/resend-verification', data);
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/account/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // Returns the avatar URL
  },
};

// Cosplay service
export const cosplayService = {
  generateSuggestion: async (request: CosplaySuggestionRequest): Promise<ApiResponse<CosplaySuggestionResponse>> => {
    const response = await api.post('/cosplay/suggestion', request);
    return response.data;
  },

  testAI: async (message: string): Promise<ApiResponse<string>> => {
    const response = await api.post('/cosplay/test', message, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    return response.data;
  },
};

export default api;
