import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";

export interface UnidadesAcademicas {
    id: string;
    unidad_academica: string;
    activa: boolean;
    nmonico: string;
    director: string;
    ci_director: string;
    rector: string;
    ci_rector: string;
    direccion: string;
}

export async function getAllUnidadesAcademicas(): Promise<UnidadesAcademicas[]> {
    const { data } = await http.get<{ data: UnidadesAcademicas[] }>(
        API_ENDPOINTS.SAGA.UNIDAD_ACADEMICA.BASE
    );
    return data.data;
}

export async function getAllUnidadesAcademicasMap(): Promise<Map<string, string>> {
    const unidadesAcademicas = await getAllUnidadesAcademicas();
    return new Map(unidadesAcademicas.map((n) => [n.id, n.unidad_academica]));
}
