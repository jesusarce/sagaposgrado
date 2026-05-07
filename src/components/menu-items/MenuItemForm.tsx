import { useState, useEffect } from "react";
import type { MenuItem, CreateMenuItemRequest } from "../../types/menu-items/menu-item.types";
import type { Role } from "../../types/roles/role.types";
import { getRoles } from "../../services/roles.service";
import Label from "../form/Label";
import InputField from "../form/input/InputField";
import {
  GridIcon,
  UserIcon,
  GroupIcon,
  PieChartIcon,
  ListIcon,
  TableIcon,
  CalenderIcon,
  LockIcon,
  PageIcon,
} from "../../icons";
import Checkbox from "../form/input/Checkbox.tsx";
import Select from "../form/Select.tsx";
import CheckboxSkeleton from "../animation/CheckboxSkeleton.tsx";

const ICON_OPTIONS: { value: string; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: "dashboard", label: "Dashboard", Icon: GridIcon },
  { value: "users", label: "Usuarios", Icon: UserIcon },
  { value: "group", label: "Roles", Icon: GroupIcon },
  { value: "chart", label: "Gráficos", Icon: PieChartIcon },
  { value: "list", label: "Lista", Icon: ListIcon },
  { value: "table", label: "Tablas", Icon: TableIcon },
  { value: "calendar", label: "Calendario", Icon: CalenderIcon },
  { value: "lock", label: "Permisos", Icon: LockIcon },
  { value: "page", label: "Página", Icon: PageIcon },
];

interface MenuItemFormProps {
  item?: MenuItem | null;
  allItems?: MenuItem[];
  onSubmit: (data: CreateMenuItemRequest) => Promise<void>;
  onCancel: () => void;
}

export default function MenuItemForm({ item, allItems = [], onSubmit, onCancel }: MenuItemFormProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState("");
  const [active, setActive] = useState(true);
  const [parentId, setParentId] = useState<number | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingRoles, setLoadingRoles] = useState(true);

  // Ítems que pueden ser padre: excluye el ítem actual y sus hijos
  const parentOptions = allItems.filter((i) => i.id !== item?.id && i.parent_id !== item?.id);

  useEffect(() => {
    setLoadingRoles(true);

    getRoles()
        .then((data) => setAllRoles(data))
        .catch(() => {})
        .finally(() => setLoadingRoles(false));
  }, []);

  useEffect(() => {
    setLabel(item?.label ?? "");
    setUrl(item?.url ?? "");
    setIcon(item?.icon ?? "");
    setOrder(item?.order?.toString() ?? "");
    setActive(item?.active ?? true);
    setParentId(item?.parent_id ?? null);
    setSelectedRoleIds(item?.roles?.map((r) => r.id) ?? []);
    setError(null);
  }, [item]);

  function toggleRole(id: number) {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("La etiqueta es requerida");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        label: label.trim(),
        url: url.trim() || null,
        icon: icon.trim() || null,
        order: order ? parseInt(order, 10) : undefined,
        active,
        parent_id: parentId,
        roles: selectedRoleIds,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? "Error al guardar el ítem");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Etiqueta <span className="text-error-500">*</span></Label>
        <InputField value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej: Dashboard" />
      </div>
      <div>
        <Label>URL</Label>
        <InputField value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Ej: /dashboard" />
      </div>

      {/* Icon picker */}
      <div>
        <Label>Icono</Label>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {ICON_OPTIONS.map(({ value, label: iconLabel, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setIcon(icon === value ? "" : value)}
              title={iconLabel}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
                icon === value
                  ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              <Icon className="size-5" />
              <span className="truncate w-full text-center">{iconLabel}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIcon("")}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
              icon === ""
                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
            }`}
          >
            <span className="text-lg leading-none">—</span>
            <span>Ninguno</span>
          </button>
        </div>
      </div>

      <div>
        <Label>Orden</Label>
        <InputField type="number" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Ej: 1" />
      </div>
      <div>
        <Label>Ítem padre</Label>
        <Select
            defaultValue={parentId ? String(parentId) : ""}
            placeholder="— Sin padre (ítem raíz) —"
            onChange={(value) =>
                setParentId(value ? Number(value) : null)
            }
            options={parentOptions.map((opt) => ({
              value: String(opt.id),
              label: opt.parent_id
                  ? `↳ ${opt.label}`
                  : opt.label,
            }))}
        />
      </div>

      {/* Roles */}
      <div>
          <Label>Roles que pueden ver este ítem</Label>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
            {loadingRoles ? (
                <CheckboxSkeleton items={3} />
            ) : allRoles.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No hay roles registrados
              </div>
            ) : (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {allRoles.map((role) => (
                      <Checkbox
                          key={role.id}
                          label={role.name}
                          checked={selectedRoleIds.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          size="md"
                      />
                  ))}
                </div>
            )}
          </div>
      </div>


      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Activo
        </label>
      </div>
      {error && <p className="text-sm text-error-500">{error}</p>}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : item ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}
