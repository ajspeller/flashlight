import { Component, OnDestroy } from '@angular/core';

import { AlertController, Platform } from '@ionic/angular';

import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy {
  isReady = false;
  audio: HTMLAudioElement;

  constructor(
    private torch: Flashlight,
    private platform: Platform,
    private alertController: AlertController
  ) {
    this.platform
      .ready()
      .then((result: string) => {
        this.audio = new Audio();
        this.audio.src = './assets/119415__joedeshon__rocker-switch.mp3';
        this.audio.load();

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
      this.audio.play();
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

  ngOnDestroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
}
