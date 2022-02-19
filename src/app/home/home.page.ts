import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject, Subscription, timer } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';

import { AlertController, Platform } from '@ionic/angular';

import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  isReady = false;
  audio: HTMLAudioElement;
  timer$ = new Subject<number>();
  subscription: Subscription;

  constructor(
    private torch: Flashlight,
    private platform: Platform,
    private alertController: AlertController
  ) {}

  async ngOnInit(): Promise<void> {
    this.audio = new Audio();
    this.audio.src = './assets/119415__joedeshon__rocker-switch.mp3';
    this.audio.load();

    try {
      const result = await this.platform.ready();
      console.log({ result });
      this.isReady = true;

      const isAvail = await this.torch.available();
      console.log({ isAvail });

      await this.torch.switchOff();

      this.subscription = this.timer$
        .pipe(
          switchMap((value) => timer(value * 500)),
          tap(async () => {})
        )
        .subscribe(async (v) => {
          await this.torch.toggle();
          this.timer$.next(1);
        });
    } catch (error) {
      console.warn({ error });
      this.showAlert();
    }
  }

  async toggle() {
    this.subscription.unsubscribe();
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

  sleep(ms) {
    // return new Promise((resolve) => setTimeout(resolve, ms));
    return timer(ms).toPromise();
  }

  async sos() {
    await this.torch.switchOff();
    console.log({ isOn: this.torch.isSwitchedOn() });

    for (const i of [1, 1, 1, 1, 1, 3, 3, 1, 3, 1, 3, 3, 1, 1, 1, 1, 1, 7]) {
      console.log(`Waiting ${i * 500} ms...`);
      await this.torch.toggle();
      await this.sleep(i * 500);

      console.log({ i, isOn: this.torch.isSwitchedOn() });
    }

    console.log('Done');
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
