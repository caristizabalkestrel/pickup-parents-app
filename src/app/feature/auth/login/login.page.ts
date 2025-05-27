// login.page.ts
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
})
export class LoginPage {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Registramos el icono de Google para que esté disponible en la plantilla
    // addIcons({ logoGoogle });

    this.form = this.fb.group({
      // Validamos 'identifier' como cédula: requerido y patrón numérico de al menos 5 dígitos
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{5,}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Maneja el inicio de sesión solo con cédula y contraseña.
   */
  async login() {
    const { cedula, password } = this.form.value;

    try {
      // Intentamos iniciar sesión directamente con la cédula y contraseña
      const loggedIn = await this.authService.loginWithCedula(cedula, password);

      if (loggedIn) {
        this.router.navigateByUrl('/home');
      } else {
        // El mensaje de error ya es manejado por loginWithCedula, pero se puede añadir un fallback.
        alert('Cédula o contraseña incorrecta. Por favor, inténtalo de nuevo.');
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión con cédula:', error);
      // Los errores específicos ya se manejan en el AuthService, aquí solo un mensaje general
      alert('Ocurrió un error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  }

  onCedulaInput(event: any): void {
    // Optionally, add logic to filter or format the input
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }
}
