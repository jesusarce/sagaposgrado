import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";
import type {CreateCursoRequest, Curso, UpdateCursoRequest} from "../../types/saga/curso.types.ts";
import type {ApiQueryParams, ApiResponse, LaravelResourcePagination, Pagination} from "../../types/common/api.types.ts";
import { buildQueryParams } from "../../utils/query.utils.ts";

export async function getCursosPaginated(params: ApiQueryParams): Promise<Pagination<Curso>> {

  const { data } = await http.get<LaravelResourcePagination<Curso>>(
    API_ENDPOINTS.SAGA.CURSOS.BASE,
    {
      params: buildQueryParams({
        ...params,
        included: ["especialidad", "especialidad.nivelAcademico", "unidadAcademica", "periodoGestion", "periodoAcademico"],
      }),
    }
  );
  return {
    data: data.data,
    current_page: data.meta?.current_page ?? 1,
    last_page: data.meta?.last_page ?? 1,
    per_page: data.meta?.per_page ?? (params.perPage ?? 50),
    total: data.meta?.total ?? data.data.length,
  };
}

export async function getCursoById(id: number, params?: ApiQueryParams): Promise<Curso> {
  const { data } = await http.get<ApiResponse<Curso>>(API_ENDPOINTS.SAGA.CURSOS.BY_ID(id), {
    params: params ? buildQueryParams(params) : undefined,
  });
  return data.data;
}

export async function createCurso(payload: CreateCursoRequest): Promise<Curso> {
  const { data } = await http.post<ApiResponse<Curso>>(API_ENDPOINTS.SAGA.CURSOS.BASE, payload);
  return data.data;
}

export async function updateCurso(id: number, payload: UpdateCursoRequest): Promise<Curso> {
  const { data } = await http.put<ApiResponse<Curso>>(API_ENDPOINTS.SAGA.CURSOS.BY_ID(id), payload);
  return data.data;
}

export async function deleteCurso(id: number): Promise<void> {
  await http.delete(API_ENDPOINTS.SAGA.CURSOS.BY_ID(id));
}
