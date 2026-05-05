import http from "./http.service";
import { API_ENDPOINTS } from "../constants/api.constants";
import type { Permission } from "../types/permissions/permission.types";
import type { ApiResponse, ApiQueryParams } from "../types/common/api.types";
import { buildQueryParams } from "../utils/query.utils";

export async function getPermissions(params?: ApiQueryParams): Promise<Permission[]> {
  const { data } = await http.get<ApiResponse<Permission[]>>(API_ENDPOINTS.PERMISSIONS.BASE, {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function getPermissionById(id: number, params?: ApiQueryParams): Promise<Permission> {
  const { data } = await http.get<ApiResponse<Permission>>(API_ENDPOINTS.PERMISSIONS.BY_ID(id), {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function createPermission(payload: { name: string; guard_name?: string; group?: string }): Promise<Permission> {
  const { data } = await http.post<ApiResponse<Permission>>(API_ENDPOINTS.PERMISSIONS.BASE, payload);
  return data.data;
}

export async function updatePermission(id: number, payload: Partial<{ name: string; guard_name: string; group: string }>): Promise<Permission> {
  const { data } = await http.put<ApiResponse<Permission>>(API_ENDPOINTS.PERMISSIONS.BY_ID(id), payload);
  return data.data;
}

export async function deletePermission(id: number): Promise<void> {
  await http.delete(API_ENDPOINTS.PERMISSIONS.BY_ID(id));
}
