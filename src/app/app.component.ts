import { Component, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor() {}

  async ngOnInit(): Promise<void> {
    try {
      await SplashScreen.show({ showDuration: 5000, autoHide: true });
    } catch (error) {
      console.warn({ error });
    }

    try {
      await StatusBar.setBackgroundColor({ color: '#000' });
    } catch (error) {
      console.warn({ error });
    }
  }
}
