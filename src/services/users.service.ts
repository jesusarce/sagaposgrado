import http from "./http.service";
import { API_ENDPOINTS } from "../constants/api.constants";
import type { User, CreateUserRequest, UpdateUserRequest } from "../types/users/user.types";
import type { ApiResponse, ApiQueryParams } from "../types/common/api.types";
import { buildQueryParams } from "../utils/query.utils";

export async function getUsers(params?: ApiQueryParams): Promise<User[]> {
  const { data } = await http.get<ApiResponse<User[]>>(API_ENDPOINTS.USERS.BASE, {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function getUserById(id: number, params?: ApiQueryParams): Promise<User> {
  const { data } = await http.get<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id), {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  const { data } = await http.post<ApiResponse<User>>(API_ENDPOINTS.USERS.BASE, payload);
  return data.data;
}

export async function updateUser(id: number, payload: UpdateUserRequest): Promise<User> {
  const { data } = await http.put<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id), payload);
  return data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await http.delete(API_ENDPOINTS.USERS.BY_ID(id));
}
