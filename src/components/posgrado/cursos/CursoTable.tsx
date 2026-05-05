import { useState, useEffect, useRef } from "react";
import { AngleUpIcon, AngleDownIcon } from "../../../icons";
import type { Curso, CursoServerFilters } from "../../../types/saga/curso.types.ts";
import type { Pagination } from "../../../types/common/api.types.ts";

interface CursoTableProps {
  cursos: Curso[];
  pagination: Omit<Pagination<Curso>, "data"> | null;
  isLoading?: boolean;
  nivelAcadMap: Map<string, string>;
  periodoDescMap: Map<string, string>;
  onServerFilterChange: (filters: CursoServerFilters) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSortChange: (sort: string[]) => void;
}

interface AllFilters {
  unidad_academica: string;
  gestion: string;
  nivel_academico: string;
  especialidad: string;
  descripcion: string;
  paralelo: string;
  curso: string;
}

const INIT_FILTERS: AllFilters = {
  unidad_academica: "",
  gestion: "",
  nivel_academico: "",
  especialidad: "",
  descripcion: "",
  paralelo: "",
  curso: "",
};

const PER_PAGE_OPTIONS = [25, 50, 100];

const inputCls =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300";

// Columnas en el orden solicitado
const COLUMNS: {
  label: string;
  sortField?: string;
  filterKey: keyof AllFilters;
  placeholder: string;
}[] = [
  { label: "Unidad Académica", sortField: "idUnidadAcademica", filterKey: "unidad_academica", placeholder: "Filtrar..." },
  { label: "Gestión",          sortField: "Gestion",            filterKey: "gestion",          placeholder: "Año..." },
  { label: "Nivel Académico",  filterKey: "nivel_academico",    placeholder: "Filtrar..." },
  { label: "Especialidad",     sortField: "idEspecialidad",     filterKey: "especialidad",     placeholder: "Filtrar..." },
  { label: "Descripción",      filterKey: "descripcion",        placeholder: "Filtrar..." },
  { label: "Paralelo",         filterKey: "paralelo",           placeholder: "Filtrar..." },
  { label: "Curso",            sortField: "Curso",              filterKey: "curso",            placeholder: "Buscar cursos..." },
];

export default function CursoTable({
  cursos,
  pagination,
  isLoading,
  nivelAcadMap,
  periodoDescMap,
  onServerFilterChange,
  onPageChange,
  onPerPageChange,
  onSortChange,
}: CursoTableProps) {
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
        Curso:            filters.curso            || undefined,
        Gestion:          filters.gestion          || undefined,
        Paralelo:         filters.paralelo         || undefined,
        UnidadAcademica:  filters.unidad_academica || undefined,
        Especialidad:     filters.especialidad     || undefined,
        NivelAcademico:   filters.nivel_academico  || undefined,
        PeriodoAcademico: filters.descripcion      || undefined,
      });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    filters.curso,
    filters.gestion,
    filters.paralelo,
    filters.unidad_academica,
    filters.especialidad,
    filters.nivel_academico,
    filters.descripcion,
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
            </tr>
            {/* Fila de filtros */}
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
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
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  Cargando...
                </td>
              </tr>
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
                    {curso.unidad_academica?.unidad_academica ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {curso.gestion}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {nivelAcadMap.get(curso.especialidad?.id_nivel_acad ?? "") ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {curso.especialidad?.especialidad ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {periodoDescMap.get(curso.id_periodo_academico ?? curso.periodo) ?? curso.periodo_academico?.descripcion ?? curso.periodo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {curso.paralelo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                    {curso.curso}
                  </td>
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
