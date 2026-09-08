import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { checkSpaVersion } from './app/core/spa-version';

async function bootstrap(): Promise<void> {
  try {
    await checkSpaVersion();

    await bootstrapApplication(App, appConfig);
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
  }
}

bootstrap();
