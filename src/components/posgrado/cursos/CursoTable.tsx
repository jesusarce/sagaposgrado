import { useState, useEffect, useRef } from "react";
import {AngleUpIcon, AngleDownIcon, PencilIcon, TrashBinIcon} from "../../../icons";
import type { Curso, CursoServerFilters } from "../../../types/saga/curso.types.ts";
import type { Pagination } from "../../../types/common/api.types.ts";
import {usePermissions} from "../../../hooks/usePermissions.ts";
import TableSkeleton from "../../animation/TableSkeleton.tsx";

interface CursoTableProps {
  cursos: Curso[];
  pagination: Omit<Pagination<Curso>, "data"> | null;
  isLoading?: boolean;
  nivelAcadMap?: Map<string, string>;
  periodoDescMap?: Map<string, string>;
  onServerFilterChange: (filters: CursoServerFilters) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSortChange: (sort: string[]) => void;
  onEdit: (curso: Curso) => void;
  onDelete: (id: number) => void;
}

interface AllFilters {
  nivel_academico: string;
  unidad_academica: string;
  periodo_gestion: string;
  gestion: string;
  periodo_academico: string; // semestre
  paralelo: string;
  especialidad: string;
  curso: string;
}

const INIT_FILTERS: AllFilters = {
  nivel_academico: "",
  unidad_academica: "",
  periodo_gestion: "",
  gestion: "",
  periodo_academico: "", // semestre
  paralelo: "",
  especialidad: "",
  curso: "",
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const inputCls =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300";

// Columnas en el orden solicitado
const COLUMNS: {
  label: string;
  sortField?: string;
  filterKey: keyof AllFilters;
  placeholder: string;
}[] = [
  { label: "Nivel Académico",  sortField: "idNivelAcademico",  filterKey: "nivel_academico",  placeholder: "Filtrar..." },
  { label: "Unidad Académica", sortField: "idUnidadAcademica", filterKey: "unidad_academica", placeholder: "Filtrar..." },
  { label: "Periodo",          sortField: "periodoGestion", filterKey: "periodo_gestion",        placeholder: "Filtrar..." },
  { label: "Gestión",          sortField: "gestion",            filterKey: "gestion",          placeholder: "Año..." },
  { label: "Semestre",         sortField: "periodoAcademico",  filterKey: "periodo_academico",     placeholder: "Filtrar..." },
  { label: "Paralelo",         sortField: "paralelo",           filterKey: "paralelo",  placeholder: "Filtrar..." },
  { label: "Especialidad",     sortField: "idEspecialidad",     filterKey: "especialidad",     placeholder: "Filtrar..." },
  { label: "Curso",            sortField: "curso",              filterKey: "curso",            placeholder: "Buscar cursos..." },
];

export default function CursoTable({
  cursos,
  pagination,
  isLoading,
  onServerFilterChange,
  onPageChange,
  onPerPageChange,
  onSortChange,
  onEdit,
  onDelete,
}: CursoTableProps) {
  const { can } = usePermissions();
  const showActions = can('curso.edit') || can('curso.delete');

  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<AllFilters>(INIT_FILTERS);

  const serverFilterRef = useRef(onServerFilterChange);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    serverFilterRef.current = onServerFilterChange;
  });

  // Todos los filtros son server-side
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      serverFilterRef.current({
        NivelAcademico:   filters.nivel_academico  || undefined,
        UnidadAcademica:  filters.unidad_academica || undefined,
        PeriodoGestion: filters.periodo_gestion      || undefined,
        Gestion:          filters.gestion          || undefined,
        PeriodoAcademico: filters.periodo_academico         || undefined, // semestre
        Paralelo:         filters.paralelo         || undefined,
        Especialidad:     filters.especialidad     || undefined,
        Curso:            filters.curso            || undefined,
      });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    filters.nivel_academico,
    filters.unidad_academica,
    filters.periodo_gestion,
    filters.gestion,
    filters.periodo_academico, // semestre
    filters.paralelo,
    filters.especialidad,
    filters.curso,
  ]);

  function handleFilterChange(key: keyof AllFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSort(field: string) {
    let newDir: "asc" | "desc" = "asc";
    if (sortField === field) newDir = sortDir === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDir(newDir);
    onSortChange(newDir === "desc" ? [`-${field}`] : [field]);
  }

  function renderSortIcon(field: string) {
    if (sortField !== field)
      return <AngleDownIcon className="size-3 opacity-30" />;
    return sortDir === "asc" ? (
      <AngleUpIcon className="size-3" />
    ) : (
      <AngleDownIcon className="size-3" />
    );
  }

  const currentPage = pagination?.current_page ?? 1;
  const totalPages = pagination?.last_page ?? 1;
  const perPage = pagination?.per_page ?? 50;
  const total = pagination?.total ?? 0;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  function renderPageNumbers(): (number | "...")[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const btnBase =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors";
  const btnNormal = `${btnBase} border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 disabled:opacity-40`;
  const btnActive = `${btnBase} border-brand-500 bg-brand-500 text-white`;
  const thSortCls =
    "px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap";
  const thStaticCls =
    "px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            {/* Fila de cabeceras con sort */}
            <tr className="border-b border-gray-100 dark:border-white/[0.05]">
              <th onClick={() => handleSort('id')} className="w-16 px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200">
                <span className="flex items-center gap-1"># {renderSortIcon('id')}</span>
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  onClick={col.sortField ? () => handleSort(col.sortField!) : undefined}
                  className={col.sortField ? thSortCls : thStaticCls}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortField && renderSortIcon(col.sortField)}
                  </span>
                </th>
              ))}
              {showActions && <th className="w-28 px-5 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Acciones</th>}
            </tr>
            {/* Fila de filtros */}
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <td className="px-5 py-2" />
              {COLUMNS.map((col) => (
                <td key={col.filterKey} className="px-4 py-2">
                  <input
                    type="text"
                    value={filters[col.filterKey]}
                    onChange={(e) => handleFilterChange(col.filterKey, e.target.value)}
                    placeholder={col.placeholder}
                    className={inputCls}
                  />
                </td>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-100 dark:divide-white/[0.05] transition-opacity duration-200 ${
              isLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
          {isLoading && cursos.length === 0 ? (
              <TableSkeleton rows={8} cols={10} />
          ) : cursos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No se encontraron cursos
                </td>
              </tr>
            ) : (
              cursos.map((curso) => (
                <tr key={curso.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {curso.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {curso.especialidad?.nivel_academico?.nivel_acad }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {curso.unidad_academica?.unidad_academica ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    { curso.periodo_gestion?.periodo_gestion ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {curso.gestion}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    { curso.periodo_academico?.descripcion ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {curso.paralelo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {curso.especialidad?.especialidad ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                    {curso.curso}
                  </td>
                  {showActions && <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {can('users.edit') && (
                          <button
                              onClick={() => onEdit(curso)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400"
                              title="Editar"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                      )}
                      {can('users.delete') && (
                          <button
                              onClick={() => onDelete(curso.id)}
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

      {/* Footer: filas por página + paginación */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 dark:border-white/[0.05]">
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
            <span>{from}–{to} de {total}</span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={btnNormal} title="Primera">«</button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btnNormal} title="Anterior">‹</button>
            {renderPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400">…</span>
              ) : (
                <button key={p} onClick={() => onPageChange(p as number)} className={p === currentPage ? btnActive : btnNormal}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btnNormal} title="Siguiente">›</button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={btnNormal} title="Última">»</button>
          </div>
        </div>
      )}
    </div>
  );
}
