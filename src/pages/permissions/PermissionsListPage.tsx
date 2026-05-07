import { useState, useEffect, useCallback } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import PermissionTable from "../../components/permissions/PermissionTable";
import { PlusIcon } from "../../icons";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../services/permissions.service";
import type { Permission } from "../../types/permissions/permission.types";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import { usePermissions } from "../../hooks/usePermissions";

export default function PermissionsListPage() {
  const { can } = usePermissions();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Permission | null>(null);
  const [formName, setFormName] = useState("");
  const [formGroup, setFormGroup] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  function handleCreate() {
    setSelected(null);
    setFormName("");
    setFormGroup("");
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleEdit(perm: Permission) {
    setSelected(perm);
    setFormName(perm.name);
    setFormGroup(perm.group ?? "");
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    setConfirmId(id);
  }

  async function handleConfirmDelete() {
    if (confirmId === null) return;
    await deletePermission(confirmId);
    setConfirmId(null);
    fetchPermissions();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("El nombre es requerido");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (selected) {
        await updatePermission(selected.id, { name: formName.trim(), group: formGroup.trim() || undefined });
      } else {
        await createPermission({ name: formName.trim(), group: formGroup.trim() || undefined });
      }
      setIsModalOpen(false);
      fetchPermissions();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr?.response?.data?.message ?? "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta title="Permisos" description="Gestión de permisos del sistema" />
      <PageBreadCrumb pageTitle="Permisos" />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de Permisos
          </h2>
          {can('permissions.create') && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
            >
              <PlusIcon className="size-4" />
              Nuevo Permiso
            </button>
          )}
        </div>

        <PermissionTable permissions={permissions} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-md p-6 sm:p-8"
      >
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          {selected ? "Editar Permiso" : "Nuevo Permiso"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nombre <span className="text-error-500">*</span></Label>
            <InputField value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej: roles.view" />
          </div>
          <div>
            <Label>Grupo</Label>
            <InputField value={formGroup} onChange={(e) => setFormGroup(e.target.value)} placeholder="Ej: Roles" />
          </div>
          {formError && <p className="text-sm text-error-500">{formError}</p>}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              {isSubmitting ? "Guardando..." : selected ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
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
            ¿Eliminar este permiso?
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
