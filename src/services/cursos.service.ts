import http from "./http.service";
import { API_ENDPOINTS } from "../constants/api.constants";
import type { Curso } from "../types/saga/curso.types";
import type { ApiQueryParams, LaravelResourcePagination, Pagination } from "../types/common/api.types";
import { buildQueryParams } from "../utils/query.utils";

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
