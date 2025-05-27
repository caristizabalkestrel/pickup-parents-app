import { Component } from '@angular/core';
import { LoadingService } from '../../core/loading/loading.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common'; // Importa AsyncPipe

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AsyncPipe], // Añade AsyncPipe a los imports
})
export class LoadingOverlayComponent {

  isLoading$ = this.loadingService.isLoading$; // Asigna el observable a una propiedad local

  constructor(public loadingService: LoadingService) {
    console.log('LoadingOverlayComponent initialized');
  }

}
