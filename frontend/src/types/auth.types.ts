export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  birthday: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface ForgotPasswordRequest {
  usernameOrEmail: string;
}

export interface ResetPasswordRequest {
  usernameOrEmail: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  birthday?: string;
  birthDay?: string; // Backend uses birthDay
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  height?: number;
  weight?: number;
  avatar?: string;
  isActive: boolean;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface CosplayProduct {
  id: number;
  title: string;
  titleEn: string;
  price: number;
  seller_name: string;
  img_url: string;
  link: string;
  priceVND: number;
}

export interface CosplaySuggestion {
  characterName: string;
  characterDescription: string;
  difficultyLevel: string;
  suitabilityScore: string;
  budgetAnalysis: string;
  recommendations: string;
  itemsList: string;
  tips: string;
  alternatives: string;
  processingTimeMs: string;
  products?: CosplayProduct[];
}
