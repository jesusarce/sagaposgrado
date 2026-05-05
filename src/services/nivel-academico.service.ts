import http from "./http.service";
import { API_ENDPOINTS } from "../constants/api.constants";

export interface NivelAcademico {
  id: string;
  nivel_acad: string;
}

/** Retorna todos los niveles académicos (sin paginación). */
export async function getAllNivelesAcademicos(): Promise<NivelAcademico[]> {
  const { data } = await http.get<{ data: NivelAcademico[] }>(
    API_ENDPOINTS.SAGA.NIVEL_ACADEMICO.BASE
  );
  return data.data;
}

/** Construye un mapa id → nivel_acad para uso en tablas. */
export async function getNivelAcadMap(): Promise<Map<string, string>> {
  const niveles = await getAllNivelesAcademicos();
  return new Map(niveles.map((n) => [n.id, n.nivel_acad]));
}
