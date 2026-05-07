import { useState, useEffect } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import MenuItemTable from "../../components/menu-items/MenuItemTable";
import MenuItemForm from "../../components/menu-items/MenuItemForm";
import { PlusIcon } from "../../icons";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsAll,
} from "../../services/menu-items.service";
import type { MenuItem, CreateMenuItemRequest } from "../../types/menu-items/menu-item.types";
import { useMenu } from "../../hooks/useMenu";
import { usePermissions } from "../../hooks/usePermissions";

function flattenMenuItems(items: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children?.length) {
      result.push(...flattenMenuItems(item.children));
    }
  }
  return result;
}

export default function MenuItemsListPage() {
  const { refreshMenu } = useMenu();
  const { can } = usePermissions();
  const [rawMenuItems, setRawMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const menuItems = flattenMenuItems(rawMenuItems);

  async function loadAll() {
    setIsLoading(true);
    try {
      const data = await getMenuItemsAll();
      setRawMenuItems(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  function handleCreate() {
    setSelected(null);
    setIsModalOpen(true);
  }

  function handleEdit(item: MenuItem) {
    setSelected(item);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    setConfirmId(id);
  }

  async function handleConfirmDelete() {
    if (confirmId === null) return;
    await deleteMenuItem(confirmId);
    setConfirmId(null);
    await refreshMenu();
    await loadAll();
  }

  async function handleSubmit(data: CreateMenuItemRequest) {
    if (selected) {
      await updateMenuItem(selected.id, { id: selected.id, ...data });
    } else {
      await createMenuItem(data);
    }
    setIsModalOpen(false);
    await refreshMenu();
    await loadAll();
  }

  return (
    <>
      <PageMeta title="Ítems de Menú" description="Gestión de ítems del menú" />
      <PageBreadCrumb pageTitle="Ítems de Menú" />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de Ítems de Menú
          </h2>
          {can('menu_items.create') && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
            >
              <PlusIcon className="size-4" />
              Nuevo Ítem
            </button>
          )}
        </div>

        <MenuItemTable menuItems={menuItems} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-lg p-6 sm:p-8"
      >
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          {selected ? "Editar Ítem de Menú" : "Nuevo Ítem de Menú"}
        </h3>
        <MenuItemForm
          item={selected}
          allItems={menuItems}
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
            ¿Eliminar este ítem de menú?
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
