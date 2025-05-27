import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { LoadingOverlayComponent } from './shared/loading-overlay/loading-overlay.component'; // Importa el componente

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, LoadingOverlayComponent],
})
export class AppComponent {
  constructor() {}
}
