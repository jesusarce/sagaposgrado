import { useState, useEffect, useCallback } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CursoTable from "../../components/posgrado/CursoTable";
import { getCursosPaginated } from "../../services/cursos.service";
import { getNivelAcadMap } from "../../services/nivel-academico.service";
import { getPeriodoDescMap } from "../../services/periodos-academicos.service";
import type { Curso, CursoServerFilters } from "../../types/saga/curso.types";
import type { Pagination } from "../../types/common/api.types";

export default function CursosListPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [pagination, setPagination] = useState<Omit<Pagination<Curso>, "data"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [serverFilters, setServerFilters] = useState<CursoServerFilters>({});
  const [sort, setSort] = useState<string[]>([]);
  const [nivelAcadMap, setNivelAcadMap] = useState<Map<string, string>>(new Map());
  const [periodoDescMap, setPeriodoDescMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getNivelAcadMap().then(setNivelAcadMap).catch(() => {});
    getPeriodoDescMap().then(setPeriodoDescMap).catch(() => {});
  }, []);

  const fetchCursos = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter: Record<string, string> = {};
      if (serverFilters.Curso)           filter["Curso"]           = serverFilters.Curso;
      if (serverFilters.Gestion)         filter["Gestion"]         = serverFilters.Gestion;
      if (serverFilters.Paralelo)        filter["Paralelo"]        = serverFilters.Paralelo;
      if (serverFilters.UnidadAcademica) filter["UnidadAcademica"] = serverFilters.UnidadAcademica;
      if (serverFilters.Especialidad)    filter["Especialidad"]    = serverFilters.Especialidad;
      if (serverFilters.NivelAcademico)  filter["NivelAcademico"]  = serverFilters.NivelAcademico;
      if (serverFilters.PeriodoAcademico) filter["PeriodoAcademico"] = serverFilters.PeriodoAcademico;

      const result = await getCursosPaginated({
        page,
        perPage,
        ...(sort.length ? { sort } : {}),
        ...(Object.keys(filter).length ? { filter } : {}),
      });

      const { data, ...meta } = result;
      setCursos(data);
      setPagination(meta);
    } catch {
      // error silenciado
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, serverFilters, sort]);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  function handleServerFilterChange(filters: CursoServerFilters) {
    setPage(1);
    setServerFilters(filters);
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

  return (
    <>
      <PageMeta title="Cursos" description="Listado de cursos de posgrado" />
      <PageBreadCrumb pageTitle="Cursos" />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de Cursos
          </h2>
        </div>

        <CursoTable
          cursos={cursos}
          pagination={pagination}
          isLoading={isLoading}
          nivelAcadMap={nivelAcadMap}
          periodoDescMap={periodoDescMap}
          onServerFilterChange={handleServerFilterChange}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onSortChange={handleSortChange}
        />
      </div>
    </>
  );
}
