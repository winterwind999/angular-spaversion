import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APP_VERSION } from './core/version';
import { VersionAlertDialog } from './core/version-alert-dialog/version-alert-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, VersionAlertDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-spaversion');

  version = signal(APP_VERSION);
  count = signal(0);

  increment() {
    this.count.update((c) => (c += 1));
  }

  decrement() {
    this.count.update((c) => (c -= 1));
  }
}
