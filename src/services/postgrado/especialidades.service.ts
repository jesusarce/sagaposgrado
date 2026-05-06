import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";
import {ApiQueryParams} from "../../types/common/api.types.ts";
import {buildQueryParams} from "../../utils/query.utils.ts";

export interface Especialidad {
    id: string;
    especialidad: string;
    id_nivel_acad: string;
    periodos: string;
    gestion_creacion: string;
    mostrar: boolean;
    basicas: boolean;
    nota_aprob: string;
}

export async function getAllEspecialidades(): Promise<Especialidad[]> {
    const { data } = await http.get<{ data: Especialidad[] }>(
        API_ENDPOINTS.SAGA.ESPECIALIDADES.BASE
    );
    return data.data;
}

export async function getAllEspecialidadesIdNivelAcad(id: string, params?: ApiQueryParams): Promise<Especialidad[]> {
    const { data } = await http.get<{ data: Especialidad[] }>(
        API_ENDPOINTS.SAGA.ESPECIALIDADES.BASE,
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

export async function getEspecialidadesMap(): Promise<Map<string, string>> {
    const especialidades = await getAllEspecialidades();
    return new Map(especialidades.map((n) => [n.id, n.especialidad]));
}
