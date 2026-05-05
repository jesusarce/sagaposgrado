export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface AuthRole {
  id: number;
  name: string;
  guard_name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}
