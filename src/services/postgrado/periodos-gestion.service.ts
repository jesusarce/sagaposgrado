import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";

export interface PeriodosGestion {
    id: string;
    nivel_acad: string;
}

export async function getAllPeriodosGestion(): Promise<PeriodosGestion[]> {
    const { data } = await http.get<{ data: PeriodosGestion[] }>(
        API_ENDPOINTS.SAGA.PERIODO_GESTION.BASE
    );
    return data.data;
}

export async function getPeriodosGestionMap(): Promise<Map<string, string>> {
    const periodosGestiones = await getAllPeriodosGestion();
    return new Map(periodosGestiones.map((n) => [n.id, n.nivel_acad]));
}
