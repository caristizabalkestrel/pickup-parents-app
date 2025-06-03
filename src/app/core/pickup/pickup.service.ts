// src/app/core/pickup/pickup.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore'; // Importar arrayUnion
import { LaneStudent } from '../models/LaneStudent';

@Injectable({
  providedIn: 'root'
})
export class PickupService {

  constructor(private firestore: Firestore) { }

  /**
   * Añade estudiantes a la cola de un carril específico en Firestore.
   * Si el carril no existe, lo crea. Si ya existe, añade los estudiantes al array existente.
   * Utiliza arrayUnion para evitar duplicados si se intenta añadir el mismo objeto estudiante.
   * @param laneId El ID del carril (ej. 'carril-1').
   * @param studentsToAdd Un array de objetos LaneStudent a añadir.
   * @returns Una promesa que resuelve cuando la operación se ha completado.
   */
  async addStudentsToLane(laneId: string, studentsToAdd: LaneStudent[]): Promise<void> {
    try {
      const laneDocRef = doc(this.firestore, 'pickup_queue', laneId); // Colección 'pickup_queue'
      const docSnap = await getDoc(laneDocRef);

      if (docSnap.exists()) {
        // Si el documento del carril ya existe, actualiza el array de estudiantes
        await updateDoc(laneDocRef, {
          students: arrayUnion(...studentsToAdd) // Añade los nuevos estudiantes al array
        });
        console.log(`Estudiantes añadidos al carril ${laneId} con éxito.`);
      } else {
        // Si el documento del carril no existe, créalo con los estudiantes
        await setDoc(laneDocRef, {
          students: studentsToAdd
        });
        console.log(`Carril ${laneId} creado y estudiantes añadidos con éxito.`);
      }
    } catch (error) {
      console.error(`Error al añadir estudiantes al carril ${laneId} en Firestore:`, error);
      throw error;
    }
  }

  /**
   * Elimina estudiantes específicos de la cola de un carril en Firestore.
   * @param laneId El ID del carril (ej. 'carril-1').
   * @param studentsToRemove Un array de objetos LaneStudent a eliminar.
   * @returns Una promesa que resuelve cuando la operación se ha completado.
   */
  async removeStudentsFromLane(laneId: string, studentsToRemove: LaneStudent[]): Promise<void> {
    try {
      const laneDocRef = doc(this.firestore, 'pickup_queue', laneId);
      // Utiliza arrayRemove para eliminar los objetos exactos del array
      await updateDoc(laneDocRef, {
        students: arrayRemove(...studentsToRemove)
      });
      console.log(`Estudiantes eliminados del carril ${laneId} con éxito.`);
    } catch (error) {
      console.error(`Error al eliminar estudiantes del carril ${laneId} en Firestore:`, error);
      throw error;
    }
  }

}
