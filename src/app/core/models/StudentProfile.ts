export interface StudentProfile {
  id?: string;
  nombre: string;
  seccion: string;
  parentId: string; // Para asociar al estudiante con el padre que lo registró (UID del padre)
}
