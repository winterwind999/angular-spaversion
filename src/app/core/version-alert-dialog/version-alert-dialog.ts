import { Component, computed, inject } from '@angular/core';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { VersionPromptService } from '../../services/version-prompt.service';

@Component({
  selector: 'app-version-alert-dialog',
  imports: [HlmAlertDialogImports],
  templateUrl: './version-alert-dialog.html',
  styleUrl: './version-alert-dialog.css',
})
export class VersionAlertDialog {
  private readonly promptService = inject(VersionPromptService);

  protected readonly state = computed(() => (this.promptService.open() ? 'open' : 'closed'));

  onStateChanged(state: 'open' | 'closed'): void {
    // Handles Esc / overlay click — anything that isn't an explicit Yes click counts as "No".
    if (state === 'closed') {
      this.promptService.respond(false);
    }
  }

  onConfirm(): void {
    this.promptService.respond(true);
  }

  onCancel(): void {
    this.promptService.respond(false);
  }
}
