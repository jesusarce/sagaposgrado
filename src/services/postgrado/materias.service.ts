import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";

export interface Materia {
    idCurso: string;
    idMateria: string;
    idTipoCalif: string;
    idUnidadAcademica: string;
    idEspecialidad: string;
    notaAprob: string;
    curso: string;
    codMateria: string;
    sigla: string;
    materia: string;
    tipoCalificacion: string;
    paralelo: string;
}

export async function getAllMaterias(): Promise<Materia[]> {
    const { data } = await http.get<{ data: Materia[] }>(
        API_ENDPOINTS.SAGA.MATERIA.BASE
    );
    return data.data;
}

export async function getAllMateriasMap(): Promise<Map<string, string>> {
    const materias = await getAllMaterias();

    return new Map(
        materias.map((item) => [
            item.idMateria,
            item.materia,
        ])
    );
}