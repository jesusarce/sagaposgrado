import http from "./http.service";
import { API_ENDPOINTS } from "../constants/api.constants";
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from "../types/menu-items/menu-item.types";
import type { ApiResponse, ApiQueryParams } from "../types/common/api.types";
import { buildQueryParams } from "../utils/query.utils";

export async function getMenuItems(params?: ApiQueryParams): Promise<MenuItem[]> {
  const { data } = await http.get<ApiResponse<MenuItem[]>>(API_ENDPOINTS.MENU_ITEMS.BASE, {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function getMenuItemById(id: number, params?: ApiQueryParams): Promise<MenuItem> {
  const { data } = await http.get<ApiResponse<MenuItem>>(API_ENDPOINTS.MENU_ITEMS.BY_ID(id), {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function createMenuItem(payload: CreateMenuItemRequest): Promise<MenuItem> {
  const { data } = await http.post<ApiResponse<MenuItem>>(API_ENDPOINTS.MENU_ITEMS.BASE, payload);
  return data.data;
}

export async function updateMenuItem(id: number, payload: UpdateMenuItemRequest): Promise<MenuItem> {
  const { data } = await http.put<ApiResponse<MenuItem>>(API_ENDPOINTS.MENU_ITEMS.BY_ID(id), payload);
  return data.data;
}

export async function deleteMenuItem(id: number): Promise<void> {
  await http.delete(API_ENDPOINTS.MENU_ITEMS.BY_ID(id));
}

/** Admin view: all menu items regardless of the current user's roles */
export async function getMenuItemsAll(): Promise<MenuItem[]> {
  const { data } = await http.get<ApiResponse<MenuItem[]>>(API_ENDPOINTS.MENU_ITEMS.BASE, {
    params: { all: true },
  });
  return data.data;
}
