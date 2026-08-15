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
          <div class="flex flex-col items-end gap-2">
            @if (isSubscribed()) {
              <button 
                (click)="disableNotifications()"
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

        <div class="mt-4 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <button 
            (click)="sendTest()" 
            [disabled]="!isSubscribed()"
            class="tap-target px-4 py-2 bg-canvas border border-ink/20 text-ink rounded-xl text-xs sm:text-sm font-semibold hover:bg-ink/5 transition-colors disabled:opacity-50"
          >
            🔔 Send Test Notification
          </button>

          <button 
            (click)="triggerCloudReminder()" 
            [disabled]="isSendingCloud()"
            class="tap-target px-4 py-2 bg-companion text-canvas rounded-xl text-xs sm:text-sm font-semibold hover:bg-companion/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {{ isSendingCloud() ? 'Sending...' : '🚀 Broadcast Reminder to Family' }}
          </button>
        </div>

        <!-- iOS Safari Notice Box -->
        @if (isIOS() && !isStandalone()) {
          <div class="mt-4 p-4 bg-warmth/15 border border-warmth/30 rounded-xl text-sm text-ink/90 leading-relaxed">
            <strong class="font-semibold block mb-1">📱 iOS Safari Note:</strong>
            Apple iOS requires web applications to be added to your Home Screen before enabling push notifications. 
            Tap the <strong>Share ⎋</strong> button in Safari, choose <strong>"Add to Home Screen"</strong>, then open Rafeeq Care from your Home Screen.
          </div>
        }

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
  readonly isIOS = this.notificationService.isIOS;
  readonly isStandalone = this.notificationService.isStandalone;

  statusMessage = signal<string | null>(null);
  isSendingCloud = signal<boolean>(false);

  async enableReminders() {
    this.statusMessage.set(null);
    const res = await this.notificationService.requestPermissionAndSubscribe();

    if (res.success) {
      this.statusMessage.set('Daily care reminders enabled successfully on this browser!');
    } else {
      this.statusMessage.set(res.error || 'Failed to enable notification permission.');
    }
  }

  async sendTest() {
    this.statusMessage.set(null);
    const res = await this.notificationService.sendTestNotification();
    if (res.success) {
      this.statusMessage.set('Test notification sent to your device screen!');
    } else {
      this.statusMessage.set(res.error || 'Unable to display test notification.');
    }
  }

  async triggerCloudReminder() {
    this.statusMessage.set(null);
    this.isSendingCloud.set(true);
    const res = await this.notificationService.triggerCloudReminder();
    this.isSendingCloud.set(false);

    if (res.success) {
      this.statusMessage.set(`Cloud push notification sent to ${res.sentCount || 0} family device subscription(s)!`);
    } else {
      this.statusMessage.set(res.error || 'Unable to trigger cloud reminders.');
    }
  }

  async disableNotifications() {
    this.statusMessage.set(null);
    await this.notificationService.disableNotifications();
    this.statusMessage.set('Daily care reminders turned off.');
  }
}
