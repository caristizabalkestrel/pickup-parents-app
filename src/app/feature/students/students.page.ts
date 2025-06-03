// feature/students/students.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { getAuth } from '@angular/fire/auth'; // Importar getAuth para obtener el UID del usuario actual

import { addIcons } from 'ionicons';
import { personOutline, schoolOutline, saveOutline, trashOutline } from 'ionicons/icons';

import { LoadingService } from 'src/app/core/loading/loading.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { SessionService } from 'src/app/core/session/session.service';
import { LoadingOverlayComponent } from "src/app/shared/loading-overlay/loading-overlay.component";
import { StudentService } from 'src/app/core/student/service/student.service';
import { StudentProfile } from 'src/app/core/models/StudentProfile';
import { ParentProfile } from 'src/app/core/models/parent-profile.model';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    LoadingOverlayComponent
  ],
})
export class StudentsPage implements OnInit {
  form: FormGroup;
  students: StudentProfile[] = []; // Usamos StudentProfile para tipar la lista
  private currentParent: ParentProfile | null = null; // Para almacenar el perfil del padre

  constructor(
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private sessionService: SessionService,
    private studentService: StudentService, // Inyectar StudentService
    private router: Router
  ) {
    addIcons({ personOutline, schoolOutline, saveOutline, trashOutline });

    this.form = this.fb.group({
      nombreAlumno: ['', Validators.required],
      seccion: ['', Validators.required],
      // No necesitamos cedula, fechaNacimiento, grado, grupo por ahora según el mockup simplificado
      // Pero si los reintroduces, agrégalos aquí con sus validadores
    });
  }

  async ngOnInit() {
    // Obtener el perfil del padre al iniciar el componente
    this.currentParent = this.sessionService.getParentProfile();
    if (!this.currentParent) {
      this.toastService.showError('No se pudo cargar la información del padre. Por favor, inicie sesión nuevamente.');
      this.router.navigateByUrl('/login'); // Redirigir si no hay perfil de padre
      return;
    }

    // Cargar los estudiantes del padre actual al iniciar el componente
    await this.loadStudents();
  }

  /**
   * Carga los estudiantes asociados al padre actual desde Firestore.
   */
  async loadStudents() {
    this.loadingService.setLoading(true); // Activa el loading

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user?.uid) {
        this.students = await this.studentService.getStudentsByParentId(user.uid);
      } else {
        this.toastService.showWarning('No se encontró un usuario autenticado para cargar los estudiantes.');
        this.students = []; // Limpiar la lista si no hay usuario
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      this.toastService.showError('Ocurrió un error al cargar los estudiantes.');
      this.students = []; // Limpiar la lista en caso de error
    } finally {
      this.loadingService.setLoading(false); // Desactiva el loading
    }
  }

  /**
   * Guarda un nuevo estudiante en Firestore.
   */
  async saveStudent() {
    if (this.form.invalid) {
      this.toastService.showWarning('Por favor, complete todos los campos requeridos.');
      this.form.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores de validación
      return;
    }

    this.loadingService.setLoading(true); // Activa el loading

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user?.uid) {
        this.toastService.showError('No se pudo identificar al padre para registrar al estudiante. Por favor, inicie sesión nuevamente.');
        this.loadingService.setLoading(false);
        return;
      }

      const studentData: StudentProfile = {
        nombre: this.form.value.nombreAlumno,
        seccion: this.form.value.seccion,
        parentId: user.uid // Asociar el estudiante con el UID del padre autenticado
      };

      await this.studentService.registerStudent(studentData);
      this.toastService.showSuccess(`Estudiante "${studentData.nombre}" registrado exitosamente.`);
      this.form.reset(); // Limpiar el formulario después del registro exitoso
      await this.loadStudents(); // Recargar la lista de estudiantes para mostrar el nuevo

    } catch (error: any) {
      console.error('Error al registrar estudiante en Firestore:', error);
      this.toastService.showError('Ocurrió un error al registrar el estudiante. Por favor, inténtalo de nuevo.');
    } finally {
      this.loadingService.setLoading(false); // Desactiva el loading
    }
  }

  /**
   * Elimina un estudiante de Firestore y de la lista local.
   * @param student El estudiante a eliminar (debe tener un 'id').
   */
  async deleteStudent(student: StudentProfile) {
    if (!student.id) {
      this.toastService.showError('No se puede eliminar el estudiante: ID no encontrado.');
      return;
    }

    this.loadingService.setLoading(true); // Activa el loading

    try {
      await this.studentService.deleteStudent(student.id);
      this.toastService.showInfo(`Alumno "${student.nombre}" eliminado.`);
      await this.loadStudents(); // Recargar la lista para que se refleje la eliminación
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      this.toastService.showError('Ocurrió un error al eliminar el estudiante.');
    } finally {
      this.loadingService.setLoading(false); // Desactiva el loading
    }
  }
}
