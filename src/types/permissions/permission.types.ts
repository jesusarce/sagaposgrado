export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  group?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionGroup {
  group: string;
  permissions: Permission[];
}
