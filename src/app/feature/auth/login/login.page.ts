// login.page.ts
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { idCardOutline, lockClosedOutline, logInOutline, logoGoogle } from 'ionicons/icons';

import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/loading/loading.service';
import { ToastService } from '../../../core/toast/toast.service';
import { LoadingOverlayComponent } from "../../../shared/loading-overlay/loading-overlay.component";


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    LoadingOverlayComponent,
],
})
export class LoginPage {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService,
    private toastController: ToastController,
    private toastService: ToastService,
  ) {
    // Registramos el icono de Google para que esté disponible en la plantilla
    addIcons({ // Registra los iconos que vas a usar
      idCardOutline,
      lockClosedOutline,
      logInOutline,
      logoGoogle
    });

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
    this.loadingService.setLoading(true);

    const { cedula, password } = this.form.value;

    try {
      // Intentamos iniciar sesión directamente con la cédula y contraseña
      const loggedIn = await this.authService.loginWithCedula(cedula, password);

      if (loggedIn) {
        this.router.navigateByUrl('/home');
      } else {
        this.toastService.showError('Cédula o contraseña incorrecta. Por favor, inténtalo de nuevo.');
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión con cédula:', error);
      let errorMessage = 'Ocurrió un error al iniciar sesión. Por favor, verifica tus credenciales.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta.';
      }
      this.toastService.showError(errorMessage);
    } finally{
      this.loadingService.setLoading(false);
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
