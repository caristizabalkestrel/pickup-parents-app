import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getAuth, Auth } from '@angular/fire/auth';

import { addIcons } from 'ionicons';
import { idCardOutline, lockClosedOutline, logInOutline, logoGoogle } from 'ionicons/icons';

import { AuthService } from 'src/app/core/auth/service/auth.service';
import { LoadingService } from 'src/app/core/loading/loading.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { ParentProfile } from 'src/app/core/auth/models/parent-profile.model';
import { SessionService } from 'src/app/core/session/session.service';
import { LoadingOverlayComponent } from "src/app/shared/loading-overlay/loading-overlay.component";


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
  auth: Auth;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService,
    private toastService: ToastService,
    private sessionService: SessionService
  ) {
    this.auth = getAuth(); // Inicializa la instancia de Auth en el constructor
    addIcons({ // Registra los iconos que se va a usar
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
        // Usamos la instancia de auth que ya tenemos en la propiedad de la clase
        const user = this.auth.currentUser;;
        if (user) {
          const parentProfile = await this.authService.getParentProfile(user.uid);
          if (parentProfile) {
            // Guarda el objeto tipado en la sesión
            this.sessionService.setParentProfile(parentProfile as ParentProfile);
          }
        }
        this.router.navigateByUrl('/home');
        this.toastService.showSuccess('Bienvenido! ' + (this.sessionService.getParentProfile()?.nombre?.toUpperCase() || 'Usuario'));
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
