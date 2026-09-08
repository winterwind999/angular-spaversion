import { Injector } from '@angular/core';
import { VersionPromptService } from '../services/version-prompt.service';
import { APP_VERSION } from './version';

const STORAGE_KEY = 'app-version';
const RELOAD_KEY = 'app-version-reload';

const SNOOZE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

let appInjector: Injector | null = null;

// Tracks when we're allowed to prompt again, per pending version.
let snoozedVersion: string | null = null;
let snoozedUntil = 0;

export function setAppInjector(injector: Injector): void {
  appInjector = injector;
}

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

  // No UI exists yet at this point — refresh silently.
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

    if (!latest || latest === APP_VERSION) return;

    if (isSnoozed(latest)) {
      const remainingMs = snoozedUntil - Date.now();
      console.log(
        `[spa-version] snoozed for another ${Math.ceil(remainingMs / 1000)}s, skipping prompt.`,
      );
      return;
    }

    const confirmed = await promptUserToRefresh();

    if (!confirmed) {
      snoozeVersion(latest);
      console.info(`[spa-version] user declined refresh — will re-prompt in 10 minutes.`);
      return;
    }

    clearSnooze();
    await forceRefresh(APP_VERSION, latest);
  } catch (error) {
    console.warn('[spa-version] poll error:', error);
  }
}

function isSnoozed(version: string): boolean {
  return snoozedVersion === version && Date.now() < snoozedUntil;
}

function snoozeVersion(version: string): void {
  snoozedVersion = version;
  snoozedUntil = Date.now() + SNOOZE_DURATION_MS;
}

function clearSnooze(): void {
  snoozedVersion = null;
  snoozedUntil = 0;
}

async function promptUserToRefresh(): Promise<boolean> {
  if (!appInjector) {
    // Injector not registered yet — fall back to auto-refresh rather than losing the update.
    return true;
  }

  const promptService = appInjector.get(VersionPromptService);
  return promptService.confirmRefresh();
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
