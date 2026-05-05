export interface MenuItem {
  id: number;
  label: string;
  url: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  parent_id: number | null;
  children: MenuItem[];
  roles?: Array<{ id: number; name: string }>;
}

export interface CreateMenuItemRequest {
  label: string;
  url?: string | null;
  icon?: string | null;
  order?: number;
  parent_id?: number | null;
  active?: boolean;
  roles?: number[];
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  id: number;
}
