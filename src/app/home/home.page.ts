import { Component, OnDestroy } from '@angular/core';

import { AlertController, Platform } from '@ionic/angular';

import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { from, interval } from 'rxjs';
import {
  repeat,
  delay,
  take,
  map,
  concatAll,
  catchError,
  finalize,
  switchMap,
  tap,
} from 'rxjs/operators';

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
      .then(async (isAvail) => {
        console.log({ isAvail });
        await this.torch.switchOff();
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

  async sos() {
    await this.torch.switchOff();
    // from([1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1])
    //   .pipe(
    //     map((x) => interval(x === 1 ? 500 : 2000).pipe(take(1))),
    //     concatAll(),
    //     catchError((error) => {
    //       console.log({ error });
    //       throw error;
    //     }),
    //     finalize(() => {
    //       console.log('stop!');
    //     })
    //   )
    //   .subscribe(async (value) => {
    //     console.log({ value });
    //     await this.torch.toggle();
    //   });

    // from([1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1])
    //   .pipe(
    //     map((x) => interval(x === 1 ? 500 : 2000).pipe(take(1))),
    //     concatAll(),
    //     repeat(0)
    //   )
    //   .subscribe((x) => console.log(x));

    const lightsAndDelays = from([
      'off',
      501,
      'off',
      501,
      'off',
      501,
      'off',
      1000,
      'off',
      1000,
      'off',
      1000,
      'off',
      'off',
      'off',
    ]);

    const higerOrder = lightsAndDelays.pipe(
      switchMap((sequence) => interval(sequence === 'off' ? 500 : +sequence)),
      tap((ms) => console.log(ms))
    );
    // const firstOrder = higerOrder.pipe(repeat(2));
    higerOrder.subscribe(
      async (x) => await this.torch.toggle(),
      (err) => {},
      () => {
        console.log('completed!');
      }
    );
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
