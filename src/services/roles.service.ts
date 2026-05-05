import http from "./http.service";
import { API_ENDPOINTS } from "../constants/api.constants";
import type { Role, CreateRoleRequest, UpdateRoleRequest } from "../types/roles/role.types";
import type { ApiResponse, ApiQueryParams, Pagination, LaravelResourcePagination } from "../types/common/api.types";
import { buildQueryParams } from "../utils/query.utils";

export async function getRoles(params?: ApiQueryParams): Promise<Role[]> {
  const { data } = await http.get<ApiResponse<Role[]>>(API_ENDPOINTS.ROLES.BASE, {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function getRolesPaginated(params: ApiQueryParams): Promise<Pagination<Role>> {
  const { data } = await http.get<LaravelResourcePagination<Role>>(API_ENDPOINTS.ROLES.BASE, {
    params: buildQueryParams({ ...params, included: ['permissions'] }),
  });
  return {
    data: data.data,
    current_page: data.meta.current_page,
    last_page: data.meta.last_page,
    per_page: data.meta.per_page,
    total: data.meta.total,
  };
}

export async function getRoleById(id: number, params?: ApiQueryParams): Promise<Role> {
  const { data } = await http.get<ApiResponse<Role>>(API_ENDPOINTS.ROLES.BY_ID(id), {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function createRole(payload: CreateRoleRequest): Promise<Role> {
  const { data } = await http.post<ApiResponse<Role>>(API_ENDPOINTS.ROLES.BASE, payload);
  return data.data;
}

export async function updateRole(id: number, payload: UpdateRoleRequest): Promise<Role> {
  const { data } = await http.put<ApiResponse<Role>>(API_ENDPOINTS.ROLES.BY_ID(id), payload);
  return data.data;
}

export async function deleteRole(id: number): Promise<void> {
  await http.delete(API_ENDPOINTS.ROLES.BY_ID(id));
}
