import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";
import type {ApiQueryParams} from "../../types/common/api.types.ts";
import {buildQueryParams} from "../../utils/query.utils.ts";

export interface PeriodosGestion {
    id: string;
    periodo_gestion: string;
    id_nivel_acad: string;
    orden: string;
}

export async function getAllPeriodosGestion(): Promise<PeriodosGestion[]> {
    const { data } = await http.get<{ data: PeriodosGestion[] }>(
        API_ENDPOINTS.SAGA.PERIODO_GESTION.BASE
    );
    return data.data;
}

export async function getAllPeriodosGestionIdNivelAcad(id: string, params?: ApiQueryParams): Promise<PeriodosGestion[]> {
    const { data } = await http.get<{ data: PeriodosGestion[] }>(
        API_ENDPOINTS.SAGA.PERIODO_GESTION.BASE,
        {
            params: {
                ...(params ? buildQueryParams(params) : {}),
                filter: {
                    IdNivelAcad: id,
                },
            },
        }
    );
    return data.data;
}

export async function getAllPeriodosGestionMap(): Promise<Map<string, string>> {
    const periodosGestiones = await getAllPeriodosGestion();
    return new Map(periodosGestiones.map((n) => [n.id, n.periodo_gestion]));
}
