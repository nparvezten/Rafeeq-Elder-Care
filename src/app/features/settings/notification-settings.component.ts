import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-6">
      
      <!-- Section Header -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header">Notification & Care Reminders</h1>
        <p class="text-ink/80 text-base mt-1">
          Receive gentle push reminders for daily care duties and family reflections.
        </p>
      </div>

      <!-- Settings Card -->
      <div class="journal-card p-6 sm:p-8 bg-canvas/90">
        <div class="flex items-start justify-between gap-4 pb-6 border-b border-ink/10">
          <div>
            <h2 class="text-xl font-bold text-ink font-serif-header flex items-center gap-2">
              <svg class="w-5 h-5 text-companion" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              Daily Care Reminders
            </h2>
            <p class="text-sm text-ink/80 mt-1 max-w-md">
              Enable browser Web Push notifications to receive reminders for scheduled respite shifts and reflection prompts.
            </p>
          </div>

          <!-- Enable / Disable Toggle Button -->
          <div class="flex flex-col items-end">
            @if (isSubscribed()) {
              <button 
                (click)="disableReminders()"
                [disabled]="isProcessing()"
                class="tap-target px-4 py-2 bg-hearth/30 text-ink border border-hearth/50 rounded-xl text-sm font-bold hover:bg-hearth/40 transition-colors"
              >
                {{ isProcessing() ? 'Updating...' : 'Enabled ✓' }}
              </button>
            } @else {
              <button 
                (click)="enableReminders()"
                [disabled]="isProcessing() || !isSupported()"
                class="tap-target px-5 py-2.5 bg-companion text-canvas rounded-xl text-sm font-bold hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
              >
                {{ isProcessing() ? 'Requesting...' : 'Enable Reminders' }}
              </button>
            }
          </div>
        </div>

        @if (statusMessage()) {
          <div class="mt-4 p-3 rounded-xl text-sm"
               [ngClass]="{
                 'bg-hearth/20 border border-hearth/40 text-ink': isSubscribed(),
                 'bg-tender/20 border border-tender/40 text-ink': !isSubscribed()
               }">
            {{ statusMessage() }}
          </div>
        }

        <!-- Status Summary -->
        <div class="pt-6 space-y-2 text-sm text-ink/80">
          <div class="flex items-center justify-between">
            <span>Browser Web Push Support:</span>
            <strong class="text-ink">{{ isSupported() ? 'Supported' : 'Not Supported' }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span>Permission Status:</span>
            <strong class="text-ink capitalize">{{ permissionStatus() }}</strong>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationSettingsComponent {
  private notificationService = inject(NotificationService);

  readonly isSupported = this.notificationService.isSupported;
  readonly permissionStatus = this.notificationService.permissionStatus;
  readonly isSubscribed = this.notificationService.isSubscribed;
  readonly isProcessing = this.notificationService.isProcessing;

  statusMessage = signal<string | null>(null);

  async enableReminders() {
    this.statusMessage.set(null);
    const res = await this.notificationService.requestPermissionAndSubscribe();

    if (res.success) {
      this.statusMessage.set('Daily care reminders enabled successfully.');
    } else {
      this.statusMessage.set(res.error || 'Failed to enable notification permission.');
    }
  }

  async disableReminders() {
    this.statusMessage.set(null);
    await this.notificationService.disableNotifications();
    this.statusMessage.set('Daily care reminders turned off.');
  }
}
