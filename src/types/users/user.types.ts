import {Role} from "../roles/role.types.ts";

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: Role[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  roles?: number[];
}

export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  roles?: number[];
}
