import http from "./http.service";
import { API_ENDPOINTS } from "../constants/api.constants";
import type { LoginRequest, LoginResponse, AuthUser } from "../types/auth/auth.types";
import type { ApiResponse } from "../types/common/api.types";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials
  );
  return data;
}

export async function logout(): Promise<void> {
  await http.post(API_ENDPOINTS.AUTH.LOGOUT);
}

export async function me(): Promise<AuthUser> {
  const { data } = await http.get<ApiResponse<AuthUser>>(
    API_ENDPOINTS.AUTH.ME
  );
  return data.data;
}
