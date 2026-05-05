export interface RolePermission {
  id: number;
  name: string;
  guard_name: string;
  group?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: RolePermission[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleRequest {
  name: string;
  guard_name?: string;
  permissions?: number[];
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  id: number;
}

export interface RoleFilters {
  name?: string;
  guard_name?: string;
}
