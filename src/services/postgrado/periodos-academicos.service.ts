import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";
import { buildQueryParams } from "../../utils/query.utils.ts";
import type {ApiQueryParams} from "../../types/common/api.types.ts";

export interface PeriodoAcademico {
  id: string;
  id_nivel_acad: string;
  descripcion: string;
  orden: string;
}

/** Retorna todos los periodos académicos (sin paginación). */
export async function getAllPeriodosAcademicos(): Promise<PeriodoAcademico[]> {
  const { data } = await http.get<{ data: PeriodoAcademico[] }>(
    API_ENDPOINTS.SAGA.PERIODOS_ACADEMICOS.BASE,
    { params: buildQueryParams({}) }
  );
  return data.data;
}

export async function getAllPeriodosAcademicosIdNivelAcad(id: string, params?: ApiQueryParams): Promise<PeriodoAcademico[]> {
  const { data } = await http.get<{ data: PeriodoAcademico[] }>(
      API_ENDPOINTS.SAGA.PERIODOS_ACADEMICOS.BASE,
      {
        params: {
          ...(params ? buildQueryParams(params) : {}),
          filter: {
            idNivelAcad: id,
          },
        },
      }
  );
  return data.data;
}

/** Construye un mapa id → descripcion para uso en tablas. */
export async function getAllPeriodosAcademicosMap(): Promise<Map<string, string>> {
  const periodos = await getAllPeriodosAcademicos();
  return new Map(periodos.map((p) => [p.id, p.descripcion]));
}
