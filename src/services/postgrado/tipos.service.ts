import http from "../http.service.ts";
import { API_ENDPOINTS } from "../../constants/api.constants.ts";

export interface Tipo {
    id: string;
    description: string;
    order: number;
}

export async function getAllTipos(): Promise<Tipo[]> {
    const { data } = await http.get<{ data: Tipo[] }>(
        API_ENDPOINTS.SAGA.TIPO.BASE
    );
    return data.data;
}

export async function getAllTiposMap(): Promise<Map<string, string>> {
    const tipos = await getAllTipos();
    return new Map(tipos.map((n) => [n.id, n.description]));
}
