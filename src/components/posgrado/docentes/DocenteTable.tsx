import { useState, useMemo } from "react";
import { AngleDownIcon, AngleUpIcon } from "../../../icons";
import { Docente } from "../../../services/postgrado/docentes.service.ts";
import TableSkeleton from "../../animation/TableSkeleton.tsx";

interface DocenteTableProps {
    docentes: Docente[];
    isLoading?: boolean;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function DocenteTable({
                                         docentes,
                                         isLoading = false,
                                     }: DocenteTableProps) {
    const [filterMateria, setFilterMateria] = useState("");
    const [filterDocente, setFilterDocente] = useState("");
    const [filterDicta, setFilterDicta] = useState("");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const filtered = useMemo(() => {
        const materia = filterMateria.toLowerCase();
        const docente = filterDocente.toLowerCase();
        const dicta = filterDicta.toLowerCase();

        return docentes.filter((d) => {
            const nombreCompleto =
                `${d.apPaterno} ${d.apMaterno} ${d.nombre}`.toLowerCase();

            return (
                (!materia || d.materia.toLowerCase().includes(materia)) &&
                (!docente || nombreCompleto.includes(docente)) &&
                (!dicta || d.dicta.toLowerCase().includes(dicta))
            );
        });
    }, [docentes, filterMateria, filterDocente, filterDicta]);

    const sorted = useMemo(() => {
        if (!sortField) return filtered;

        return [...filtered].sort((a, b) => {
            let aVal = "";
            let bVal = "";

            if (sortField === "docente") {
                aVal = `${a.apPaterno} ${a.apMaterno} ${a.nombre}`;
                bVal = `${b.apPaterno} ${b.apMaterno} ${b.nombre}`;
            } else {
                aVal = String(a[sortField as keyof Docente] ?? "");
                bVal = String(b[sortField as keyof Docente] ?? "");
            }

            const cmp = aVal.localeCompare(bVal, undefined, {
                numeric: true,
                sensitivity: "base",
            });

            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(page, totalPages);

    const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

    const total = filtered.length;
    const from = total === 0 ? 0 : (safePage - 1) * perPage + 1;
    const to = Math.min(safePage * perPage, total);

    function handleSort(field: string) {
        if (sortField === field) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }

        setPage(1);
    }

    function renderSortIcon(field: string) {
        if (sortField !== field) {
            return <AngleDownIcon className="size-3 opacity-30" />;
        }

        return sortDir === "asc" ? (
            <AngleUpIcon className="size-3" />
        ) : (
            <AngleDownIcon className="size-3" />
        );
    }

    function handleFilterChange(setter: (v: string) => void) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);
            setPage(1);
        };
    }

    function handlePerPageChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setPerPage(Number(e.target.value));
        setPage(1);
    }

    function renderPageNumbers(): (number | "...")[] {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | "...")[] = [1];

        if (safePage > 3) pages.push("...");

        for (
            let i = Math.max(2, safePage - 1);
            i <= Math.min(totalPages - 1, safePage + 1);
            i++
        ) {
            pages.push(i);
        }

        if (safePage < totalPages - 2) pages.push("...");

        pages.push(totalPages);

        return pages;
    }

    const btnBase =
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors";

    const btnNormal = `${btnBase} border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 disabled:opacity-40`;

    const btnActive = `${btnBase} border-brand-500 bg-brand-500 text-white`;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                        <th
                            onClick={() => handleSort("fechaCreacion")}
                            className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        >
                <span className="flex items-center gap-1">
                  Fecha {renderSortIcon("fechaCreacion")}
                </span>
                        </th>

                        <th
                            onClick={() => handleSort("hrsSem")}
                            className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        >
                <span className="flex items-center gap-1">
                  Horas {renderSortIcon("hrsSem")}
                </span>
                        </th>

                        <th
                            onClick={() => handleSort("sigla")}
                            className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        >
                <span className="flex items-center gap-1">
                  Código {renderSortIcon("sigla")}
                </span>
                        </th>

                        <th
                            onClick={() => handleSort("materia")}
                            className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        >
                <span className="flex items-center gap-1">
                  Materia {renderSortIcon("materia")}
                </span>
                        </th>

                        <th
                            onClick={() => handleSort("dicta")}
                            className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        >
                <span className="flex items-center gap-1">
                  Dicta {renderSortIcon("dicta")}
                </span>
                        </th>

                        <th
                            onClick={() => handleSort("docente")}
                            className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        >
                <span className="flex items-center gap-1">
                  Docente {renderSortIcon("docente")}
                </span>
                        </th>
                    </tr>

                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                        <td className="px-5 py-2" />
                        <td className="px-5 py-2" />
                        <td className="px-5 py-2" />

                        <td className="px-5 py-2">
                            <input
                                value={filterMateria}
                                onChange={handleFilterChange(setFilterMateria)}
                                placeholder="Buscar materia..."
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                        </td>

                        <td className="px-5 py-2">
                            <input
                                value={filterDicta}
                                onChange={handleFilterChange(setFilterDicta)}
                                placeholder="T / L"
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                        </td>

                        <td className="px-5 py-2">
                            <input
                                value={filterDocente}
                                onChange={handleFilterChange(setFilterDocente)}
                                placeholder="Buscar docente..."
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                        </td>
                    </tr>
                    </thead>

                    <tbody
                        className={`divide-y divide-gray-100 dark:divide-white/[0.05] transition-opacity duration-200 ${
                            isLoading ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                    {isLoading && docentes.length === 0 ? (
                        <TableSkeleton rows={8} cols={6} />
                    ) : paged.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-5 py-10 text-center text-sm text-gray-400"
                            >
                                No hay docentes registrados
                            </td>
                        </tr>
                    ) : (
                        paged.map((item, index) => (
                            <tr
                                key={`${item.idMateriaC}-${index}`}
                                className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                            >
                                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    {item.fechaCreacion}
                                </td>

                                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    {item.hrsSem}
                                </td>

                                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    {item.sigla}
                                </td>

                                <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                    {item.materia}
                                </td>

                                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    {item.dicta}
                                </td>

                                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    {item.apPaterno} {item.apMaterno}, {item.nombre}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {!isLoading && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 dark:border-white/[0.05]">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Filas por página:</span>

                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                            {PER_PAGE_OPTIONS.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>

                        <span>
              {from}–{to} de {total}
            </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={safePage === 1}
                            className={btnNormal}
                            title="Primera"
                        >
                            «
                        </button>

                        <button
                            onClick={() => setPage(safePage - 1)}
                            disabled={safePage === 1}
                            className={btnNormal}
                            title="Anterior"
                        >
                            ‹
                        </button>

                        {renderPageNumbers().map((p, i) =>
                                p === "..." ? (
                                    <span
                                        key={i}
                                        className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                                    >
                  …
                </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={p === safePage ? btnActive : btnNormal}
                                    >
                                        {p}
                                    </button>
                                )
                        )}

                        <button
                            onClick={() => setPage(safePage + 1)}
                            disabled={safePage === totalPages}
                            className={btnNormal}
                            title="Siguiente"
                        >
                            ›
                        </button>

                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={safePage === totalPages}
                            className={btnNormal}
                            title="Última"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}