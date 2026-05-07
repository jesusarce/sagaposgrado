import { useEffect, useState } from "react";
import InputField from "../../form/input/InputField.tsx";
import {CreateCursoRequest, Curso, UpdateCursoRequest} from "../../../types/saga/curso.types.ts";
import {
    Especialidad,
    getAllEspecialidadesIdNivelAcad
} from "../../../services/postgrado/especialidades.service.ts";
import {getAllUnidadesAcademicas, UnidadesAcademicas} from "../../../services/postgrado/unidades-academicas.service.ts";
import {
    getAllPeriodosAcademicosIdNivelAcad,
    PeriodoAcademico
} from "../../../services/postgrado/periodos-academicos.service.ts";
import {
    getAllPeriodosGestionIdNivelAcad,
    PeriodosGestion
} from "../../../services/postgrado/periodos-gestion.service.ts";
import Label from "../../form/Label.tsx";
import Select from "../../form/Select.tsx";
import Button from "../../ui/button/Button.tsx";
import {getAllNivelesAcademicos, NivelAcademico} from "../../../services/postgrado/nivel-academico.service.ts";
import {getAllTipos, Tipo} from "../../../services/postgrado/tipos.service.ts";


interface CursoFormProps {
    curso?: Curso | null;
    onSubmit: (data: CreateCursoRequest | UpdateCursoRequest) => Promise<void>;
    onCancel: () => void;
}

