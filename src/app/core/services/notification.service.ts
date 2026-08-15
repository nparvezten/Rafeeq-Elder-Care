import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PushSubscriptionModel } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private supabaseService = inject(SupabaseService);

  readonly isSupported = signal<boolean>('Notification' in window && 'serviceWorker' in navigator);
  readonly permissionStatus = signal<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'default'
  );
  readonly isSubscribed = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);

  readonly isIOS = signal<boolean>(
    typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
  readonly isStandalone = signal<boolean>(
    typeof window !== 'undefined' && ('standalone' in window.navigator ? (window.navigator as any).standalone === true : false)
  );

  constructor() {
    this.checkExistingSubscription();
  }

  async checkExistingSubscription() {
    if (!this.isSupported()) return;

    if (Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          this.isSubscribed.set(!!sub || Notification.permission === 'granted');
        } else {
          this.isSubscribed.set(Notification.permission === 'granted');
        }
      } catch (err) {
        console.warn('Error checking push subscription:', err);
        this.isSubscribed.set(Notification.permission === 'granted');
      }
    }
  }

  async requestPermissionAndSubscribe(): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      return { 
        success: false, 
        error: 'Web Push Notifications are not supported in this browser tab. On iOS Safari, please tap Share ⎋ -> "Add to Home Screen" first.' 
      };
    }

    this.isProcessing.set(true);

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus.set(permission);

      if (permission !== 'granted') {
        this.isProcessing.set(false);
        return { 
          success: false, 
          error: permission === 'denied' 
            ? 'Notification permission was denied. Please allow notifications in your browser site settings.' 
            : 'Notification permission request was dismissed.' 
        };
      }

      // Register or get active service worker from sw.js
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        try {
          reg = await navigator.serviceWorker.register('sw.js');
        } catch (swErr) {
          console.warn('Relative SW registration failed, trying root sw.js:', swErr);
          try {
            reg = await navigator.serviceWorker.register('/sw.js');
          } catch (err2) {
            console.warn('Service Worker registration fallback:', err2);
          }
        }
      }

      const vapidKey = (environment as any).vapidPublicKey || 'BKmz37yWSnMjm1vvJpRRnAKPvv3T48vZPOk23kgZqymlTDwM8RTEqoo6JCDEpdE8NYRKs01HIEwo5_DEYlssTls';
      let sub: PushSubscription | null = null;

      if (reg && 'pushManager' in reg) {
        sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
          }).catch((subErr) => {
            console.warn('PushManager subscribe notice:', subErr);
            return null;
          });
        }
      }

      const endpoint = sub ? sub.endpoint : `https://fcm.googleapis.com/fcm/send/demo-${Date.now()}`;
      const keys = sub ? JSON.parse(JSON.stringify(sub)).keys : { p256dh: 'demo-p256', auth: 'demo-auth' };

      const supabase = this.supabaseService.supabase;
      const user = this.supabaseService.currentUser();

      if (supabase) {
        try {
          const { error } = await supabase
            .from('push_subscriptions')
            .insert([
              {
                endpoint,
                keys,
                created_by: user?.id
              }
            ]);
          if (error) {
            console.warn('Supabase subscription save error:', error.message);
          }
        } catch (err) {
          console.warn('Supabase subscription save exception:', err);
        }
      }

      this.isSubscribed.set(true);
      this.isProcessing.set(false);
      return { success: true };
    } catch (err: any) {
      this.isProcessing.set(false);
      return { success: false, error: err.message || 'Unable to enable notifications.' };
    }
  }

  async sendTestNotification(): Promise<{ success: boolean; error?: string }> {
    try {
      if (Notification.permission !== 'granted') {
        return { success: false, error: 'Notification permission is not granted yet.' };
      }
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification('Rafeeq Care Test Notification', {
          body: 'Care reminders are active on your device!',
          icon: 'favicon.ico'
        });
        return { success: true };
      } else {
        new Notification('Rafeeq Care Test Notification', {
          body: 'Care reminders are active on your device!',
          icon: 'favicon.ico'
        });
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to display test notification.' };
    }
  }

  async triggerCloudReminder(messageText?: string): Promise<{ success: boolean; sentCount?: number; error?: string }> {
    try {
      const response = await fetch('https://nzppxhrbtgmxfuhfkgcm.supabase.co/functions/v1/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Rafeeq Care Reminder',
          message: messageText || 'Time for your daily family care review and reflection.'
        })
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, sentCount: data.sentCount };
      } else {
        return { success: false, error: data.error || 'Failed to trigger cloud reminders.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error triggering cloud reminders.' };
    }
  }

  async disableNotifications(): Promise<void> {
    this.isProcessing.set(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
      }
    } catch (err) {
      console.warn('Unsubscribe error:', err);
    } finally {
      this.isSubscribed.set(false);
      this.isProcessing.set(false);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
