import { useState, useMemo } from "react";
import { PencilIcon, TrashBinIcon, AngleUpIcon, AngleDownIcon } from "../../icons";
import type { Permission } from "../../types/permissions/permission.types";
import { usePermissions } from "../../hooks/usePermissions";
import TableSkeleton from "../animation/TableSkeleton.tsx";

interface PermissionTableProps {
  permissions: Permission[];
  isLoading?: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (id: number) => void;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function PermissionTable({
  permissions,
  isLoading,
  onEdit,
  onDelete,
}: PermissionTableProps) {
  const { can } = usePermissions();
  const showActions = can('permissions.edit') || can('permissions.delete');
  const [filterName, setFilterName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterGuard, setFilterGuard] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const name = filterName.toLowerCase();
    const group = filterGroup.toLowerCase();
    const guard = filterGuard.toLowerCase();
    return permissions.filter(
      (p) =>
        (!name || p.name.toLowerCase().includes(name)) &&
        (!group || (p.group ?? "").toLowerCase().includes(group)) &&
        (!guard || p.guard_name.toLowerCase().includes(guard))
    );
  }, [permissions, filterName, filterGroup, filterGuard]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortField as keyof Permission] ?? '');
      const bVal = String(b[sortField as keyof Permission] ?? '');
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const total = filtered.length;
  const from = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, total);

  function handleFilterChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  function handlePerPageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPerPage(Number(e.target.value));
    setPage(1);
  }

  function renderPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  }

  function renderSortIcon(field: string) {
    if (sortField !== field) return <AngleDownIcon className="size-3 opacity-30" />;
    return sortDir === 'asc' ? <AngleUpIcon className="size-3" /> : <AngleDownIcon className="size-3" />;
  }

  const btnBase = "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors";
  const btnNormal = `${btnBase} border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 disabled:opacity-40`;
  const btnActive = `${btnBase} border-brand-500 bg-brand-500 text-white`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/[0.05]">
              <th onClick={() => handleSort('id')} className="w-16 px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1"># {renderSortIcon('id')}</span>
              </th>
              <th onClick={() => handleSort('name')} className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1">Nombre {renderSortIcon('name')}</span>
              </th>
              <th onClick={() => handleSort('group')} className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1">Grupo {renderSortIcon('group')}</span>
              </th>
              <th onClick={() => handleSort('guard_name')} className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1">Guard {renderSortIcon('guard_name')}</span>
              </th>
              {showActions && <th className="w-28 px-5 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Acciones</th>}
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <td className="px-5 py-2" />
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={filterName}
                  onChange={handleFilterChange(setFilterName)}
                  placeholder="Buscar nombre..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={filterGroup}
                  onChange={handleFilterChange(setFilterGroup)}
                  placeholder="Buscar grupo..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={filterGuard}
                  onChange={handleFilterChange(setFilterGuard)}
                  placeholder="Buscar guard..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </td>
              {showActions && <td className="px-5 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {isLoading && paged.length === 0 ? (
                  <TableSkeleton rows={8} cols={showActions ? 5 : 4} />
          ): paged.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 5 : 4} className="px-5 py-10 text-center text-sm text-gray-400">
                  No hay permisos registrados
                </td>
              </tr>
            ) : (
              paged.map((perm) => (
                <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{perm.id}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{perm.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{perm.group ?? "—"}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{perm.guard_name}</td>
                  {showActions && <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {can('permissions.edit') && (
                        <button
                          onClick={() => onEdit(perm)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400"
                          title="Editar"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                      )}
                      {can('permissions.delete') && (
                        <button
                          onClick={() => onDelete(perm.id)}
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

      { !isLoading && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 dark:border-white/[0.05]">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>Filas por página:</span>
              <select
                  value={perPage}
                  onChange={handlePerPageChange}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>{from}–{to} de {total}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={safePage === 1} className={btnNormal} title="Primera">«</button>
              <button onClick={() => setPage(safePage - 1)} disabled={safePage === 1} className={btnNormal} title="Anterior">‹</button>
              {renderPageNumbers().map((p, i) =>
                  p === "..." ? (
                      <span key={`e-${i}`} className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400">…</span>
                  ) : (
                      <button key={p} onClick={() => setPage(p as number)} className={p === safePage ? btnActive : btnNormal}>{p}</button>
                  )
              )}
              <button onClick={() => setPage(safePage + 1)} disabled={safePage === totalPages} className={btnNormal} title="Siguiente">›</button>
              <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className={btnNormal} title="Última">»</button>
            </div>
          </div>
      )}
    </div>
  );
}