export default function CursoForm({
  curso,
  onSubmit,
  onCancel,
  }: CursoFormProps) {
    const [gestion, setGestion] = useState("");
    const [unidades, setUnidades] = useState<UnidadesAcademicas[]>([]);
    const [periodoGestiones, setPeriodoGestiones] = useState<PeriodosGestion[]>([]);
    const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
    const [periodosAcademicos, setPeriodosAcademicos] = useState<PeriodoAcademico[]>([]);

    const [nivelesAcademidos, setNivelesAcademicos] = useState<NivelAcademico[]>([]);
    const [tipos, setTipos] = useState<Tipo[]>([]);

    const [nivelAcademido, setNivelAcademido] = useState<string>();
    const [tipo, setTipo] = useState("");
    const [paralelo, setParalelo] = useState("");

    const [unidad, setUnidad] = useState("");
    const [periodoGestion, setPeriodoGestion] = useState("");
    const [especilidad, setEspecilidad] = useState("");
    const [detalleCurso, setDetalleCurso] = useState("");
    const [periodoAcademico, setPeriodoAcademico] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isLoadingNivelData, setIsLoadingNivelData] = useState(false);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingInitialData(true);

            try {
                const [uni, na, tp] = await Promise.all([
                    getAllUnidadesAcademicas(),
                    getAllNivelesAcademicos(),
                    getAllTipos(),
                ]);

                setUnidades(uni);
                setNivelesAcademicos(na);
                setTipos(tp);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingInitialData(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (!nivelAcademido) {
            setPeriodoGestiones([]);
            setPeriodoGestion("");

            setPeriodosAcademicos([]);
            setPeriodoAcademico("");

            setEspecialidades([]);
            setEspecilidad("");

            return;
        }

        const loadData = async () => {
            setIsLoadingNivelData(true);

            try {
                const [
                    periodosGestionData,
                    periodosAcademicosData,
                    especialidadesData,
                ] = await Promise.all([
                    getAllPeriodosGestionIdNivelAcad(nivelAcademido),
                    getAllPeriodosAcademicosIdNivelAcad(nivelAcademido),
                    getAllEspecialidadesIdNivelAcad(nivelAcademido),
                ]);

                setPeriodoGestiones(periodosGestionData);
                setPeriodosAcademicos(periodosAcademicosData);
                setEspecialidades(especialidadesData);

                setPeriodoGestion("");
                setPeriodoAcademico("");
                setEspecilidad("");
            } catch (error) {
                setPeriodoGestiones([]);
                setPeriodosAcademicos([]);
                setEspecialidades([]);
            } finally {
                setIsLoadingNivelData(false);
            }
        };

        loadData();
    }, [nivelAcademido]);

    useEffect(() => {
        setGestion(curso?.gestion ?? "");
        setUnidad(curso?.id_unidad_academica ?? "");
        setNivelAcademido(curso?.tipo ?? "");
        setPeriodoGestion(curso?.id_periodo_gestion ?? "");
        setEspecilidad(curso?.id_especialidad ?? "");

        setDetalleCurso(curso?.curso ?? "");
        setPeriodoAcademico(curso?.periodo ?? "");
        setParalelo(curso?.paralelo ?? "");
        setTipo(curso?.tipo ?? "");
        setError(null);
    }, [curso]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!detalleCurso.trim()) {
            setError("El nombre del curso es requerido");
            return;
        }

        if (!especilidad || !unidad) {
            setError("Debe seleccionar Especialidad y Unidad Académica");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (curso) {
                const payload: UpdateCursoRequest = {
                    id: curso.id,
                    curso: detalleCurso.trim(),
                    idEspecialidad: Number(especilidad),
                    idUnidadAcademica: Number(unidad),
                    periodo: Number(periodoAcademico),
                    gestion: Number(gestion),
                    idPeriodoGestion: Number(periodoGestion),
                    paralelo,
                    tipo,
                };

                await onSubmit(payload);
            } else {
                const payload: CreateCursoRequest = {
                    curso: detalleCurso.trim(),
                    idEspecialidad: Number(especilidad),
                    idUnidadAcademica: Number(unidad),
                    periodo: Number(periodoAcademico),
                    gestion: Number(gestion),
                    idPeriodoGestion: Number(periodoGestion),
                    paralelo,
                    tipo,
                };

                await onSubmit(payload);
            }
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: { data?: { message?: string } };
            };

            setError(
                axiosErr?.response?.data?.message ??
                "Error al guardar el curso"
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Gestión</Label>
                    <InputField
                        type="number"
                        value={gestion}
                        onChange={(e) => setGestion(e.target.value)}
                        placeholder="2026"
                    />
                </div>
                <div>
                    <Label>
                        Unidad<span className="text-error-500">*</span>
                    </Label>
                    <Select
                        loading={isLoadingInitialData}
                        onChange={(value) => setUnidad(value)}
                        options={unidades.map((item) => ({
                            value: item.id,
                            label: item.unidad_academica,
                        }))}
                        placeholder="Seleccione"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Nivel Academico</Label>
                    <Select
                        loading={isLoadingInitialData}
                        onChange={(value) => setNivelAcademido(value)}
                        options={nivelesAcademidos.map((item) => ({
                            value: item.id,
                            label: item.nivel_acad
                        }))}
                        placeholder="Seleccione"
                    />
                </div>
                <div>
                    <Label>Periodo Gestión</Label>
                    <Select
                        loading={isLoadingNivelData}
                        onChange={(value) => setPeriodoGestion(value)}
                        options={periodoGestiones.map((item) => ({
                            value: item.id,
                            label: item.periodo_gestion,
                        }))}
                        placeholder="Seleccione"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>
                        Especialidad <span className="text-error-500">*</span>
                    </Label>
                    <Select
                        loading={isLoadingNivelData}
                        onChange={(value) => setEspecilidad(value)}
                        options={especialidades.map((item) => ({
                            value: item.id,
                            label: item.especialidad,
                        }))}
                        placeholder="Seleccione"
                    />
                </div>
                <div>
                    <Label>Semestre</Label>
                    <Select
                        loading={isLoadingNivelData}
                        onChange={(value) => setPeriodoAcademico(value)}
                        options={periodosAcademicos.map((item) => ({
                            value: item.id,
                            label: item.descripcion,
                        }))}
                        placeholder="Seleccione"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Tipo</Label>
                    <Select
                        loading={isLoadingInitialData}
                        onChange={(value) => setTipo(value)}
                        options={tipos.map((item) => ({
                            value: item.id,
                            label: item.description,
                        }))}
                        placeholder="Seleccione"
                    />
                </div>
                <div>
                    <Label>Paralelo</Label>
                    <InputField
                        value={paralelo}
                        onChange={(e) => setParalelo(e.target.value)}
                        placeholder="A"
                    />
                </div>

            </div>
            <div>
                <Label>
                    Detalle del curso <span className="text-error-500">*</span>
                </Label>
                <InputField
                    value={detalleCurso}
                    onChange={(e) => setDetalleCurso(e.target.value)}
                    placeholder="Nombre del curso"
                />
            </div>
            {/* Error */}
            {error && (
                <p className="text-sm text-error-500">{error}</p>
            )}

            {/* Botones */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>

                <Button type="submit" disabled={isSubmitting || isLoadingInitialData || isLoadingNivelData} >
                    {isSubmitting
                        ? "Guardando..."
                        : curso
                            ? "Actualizar"
                            : "Crear"}
                </Button>
            </div>
        </form>
    );
}