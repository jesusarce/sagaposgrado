import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";

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

export async function getEspecialidadMap(): Promise<Map<string, string>> {
    const especialidades = await getAllEspecialidades();
    return new Map(especialidades.map((n) => [n.id, n.especialidad]));
}
