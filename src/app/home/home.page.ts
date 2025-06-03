import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MenuController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

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
  pageTitle: string = 'Pickup Parents';
  showBackButton: boolean = false;
  private routerSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private menuController: MenuController,
  ) {
    addIcons({ menuOutline, personOutline, logOutOutline, schoolOutline, carOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route.snapshot.data['title'] || 'Pickup Parents';
      })
    ).subscribe((title: string) => {
      this.pageTitle = title;
      this.showBackButton = this.router.url.includes('/home/students') || this.router.url.includes('/home/parets');
    });
  }

  async ionViewWillEnter() {
    const parentProfile = this.sessionService.getParentProfile();
    if (parentProfile && parentProfile.nombre) {
      this.userName = parentProfile.nombre.toUpperCase();
    } else {
      this.userName = 'Usuario';
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async logout() {
    await this.authService.logout();
    this.sessionService.clearParentProfile();
    await this.menuController.close();
    this.router.navigateByUrl('/login');
  }

  async goToStudents() {
    await this.menuController.close();
    this.router.navigateByUrl('/home/students');
  }

  async goToRecoger() {
    await this.menuController.close();
    this.router.navigateByUrl('/home/parets');
  }

}
