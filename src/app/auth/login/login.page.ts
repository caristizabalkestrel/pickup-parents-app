import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// Importamos IonIcon para el icono de Google
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon } from "@ionic/angular/standalone";
// Importamos addIcons para registrar el icono de Google
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon // Agregamos IonIcon a los imports
  ],
})
export class LoginPage {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Registramos el icono de Google para que esté disponible
    addIcons({ logoGoogle });

    this.form = this.fb.group({
      // Validadores para la cédula: requerido y patrón numérico de al menos 5 dígitos
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{5,}$')]],
      // Validadores para la contraseña: requerido y mínimo 6 caracteres
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Maneja el inicio de sesión con cédula y contraseña.
   */
  async login() {
    const { cedula, password } = this.form.value;
    // Llama al servicio de autenticación para intentar el login con cédula
    const success = await this.auth.loginWithCedula(cedula, password);
    if (success) {
      // Si el login es exitoso, navega a la página principal
      this.router.navigateByUrl('/home');
    } else {
      // Si falla, muestra un mensaje de error (usaremos un modal en lugar de alert más adelante)
      // Por ahora, mantenemos alert para depuración rápida
      alert('Cédula o contraseña incorrecta');
    }
  }

  /**
   * Maneja el inicio de sesión con Google.
   */
  async loginWithGoogle() {
    try {
      // Llama al servicio de autenticación para iniciar sesión con Google
      const success = await this.auth.loginWithGoogle();
      if (success) {
        // Si el login es exitoso, navega a la página principal
        this.router.navigateByUrl('/home');
      } else {
        // Si falla, muestra un mensaje de error
        alert('Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      alert('Ocurrió un error al intentar iniciar sesión con Google.');
    }
  }
}
