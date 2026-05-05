import { useEffect, useState } from "react";
import InputField from "../../form/input/InputField.tsx";
import {CreateCursoRequest, Curso, UpdateCursoRequest} from "../../../types/saga/curso.types.ts";
import {Especialidad, getAllEspecialidades} from "../../../services/postgrado/especialidades.service.ts";
import {getAllUnidadesAcademicas, UnidadesAcademicas} from "../../../services/postgrado/unidades-academicas.service.ts";
import {getAllPeriodosAcademicos, PeriodoAcademico} from "../../../services/postgrado/periodos-academicos.service.ts";
import {getAllPeriodosGestion, PeriodosGestion} from "../../../services/postgrado/periodos-gestion.service.ts";
import Label from "../../form/Label.tsx";
import Select from "../../form/Select.tsx";
import Button from "../../ui/button/Button.tsx";


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
    const [nombreCurso, setNombreCurso] = useState("");
    const [idEspecialidad, setIdEspecialidad] = useState("");
    const [idUnidadAcademica, setIdUnidadAcademica] = useState("");
    const [periodo, setPeriodo] = useState("");
    const [gestion, setGestion] = useState("");
    const [idPeriodoGestion, setIdPeriodoGestion] = useState("");
    const [paralelo, setParalelo] = useState("");
    const [tipo, setTipo] = useState("Posgrado");

    const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
    const [unidades, setUnidades] = useState<UnidadesAcademicas[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
    const [gestiones, setGestiones] = useState<PeriodosGestion[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            getAllEspecialidades(),
            getAllUnidadesAcademicas(),
            getAllPeriodosAcademicos(),
            getAllPeriodosGestion(),
        ])
            .then(([esp, uni, per, ges]) => {
                setEspecialidades(esp);
                setUnidades(uni);
                setPeriodos(per);
                setGestiones(ges);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        setNombreCurso(curso?.curso ?? "");
        setIdEspecialidad(curso?.id_especialidad ?? "");
        setIdUnidadAcademica(curso?.id_unidad_academica ?? "");
        setPeriodo(curso?.periodo ?? "");
        setGestion(curso?.gestion ?? "");
        setIdPeriodoGestion(curso?.id_periodo_gestion ?? "");
        setParalelo(curso?.paralelo ?? "");
        setTipo(curso?.tipo ?? "Posgrado");
        setError(null);
    }, [curso]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!nombreCurso.trim()) {
            setError("El nombre del curso es requerido");
            return;
        }

        if (!idEspecialidad || !idUnidadAcademica) {
            setError("Debe seleccionar Especialidad y Unidad Académica");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (curso) {
                const payload: UpdateCursoRequest = {
                    id: curso.id,
                    curso: nombreCurso.trim(),
                    idEspecialidad: Number(idEspecialidad),
                    idUnidadAcademica: Number(idUnidadAcademica),
                    periodo: Number(periodo),
                    gestion: Number(gestion),
                    idPeriodoGestion: Number(idPeriodoGestion),
                    paralelo,
                    tipo,
                };

                await onSubmit(payload);
            } else {
                const payload: CreateCursoRequest = {
                    curso: nombreCurso.trim(),
                    idEspecialidad: Number(idEspecialidad),
                    idUnidadAcademica: Number(idUnidadAcademica),
                    periodo: Number(periodo),
                    gestion: Number(gestion),
                    idPeriodoGestion: Number(idPeriodoGestion),
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
            {/* Curso */}
            <div>
                <Label>
                    Curso <span className="text-error-500">*</span>
                </Label>
                <InputField
                    value={nombreCurso}
                    onChange={(e) => setNombreCurso(e.target.value)}
                    placeholder="Nombre del curso"
                />
            </div>

            {/* Especialidad */}
            <div>
                <Label>
                    Especialidad <span className="text-error-500">*</span>
                </Label>
                <Select
                    value={idEspecialidad}
                    onChange={(e) => setIdEspecialidad(e.target.value)}
                    options={especialidades.map((item) => ({
                        value: item.id,
                        label: item.especialidad,
                    }))}
                    placeholder="Seleccione"
                />
            </div>

            {/* Unidad Académica */}
            <div>
                <Label>
                    Unidad Académica <span className="text-error-500">*</span>
                </Label>
                <Select
                    value={idUnidadAcademica}
                    onChange={(e) => setIdUnidadAcademica(e.target.value)}
                    options={unidades.map((item) => ({
                        value: item.id,
                        label: item.unidad_academica,
                    }))}
                    placeholder="Seleccione"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Periodo</Label>
                    <Select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        options={periodos.map((item) => ({
                            value: item.id,
                            label: item.descripcion,
                        }))}
                        placeholder="Seleccione"
                    />
                </div>

                <div>
                    <Label>Gestión</Label>
                    <InputField
                        type="number"
                        value={gestion}
                        onChange={(e) => setGestion(e.target.value)}
                        placeholder="2025"
                    />
                </div>

                <div>
                    <Label>Periodo Gestión</Label>
                    <Select
                        value={idPeriodoGestion}
                        onChange={(e) =>
                            setIdPeriodoGestion(e.target.value)
                        }
                        options={gestiones.map((item) => ({
                            value: item.id,
                            label: item.nivel_acad,
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

            {/* Tipo */}
            <div>
                <Label>Tipo</Label>
                <Select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    options={[
                        { value: "Posgrado", label: "Posgrado" },
                        { value: "Pregrado", label: "Pregrado" },
                    ]}
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

                <Button type="submit" disabled={isSubmitting}>
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