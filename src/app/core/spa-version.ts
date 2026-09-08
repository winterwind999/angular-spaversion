import { APP_VERSION } from './version';

const STORAGE_KEY = 'app-version';
const RELOAD_KEY = 'app-version-reload';

export async function checkSpaVersion(): Promise<void> {
  const storedVersion = localStorage.getItem(STORAGE_KEY);

  // First installation.
  if (!storedVersion) {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    return;
  }

  // Current deployment.
  if (storedVersion === APP_VERSION) {
    sessionStorage.removeItem(RELOAD_KEY);
    return;
  }

  console.info(`New SPA version detected: ${storedVersion} → ${APP_VERSION}`);

  // Prevent pathological reload loops.
  const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);

  if (alreadyReloaded === APP_VERSION) {
    console.warn('SPA version is still inconsistent after reload. Skipping another reload.');
    return;
  }

  sessionStorage.setItem(RELOAD_KEY, APP_VERSION);

  await clearApplicationCaches();

  window.location.reload();
}

async function clearApplicationCaches(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();

    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  } catch (error) {
    console.warn('Failed to clear Cache Storage:', error);
  }
}
