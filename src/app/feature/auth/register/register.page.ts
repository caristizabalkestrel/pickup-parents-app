import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonicModule, // Solo este para Ionic
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class RegisterPage {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]], // Agregado el campo 'apellido'
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{5,}$')]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{7,}$')]], // Valida al menos 7 dígitos para celular
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Maneja el proceso de registro del padre.
   * Registra el usuario con Firebase Auth y guarda sus datos en Firestore.
   */
  async register() {
    // Obtiene los valores del formulario, incluyendo 'apellido'
    const {
      nombre,
      apellido,
      cedula,
      celular,
      email,
      password
    } = this.form.value;

    try {
      // 1. Registra el usuario en Firebase Authentication
      const userCredential = await this.authService.registerWithEmailAndPassword(email, password);

      if (userCredential?.user?.uid) {
        const userId = userCredential.user.uid;

        // 2. Guarda la relación cédula-email en la colección 'users' (para el login con cédula)
        await this.authService.saveUserCedulaEmail(userId, cedula, email);

        // 3. Guarda la información completa del padre en la colección 'padres'
        await this.authService.saveParentProfile(userId, {
          nombre,
          apellido,
          cedula,
          celular,
          correo: email
        });

        // Si todo es exitoso, navega a la página principal
        this.router.navigateByUrl('/home');
      } else {
        // En caso de que no se obtenga el UID del usuario (raro si registerWithEmailAndPassword no lanzó error)
        alert('Error al registrar el usuario: No se pudo obtener el ID de usuario.');
      }
    } catch (error: any) {
      // Captura y muestra errores durante el registro o guardado en Firestore
      console.error('Error durante el proceso de registro:', error);
      let errorMessage = 'Error al registrar. Por favor, inténtalo de nuevo.';

      // Manejo de errores específicos de Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso. Por favor, usa otro.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      }
      alert(errorMessage);
    }
  }

  /**
   * Maneja el evento de entrada en el campo de celular.
   * Permite solo números y valida el formato.
   * @param event El evento de entrada del campo de celular.
   */
  onCelularInput(event: any): void {
    // Optionally, you can restrict input to numbers only
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  /**
   * Maneja el evento de entrada en el campo de cédula.
   * Permite solo números y valida el formato.
   * @param event El evento de entrada del campo de cédula.
   */
  onCedulaInput(event: any): void {
    // Optionally, add logic to filter or format the input
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  /**
   * Navega a la página de inicio de sesión.
   */
  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
