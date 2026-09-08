import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { checkSpaVersion, pollForNewVersion, setAppInjector } from './app/core/spa-version';

async function bootstrap(): Promise<void> {
  try {
    await checkSpaVersion();

    const appRef = await bootstrapApplication(App, appConfig);
    setAppInjector(appRef.injector);

    setInterval(() => void pollForNewVersion(), 5_000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void pollForNewVersion();
    });
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
  }
}

bootstrap();
