import { APP_VERSION } from './version';

const STORAGE_KEY = 'app-version';
const RELOAD_KEY = 'app-version-reload';

export async function checkSpaVersion(): Promise<void> {
  const storedVersion = localStorage.getItem(STORAGE_KEY);

  if (!storedVersion) {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    return;
  }

  if (storedVersion === APP_VERSION) {
    sessionStorage.removeItem(RELOAD_KEY);
    return;
  }

  await forceRefresh(storedVersion, APP_VERSION);
}

export async function pollForNewVersion(): Promise<void> {
  console.log(`[spa-version] polling for new version… (current: ${APP_VERSION})`);

  try {
    const res = await fetch('/version.json', { cache: 'no-store' });

    if (!res.ok) {
      console.warn(`[spa-version] poll failed, status: ${res.status}`);
      return;
    }

    const { version: latest } = await res.json();
    console.log(`[spa-version] latest from server: ${latest}`);

    if (latest && latest !== APP_VERSION) {
      await forceRefresh(APP_VERSION, latest);
    }
  } catch (error) {
    // network hiccup — ignore, try again next interval
    console.warn('[spa-version] poll error:', error);
  }
}

async function forceRefresh(oldVersion: string, newVersion: string): Promise<void> {
  console.info(`New SPA version detected: ${oldVersion} → ${newVersion}`);

  const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
  if (alreadyReloaded === newVersion) {
    console.warn('Version still inconsistent after reload. Skipping another reload.');
    return;
  }

  sessionStorage.setItem(RELOAD_KEY, newVersion);
  localStorage.setItem(STORAGE_KEY, newVersion);

  await clearApplicationCaches();
  window.location.reload();
}

async function clearApplicationCaches(): Promise<void> {
  if (!('caches' in window)) return;
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  } catch (error) {
    console.warn('Failed to clear Cache Storage:', error);
  }
}
