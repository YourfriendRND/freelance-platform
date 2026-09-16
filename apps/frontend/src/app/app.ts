import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SessionNavigationService } from './auth/session-navigation.service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    inject(SessionNavigationService);
  }
}
