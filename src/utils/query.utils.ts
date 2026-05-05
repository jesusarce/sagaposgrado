import type { ApiQueryParams } from "../types/common/api.types";

/**
 * Convierte ApiQueryParams al formato de query string que espera ApiTrait.
 *
 * Ejemplo de salida para axios `params`:
 * {
 *   included: "department,typeDocument",
 *   "filter[state_document_id]": "1,2",
 *   "filter[doc_referencia]": "oficio",
 *   sort: "-id,doc_fecha_origen",
 *   perPage: "15",
 *   page: "1",
 * }
 */
export function buildQueryParams(
  params: ApiQueryParams
): Record<string, string> {
  const query: Record<string, string> = {};

  // ?included=relation1,relation2
  if (params.included?.length) {
    query["included"] = params.included.join(",");
  }

  // ?filter[campo]=valor  (arrays → "1,2,3")
  if (params.filter) {
    for (const [key, value] of Object.entries(params.filter)) {
      query[`filter[${key}]`] = Array.isArray(value)
        ? value.join(",")
        : String(value);
    }
  }

  // ?sort=campo,-otro_campo
  if (params.sort?.length) {
    query["sort"] = params.sort.join(",");
  }

  // ?perPage=15
  if (params.perPage !== undefined) {
    query["perPage"] = String(params.perPage);
  }

  // ?page=2
  if (params.page !== undefined) {
    query["page"] = String(params.page);
  }

  return query;
}
