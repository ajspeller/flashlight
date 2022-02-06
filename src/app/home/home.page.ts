import { Component } from '@angular/core';

import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  isReady = false;

  constructor(
    private torch: Flashlight,
    private platform: Platform,
    private alertController: AlertController
  ) {
    this.platform
      .ready()
      .then((result: string) => {
        console.log({ result });
        this.isReady = true;
        return this.torch.available();
      })
      .then((isAvail) => {
        console.log({ isAvail });
      })
      .catch((err) => {
        console.warn({ err });
        this.showAlert();
      });
  }

  async toggle() {
    try {
      const isAvailable = await this.torch.available();
      console.log({ isAvailable });
      this.torch.toggle();
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (err) {
      this.showAlert();
      console.warn({ err });
    }
  }

  isTorchOn(): boolean {
    return this.torch.isSwitchedOn();
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Torch is not available',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
