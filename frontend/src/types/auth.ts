export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
}
