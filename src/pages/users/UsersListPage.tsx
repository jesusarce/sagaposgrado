import { useState, useEffect, useCallback } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import UserTable from "../../components/users/UserTable";
import UserForm from "../../components/users/UserForm";
import { PlusIcon } from "../../icons";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/users.service";
import type { User, CreateUserRequest, UpdateUserRequest } from "../../types/users/user.types";
import { usePermissions } from "../../hooks/usePermissions";
import Button from "../../components/ui/button/Button.tsx";

export default function UsersListPage() {
  const { can } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleCreate() {
    setSelected(null);
    setIsModalOpen(true);
  }

  function handleEdit(user: User) {
    setSelected(user);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    setConfirmId(id);
  }

  async function handleConfirmDelete() {
    if (confirmId === null) return;
    await deleteUser(confirmId);
    setConfirmId(null);
    fetchUsers();
  }

  async function handleSubmit(data: CreateUserRequest | UpdateUserRequest) {
    if (selected) {
      await updateUser(selected.id, data as UpdateUserRequest);
    } else {
      await createUser(data as CreateUserRequest);
    }
    setIsModalOpen(false);
    fetchUsers();
  }

  return (
    <>
      <PageMeta title="Usuarios" description="Gestión de usuarios del sistema" />
      <PageBreadCrumb pageTitle="Usuarios" />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de Usuarios
          </h2>
          {can('users.create') && (
              <Button
                  size={"sm"}
                  onClick={handleCreate}
                  startIcon={<PlusIcon className="size-4 text-white" />}
              >
                Nuevo Usuario
              </Button>
          )}
        </div>

        <UserTable users={users} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-md p-6 sm:p-8"
      >
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          {selected ? "Editar Usuario" : "Nuevo Usuario"}
        </h3>
        <UserForm
          user={selected}
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
            ¿Eliminar este usuario?
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
