import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async presentToast(
    message: string,
    color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' = 'danger',
    position: 'top' | 'bottom' | 'middle' = 'bottom',
    duration: number = 2000
  ) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      position: position,
    });
    await toast.present();
  }

  async showSuccess(message: string, duration: number = 2000) {
    await this.presentToast(message, 'success', 'bottom', duration);
  }

  async showError(message: string, duration: number = 2000) {
    await this.presentToast(message, 'danger', 'bottom', duration);
  }

  async showWarning(message: string, duration: number = 2000) {
    await this.presentToast(message, 'warning', 'bottom', duration);
  }

  async showInfo(message: string, duration: number = 2000) {
    await this.presentToast(message, 'primary', 'bottom', duration);
  }
}
