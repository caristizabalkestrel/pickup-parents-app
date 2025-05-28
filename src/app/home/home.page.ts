import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, IonFooter, IonText, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth/service/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from '../core/session/session.service'; // Importar SessionService
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngIf si se usan
import { addIcons } from 'ionicons';
import { menuOutline, personOutline, logOutOutline, schoolOutline, carOutline } from 'ionicons/icons'; // Importar iconos

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonIcon,
    IonButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent,
    IonMenu, IonMenuButton, IonList, IonItem, IonLabel, IonFooter, IonText,
    RouterOutlet,
    CommonModule
  ],
})
export class HomePage implements OnInit {

  userName: string = 'Usuario';

  constructor(
    private authService: AuthService,
    private router: Router,
    private sessionService: SessionService
  ) {
    addIcons({ menuOutline, personOutline, logOutOutline, schoolOutline, carOutline });
  }

  ngOnInit() {
    // Obtener el nombre del usuario desde el servicio de sesión
    const parentProfile = this.sessionService.getParentProfile();
    if (parentProfile && parentProfile.nombre) {
      this.userName = parentProfile.nombre.toUpperCase();
    }
  }

  /**
   * Cierra la sesión del usuario y limpia los datos de la sesión.
   */
  async logout() {
    await this.authService.logout();
    this.sessionService.clearParentProfile(); // Limpiar datos de sesión al cerrar sesión
    this.router.navigateByUrl('/login');
  }

  /**
   * Navega a la página de registro de estudiantes.
   */
  goToStudents() {
    this.router.navigateByUrl('/home/students');
  }

  /**
   * Navega a la página de "Recoger" (asumiendo que es la página de padres).
   */
  goToRecoger() {
    this.router.navigateByUrl('/home/parets'); // Navega a la ruta 'parets'
  }
}
