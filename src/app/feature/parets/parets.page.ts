import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { getAuth } from '@angular/fire/auth';

import { addIcons } from 'ionicons';
import { carOutline, checkmarkCircleOutline, schoolOutline } from 'ionicons/icons';

import { LoadingService } from 'src/app/core/loading/loading.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { SessionService } from 'src/app/core/session/session.service';
import { LoadingOverlayComponent } from "src/app/shared/loading-overlay/loading-overlay.component";
import { StudentService } from 'src/app/core/student/service/student.service';
import { StudentProfile } from 'src/app/core/models/StudentProfile';
import { PickupService } from 'src/app/core/pickup/pickup.service';
import { LaneStudent } from 'src/app/core/models/LaneStudent';

@Component({
  selector: 'app-parets',
  templateUrl: './parets.page.html',
  styleUrls: ['./parets.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Sigue siendo necesario para FormGroup
    IonicModule,
    LoadingOverlayComponent
  ],
})
export class ParetsPage implements OnInit {
  form: FormGroup;
  private currentParentId: string | null = null;
  private studentsAddedToLane: LaneStudent[] = [];
  private selectedLane: string | null = null;

  showPickupForm: boolean = true;
  showWaitingMessage: boolean = false;
  hasRegisteredStudents: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private sessionService: SessionService,
    private studentService: StudentService,
    private pickupService: PickupService,
    private router: Router
  ) {
    addIcons({ carOutline, checkmarkCircleOutline, schoolOutline });

    this.form = this.fb.group({
      carril: ['', Validators.required],
    });
  }

  ngOnInit() {
    // La lógica de obtener el currentParentId se mantiene aquí, ya que solo necesita ejecutarse una vez
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.currentParentId = user.uid;
    } else {
      this.toastService.showError('No se encontró un usuario autenticado. Por favor, inicie sesión.');
      this.router.navigateByUrl('/login');
    }
  }

  // Nuevo Lifecycle Hook de Ionic: se ejecuta cada vez que la vista va a entrar
  async ionViewWillEnter() {
    // Solo si el padre está autenticado, verificamos los estudiantes registrados
    if (this.currentParentId) {
      await this.checkRegisteredStudents();
    }
  }

  /**
   * Verifica si el padre actual tiene estudiantes registrados.
   */
  async checkRegisteredStudents() {
    this.loadingService.setLoading(true);
    try {
      if (this.currentParentId) {
        const students = await this.studentService.getStudentsByParentId(this.currentParentId);
        this.hasRegisteredStudents = students.length > 0;
        // Si no hay hijos, ocultamos el formulario de recogida y mostramos el mensaje
        if (!this.hasRegisteredStudents) {
          this.showPickupForm = false;
          this.showWaitingMessage = false; // Asegurarse de que el mensaje de espera también esté oculto
        } else {
          // Si sí hay hijos, aseguramos que el formulario de recogida esté visible
          // y el mensaje de espera oculto (a menos que ya se haya notificado la llegada)
          if (!this.showWaitingMessage) { // Solo si no estamos en estado de espera
            this.showPickupForm = true;
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar estudiantes registrados:', error);
      this.toastService.showError('Ocurrió un error al verificar tus estudiantes.');
      this.hasRegisteredStudents = false;
      this.showPickupForm = false;
      this.showWaitingMessage = false;
    } finally {
      this.loadingService.setLoading(false);
    }
  }

  /**
   * Maneja el evento cuando el padre presiona el botón "Llegue".
   * Añade los hijos del padre al carril seleccionado en Firestore y muestra el mensaje de espera.
   */
  async onLlegue() {
    if (this.form.invalid) {
      this.toastService.showWarning('Por favor, selecciona un carril.');
      return;
    }

    this.loadingService.setLoading(true);

    try {
      if (!this.currentParentId) {
        this.toastService.showError('No se pudo identificar al padre.');
        return;
      }

      this.selectedLane = this.form.value.carril;

      const studentsOfParent: StudentProfile[] = await this.studentService.getStudentsByParentId(this.currentParentId);

      if (studentsOfParent.length === 0) {
        this.toastService.showInfo('No tienes hijos registrados para recoger.');
        this.hasRegisteredStudents = false;
        this.showPickupForm = false;
        this.showWaitingMessage = false; // Asegurarse de que no se muestre el mensaje de espera
        return;
      }

      this.studentsAddedToLane = studentsOfParent.map(student => ({
        Estudiante: student.nombre,
        seccion: student.seccion,
        parentId: this.currentParentId!,
        studentId: student.id!,
        timestamp: new Date()
      }));

      await this.pickupService.addStudentsToLane(this.selectedLane!, this.studentsAddedToLane);

      const laneDisplay = this.selectedLane ? this.selectedLane.replace('carril-', 'Carril ') : '';
      this.toastService.showSuccess(`Has notificado tu llegada al ${laneDisplay}. Tus hijos están en camino.`);

      this.showPickupForm = false;
      this.showWaitingMessage = true;

    } catch (error: any) {
      console.error('Error al notificar la llegada:', error);
      this.toastService.showError('Ocurrió un error al notificar tu llegada. Por favor, inténtalo de nuevo.');
    } finally {
      this.loadingService.setLoading(false);
    }
  }

  /**
   * Maneja el evento cuando el padre presiona el botón "Listo".
   * Elimina a los hijos del carril en Firestore y restablece la interfaz.
   */
  async onListo() {
    this.loadingService.setLoading(true);

    try {
      if (!this.selectedLane || this.studentsAddedToLane.length === 0) {
        this.toastService.showWarning('No hay estudiantes en la cola para marcar como listos.');
        return;
      }

      await this.pickupService.removeStudentsFromLane(this.selectedLane, this.studentsAddedToLane);

      this.toastService.showSuccess('¡Tus hijos han sido recogidos!');

      this.form.reset();
      this.studentsAddedToLane = [];
      this.selectedLane = null;
      this.showWaitingMessage = false;
      await this.checkRegisteredStudents(); // Volver a verificar si hay hijos registrados después de recoger
      // showPickupForm se manejará dentro de checkRegisteredStudents
    } catch (error: any) {
      console.error('Error al marcar como listo:', error);
      this.toastService.showError('Ocurrió un error al marcar como listo. Por favor, inténtalo de nuevo.');
    } finally {
      this.loadingService.setLoading(false);
    }
  }

  /**
   * Navega a la página de registro de estudiantes.
   */
  goToStudents() {
    this.router.navigateByUrl('/home/students');
  }
}
