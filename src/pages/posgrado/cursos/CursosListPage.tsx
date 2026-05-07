import { useState, useEffect, useCallback } from "react";
import PageBreadCrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import CursoTable from "../../../components/posgrado/cursos/CursoTable.tsx";
import {createCurso, deleteCurso, getCursosPaginated, updateCurso} from "../../../services/postgrado/cursos.service.ts";
import {getAllNivelesAcademicosMap} from "../../../services/postgrado/nivel-academico.service.ts";
import {
  getAllPeriodosAcademicosMap,
} from "../../../services/postgrado/periodos-academicos.service.ts";
import type {
  CreateCursoRequest,
  Curso,
  CursoServerFilters,
  UpdateCursoRequest
} from "../../../types/saga/curso.types.ts";
import type { Pagination } from "../../../types/common/api.types.ts";
import Button from "../../../components/ui/button/Button.tsx";
import {PlusIcon} from "../../../icons";
import {usePermissions} from "../../../hooks/usePermissions.ts";
import {Modal} from "../../../components/ui/modal";
import ModalDelete from "../../../components/modal/ModalDelete.tsx";
import CursoForm from "../../../components/posgrado/cursos/CursoForm.tsx";
import DocenteTable from "../../../components/posgrado/docentes/DocenteTable.tsx";
import MateriaTable from "../../../components/posgrado/materias/MateriaTable.tsx";
import {getAllMaterias, Materia} from "../../../services/postgrado/materias.service.ts";
import {Docente, getAllDocentes} from "../../../services/postgrado/docentes.service.ts";
import Tabs from "../../../components/tabs/Tabs.tsx";

export default function CursosListPage() {

  const { can } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Curso | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [pagination, setPagination] = useState<Omit<Pagination<Curso>, "data"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [serverFilters, setServerFilters] = useState<CursoServerFilters>({});
  const [sort, setSort] = useState<string[]>([]);
  const [nivelesAcademicosMap, setNivelesAcademicosMap] = useState<Map<string, string>>(new Map());
  const [periodosAcademicosMap, setPeriodosAcademicosMap] = useState<Map<string, string>>(new Map());

  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoadingTablas, setIsLoadingTablas] = useState<boolean>(false);

  const tabs = [
    {
      id: "formularioCurso",
      label: "Formulario curso",
      content: (
          <>
            <CursoForm
                curso={selected}
                onSubmit={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
            />
            <div className="py-4">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                {"Asignación de docentes"}
              </h3>
              <DocenteTable docentes={docentes} isLoading={isLoadingTablas} />
            </div>
          </>
      ),
    },
    {
      id: "mateiasCurso",
      label: "Materias del curso",
      content: (
          <>
            <MateriaTable materias={materias} isLoading={isLoadingTablas} />
          </>
      ),
    },
    {
      id: "alumnos",
      label: "Alumnos",
      title: "Alumnos",
      content: (<p>En proceso...</p>),
    },
    {
      id: "alumnosDeshabilitados",
      label: "Alumnos deshabilitados",
      title: "Alumnos deshabilitados",
      content: (
          <p>
            En proceso...
          </p>
      ),
    },
    {
      id: "disciplina",
      label: "Disciplina",
      title: "Disciplina",
      content: (
          <p>
            En proceso...
          </p>
      ),
    },
  ];

  useEffect(() => {
    getAllNivelesAcademicosMap().then(setNivelesAcademicosMap).catch(() => {});
    getAllPeriodosAcademicosMap().then(setPeriodosAcademicosMap).catch(() => {});
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
      console.log("Cursos", data);
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

  function handleCreate() {
    setSelected(null);
    setIsModalOpen(true);
  }

  function handleEdit(curso: Curso) {
    setSelected(curso);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    setConfirmId(id);
  }

  async function handleConfirmDelete() {
    if (confirmId === null) return;
    await deleteCurso(confirmId);
    setConfirmId(null);
    await fetchCursos();
  }

  async function handleSubmit(data: CreateCursoRequest | UpdateCursoRequest) {
    if (selected) {
      await updateCurso(selected.id, data as UpdateCursoRequest);
    } else {
      await createCurso(data as CreateCursoRequest);
    }
    setIsModalOpen(false);
    fetchCursos();
  }

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

  useEffect(() => {
    setIsLoadingTablas(true);
    async function getAll() {
      try {
        const [docentesData, materiasData] =
            await Promise.all([
              getAllDocentes(),
              getAllMaterias(),
            ]);
        setDocentes(docentesData);
        setMaterias(materiasData);
      } catch (error) {
        console.log(error);
        setDocentes([]);
        setMaterias([]);
      } finally { setIsLoadingTablas(false); }
    }
    getAll();
  }, []);

  return (
    <>
      <PageMeta title="Cursos" description="Listado de cursos de posgrado" />
      <PageBreadCrumb pageTitle="Cursos" />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de Cursos
          </h2>

          {can('cursos.create') && (
              <Button
                  size={"sm"}
                  onClick={handleCreate}
                  startIcon={<PlusIcon className="size-4 text-white" />}
              >
                Nuevo Curso
              </Button>
          )}

        </div>

        <CursoTable
            cursos={cursos}
            pagination={pagination}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            nivelAcadMap={nivelesAcademicosMap}
            periodoDescMap={periodosAcademicosMap}
            onServerFilterChange={handleServerFilterChange}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onSortChange={handleSortChange}
        />
      </div>

      <Modal
          size={'lg'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-w-md p-6 sm:p-8"
      >
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          {selected ? "Editar Curso" : "Nuevo Curso"}
        </h3>

        <Tabs tabs={tabs} />

      </Modal>

      <ModalDelete
          isOpen={confirmId !== null}
          onClose={() => setConfirmId(null)}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar este curso?"
          message="Esta acción no se puede deshacer."
      />

    </>
  );
}
