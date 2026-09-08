import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VersionPromptService {
  readonly open = signal(false);
  private resolver: ((confirmed: boolean) => void) | null = null;

  /** Opens the dialog and resolves once the user answers. */
  confirmRefresh(): Promise<boolean> {
    this.open.set(true);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  respond(confirmed: boolean): void {
    this.open.set(false);
    this.resolver?.(confirmed);
    this.resolver = null;
  }
}
