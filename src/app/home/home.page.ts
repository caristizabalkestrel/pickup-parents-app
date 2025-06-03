import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, IonFooter, IonText, IonBackButton, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { menuOutline, personOutline, logOutOutline, schoolOutline, carOutline, arrowBackOutline } from 'ionicons/icons';

import { AuthService } from 'src/app/core/auth/service/auth.service';
import { SessionService } from 'src/app/core/session/session.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonIcon, IonRouterOutlet,
    IonButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent,
    IonMenu, IonMenuButton, IonList, IonItem, IonLabel, IonFooter, IonText,
    IonBackButton,
    RouterOutlet,
    CommonModule
  ],
})
export class HomePage implements OnInit, OnDestroy {
  userName: string = 'Usuario';
  showBackButton: boolean = false;
  private routerSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sessionService: SessionService,
  ) {
    addIcons({ menuOutline, personOutline, logOutOutline, schoolOutline, carOutline, arrowBackOutline });
  }

  ngOnInit() {
    // Obtener el nombre del usuario desde el servicio de sesión
    const parentProfile = this.sessionService.getParentProfile();
    if (parentProfile && parentProfile.nombre) {
      this.userName = parentProfile.nombre.toUpperCase();
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Maneja el evento de retroceso del botón.
   * Si estamos en /home/parets o /home/students, navega a /login.
   */
  async logout() {
    await this.authService.logout();
    this.sessionService.clearParentProfile();
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
    this.router.navigateByUrl('/home/parets');
  }

}
