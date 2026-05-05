import { useState, useEffect, useCallback } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import RoleTable from "../../components/roles/RoleTable";
import RoleForm from "../../components/roles/RoleForm";
import { PlusIcon } from "../../icons";
import {
  getRolesPaginated,
  createRole,
  updateRole,
  deleteRole,
} from "../../services/roles.service";
import type { Role, CreateRoleRequest, RoleFilters } from "../../types/roles/role.types";
import type { Pagination } from "../../types/common/api.types";
import { usePermissions } from "../../hooks/usePermissions";

export default function RolesListPage() {
  const { can } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Omit<Pagination<Role>, "data"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<RoleFilters>({});
  const [sort, setSort] = useState<string[]>([]);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter: Record<string, string> = {};
      if (filters.name) filter.name = filters.name;
      if (filters.guard_name) filter.guard_name = filters.guard_name;

      const result = await getRolesPaginated({
        page,
        perPage,
        ...(sort.length ? { sort } : {}),
        ...(Object.keys(filter).length ? { filter } : {}),
      });

      const { data, ...meta } = result;
      setRoles(data);
      setPagination(meta);
    } catch {
      // silently handled
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, filters, sort]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  function handleFilterChange(newFilters: RoleFilters) {
    setPage(1);
    setFilters(newFilters);
  }

  function handleSortChange(newSort: string[]) {
    setPage(1);
    setSort(newSort);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  function handlePerPageChange(newPerPage: number) {
    setPage(1);
    setPerPage(newPerPage);
  }

  function handleCreate() {
    setSelectedRole(null);
    setIsModalOpen(true);
  }

  function handleEdit(role: Role) {
    setSelectedRole(role);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    setConfirmId(id);
  }

  async function handleConfirmDelete() {
    if (confirmId === null) return;
    await deleteRole(confirmId);
    setConfirmId(null);
    fetchRoles();
  }

  async function handleSubmit(data: CreateRoleRequest) {
    if (selectedRole) {
      await updateRole(selectedRole.id, { id: selectedRole.id, ...data });
    } else {
      await createRole(data);
    }
    setIsModalOpen(false);
    fetchRoles();
  }

  return (
    <>
      <PageMeta title="Roles" description="Gestión de roles del sistema" />
      <PageBreadCrumb pageTitle="Roles" />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de Roles
          </h2>
          {can('roles.create') && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
            >
              <PlusIcon className="size-4" />
              Nuevo Rol
            </button>
          )}
        </div>

        <RoleTable
          roles={roles}
          pagination={pagination}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onSortChange={handleSortChange}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-2xl p-6 sm:p-8"
      >
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          {selectedRole ? "Editar Rol" : "Nuevo Rol"}
        </h3>
        <RoleForm
          role={selectedRole}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={confirmId !== null}
        onClose={() => setConfirmId(null)}
        className="max-w-sm p-6"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10">
            <svg className="size-6 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h4 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
            ¿Eliminar este rol?
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setConfirmId(null)}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm bg-error-500 text-white hover:bg-error-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
