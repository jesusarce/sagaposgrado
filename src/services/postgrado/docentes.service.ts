import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";

export interface Docente {
    idCurso: string;
    idMateria: string;
    idMateriaC: string;
    idDocente: string;
    vigente: string;
    dicta: string;
    codMateria: string;
    materia: string;
    sigla: string;
    idTipoMateria: string;
    prioridad: string;
    codDocente: string;
    curso: string;
    idGrado: string;
    idCategoria: string;
    apPaterno: string;
    apMaterno: string;
    nombre: string;
    sexo: string;
    docente: string;
    grado: string;
    fuerza: string;
    categoria: string;
    fechaCreacion: string;
    hrsSem: string;
}

export async function getAllDocentes(): Promise<Docente[]> {
    const { data } = await http.get<{ data: Docente[] }>(
        API_ENDPOINTS.SAGA.DOCENTE.BASE
    );
    return data.data;
}

export async function getAllDocentesMap(): Promise<Map<string, string>> {
    const docentes = await getAllDocentes();

    return new Map(
        docentes.map((item) => [
            item.idDocente,
            item.docente,
        ])
    );
}