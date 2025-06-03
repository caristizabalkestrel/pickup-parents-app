import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, addDoc, query, where, getDocs, deleteDoc } from '@angular/fire/firestore';
import { StudentProfile } from '../../models/StudentProfile';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private firestore: Firestore) { }

  /**
   * Registra un nuevo estudiante en la colección 'students' de Firestore.
   * Genera un ID automático para el documento.
   * @param studentData Los datos del estudiante a registrar.
   * @returns Una promesa que resuelve cuando el estudiante ha sido guardado.
   */
  async registerStudent(studentData: StudentProfile): Promise<void> {
    try {
      // Obtiene una referencia a la colección 'students'
      const studentsRef = collection(this.firestore, 'students');
      // Añade un nuevo documento con un ID generado automáticamente por Firestore
      await addDoc(studentsRef, studentData);
      console.log('Estudiante registrado con éxito en Firestore.');
    } catch (error) {
      console.error('Error al registrar estudiante en Firestore:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los estudiantes asociados a un padre específico por su ID.
   * @param parentId El UID del padre.
   * @returns Una promesa que resuelve con un array de StudentProfile.
   */
  async getStudentsByParentId(parentId: string): Promise<StudentProfile[]> {
    try {
      const studentsRef = collection(this.firestore, 'students');
      // Crea una consulta para filtrar estudiantes por parentId
      const q = query(studentsRef, where('parentId', '==', parentId));
      const querySnapshot = await getDocs(q);

      const students: StudentProfile[] = [];
      querySnapshot.forEach((document) => {
        // Asegurarse de que los datos coincidan con la interfaz StudentProfile
        // y añadir el ID del documento de Firestore
        students.push({ id: document.id, ...document.data() } as StudentProfile);
      });
      console.log(`Estudiantes encontrados para el padre ${parentId}:`, students);
      return students;
    } catch (error) {
      console.error('Error al obtener estudiantes por ID de padre desde Firestore:', error);
      throw error;
    }
  }

  /**
   * Elimina un estudiante de la colección 'students' de Firestore.
   * @param studentId El ID del documento del estudiante a eliminar.
   * @returns Una promesa que resuelve cuando el estudiante ha sido eliminado.
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      const studentDocRef = doc(this.firestore, 'students', studentId);
      await deleteDoc(studentDocRef);
      console.log(`Estudiante ${studentId} eliminado con éxito de Firestore.`);
    } catch (error) {
      console.error(`Error al eliminar estudiante ${studentId} de Firestore:`, error);
      throw error;
    }
  }

}
