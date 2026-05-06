export interface NivelAcademicoRef {
  id: string;
  nivel_acad: string;
}

export interface EspecialidadRef {
  id: string;
  especialidad: string;
  id_nivel_acad: string;
  nivel_academico?: NivelAcademicoRef;
}

export interface PeriodoAcademicoRef {
  id: string;
  descripcion: string;
  orden: string;
}

export interface UnidadAcademicaRef {
  id: string;
  unidad_academica: string;
}

export interface PeriodoGestionRef {
  id: string;
  periodo_gestion: string;
}

export interface Curso {
  id: number;
  curso: string;
  id_especialidad: string;
  id_unidad_academica: string;
  id_periodo_gestion: string;
  id_periodo_academico?: string;
  periodo: string;
  gestion: string;
  paralelo: string;
  tipo: string;
  especialidad?: EspecialidadRef;
  unidad_academica?: UnidadAcademicaRef;
  periodo_gestion?: PeriodoGestionRef;
  periodo_academico?: PeriodoAcademicoRef; // semestre
}

export interface CreateCursoRequest {
  curso: string;
  idEspecialidad: number;
  idUnidadAcademica: number;
  periodo: number;
  gestion: number;
  idPeriodoGestion: number;
  paralelo: string;
  tipo: string;
}

export interface UpdateCursoRequest {
  id: number;
  curso?: string;
  idEspecialidad?: number;
  idUnidadAcademica?: number;
  periodo?: number;
  gestion?: number;
  idPeriodoGestion?: number;
  paralelo?: string;
  tipo?: string;
}

export interface CursoServerFilters {
  NivelAcademico?: string;
  UnidadAcademica?: string;
  PeriodoGestion?: string;
  Gestion?: string;
  PeriodoAcademico?: string; // semestre
  Paralelo?: string;
  Especialidad?: string;
  Curso?: string;
}
