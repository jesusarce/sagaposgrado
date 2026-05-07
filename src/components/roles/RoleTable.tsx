import { useState, useEffect, useRef } from "react";
import { PencilIcon, TrashBinIcon, AngleUpIcon, AngleDownIcon } from "../../icons";
import type { Role, RoleFilters } from "../../types/roles/role.types";
import { usePermissions } from "../../hooks/usePermissions";
import type { Pagination } from "../../types/common/api.types";
import TableSkeleton from "../animation/TableSkeleton.tsx";

interface RoleTableProps {
  roles: Role[];
  pagination: Omit<Pagination<Role>, "data"> | null;
  isLoading?: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  onFilterChange: (filters: RoleFilters) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSortChange: (sort: string[]) => void;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function RoleTable({
  roles,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onFilterChange,
  onPageChange,
  onPerPageChange,
  onSortChange,
}: RoleTableProps) {
  const { can } = usePermissions();
  const showActions = can('roles.edit') || can('roles.delete');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<RoleFilters>({ name: "", guard_name: "" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFilterChangeRef = useRef(onFilterChange);
  const isInitialMount = useRef(true);

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onFilterChangeRef.current(filters);
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [filters]);

  function handleFilterChange(key: keyof RoleFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSort(field: string) {
    let newDir: 'asc' | 'desc' = 'asc';
    if (sortField === field) {
      newDir = sortDir === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortDir(newDir);
    onSortChange(newDir === 'desc' ? [`-${field}`] : [field]);
  }

  function renderSortIcon(field: string) {
    if (sortField !== field) return <AngleDownIcon className="size-3 opacity-30" />;
    return sortDir === 'asc' ? <AngleUpIcon className="size-3" /> : <AngleDownIcon className="size-3" />;
  }

  const currentPage = pagination?.current_page ?? 1;
  const totalPages = pagination?.last_page ?? 1;
  const perPage = pagination?.per_page ?? 10;
  const total = pagination?.total ?? 0;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  function renderPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const btnBase =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors";
  const btnNormal =
    `${btnBase} border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 disabled:opacity-40`;
  const btnActive =
    `${btnBase} border-brand-500 bg-brand-500 text-white`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            {/* Column headers */}
            <tr className="border-b border-gray-100 dark:border-white/[0.05]">
              <th onClick={() => handleSort('id')} className="w-16 px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1"># {renderSortIcon('id')}</span>
              </th>
              <th onClick={() => handleSort('name')} className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1">Nombre {renderSortIcon('name')}</span>
              </th>
              <th onClick={() => handleSort('guard_name')} className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1">Guard {renderSortIcon('guard_name')}</span>
              </th>
              <th className="w-24 px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Permisos
              </th>
              {showActions && <th className="w-28 px-5 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Acciones</th>}
            </tr>
            {/* Search row */}
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <td className="px-5 py-2" />
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={filters.name ?? ""}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  placeholder="Buscar nombre..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={filters.guard_name ?? ""}
                  onChange={(e) => handleFilterChange("guard_name", e.target.value)}
                  placeholder="Buscar guard..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </td>
              <td className="px-5 py-2" />
              {showActions && <td className="px-5 py-2" />}
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-100 dark:divide-white/[0.05] transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
          {isLoading && roles.length === 0 ? (
                  <TableSkeleton rows={8} cols={showActions ? 5 : 4} />
          ) : roles.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 5 : 4} className="px-5 py-10 text-center text-sm text-gray-400">
                  No hay roles registrados
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {role.id}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {role.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {role.guard_name}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {role.permissions?.length ?? 0}
                  </td>
                  {showActions && <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {can('roles.edit') && (
                        <button
                          onClick={() => onEdit(role)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400"
                          title="Editar"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                      )}
                      {can('roles.delete') && (
                        <button
                          onClick={() => onDelete(role.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-error-500 hover:text-error-500 dark:border-gray-700 dark:text-gray-400"
                          title="Eliminar"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: rows per page + pagination */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 dark:border-white/[0.05]">
          {/* Left: per page selector + count info */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>Filas por página:</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>
              {from}–{to} de {total}
            </span>
          </div>

          {/* Right: page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={btnNormal}
              title="Primera página"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={btnNormal}
              title="Página anterior"
            >
              ‹
            </button>
            {renderPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={p === currentPage ? btnActive : btnNormal}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={btnNormal}
              title="Página siguiente"
            >
              ›
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={btnNormal}
              title="Última página"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

