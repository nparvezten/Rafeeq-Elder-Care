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
          this.isSubscribed.set(!!sub);
        }
      } catch (err) {
        console.warn('Error checking push subscription:', err);
      }
    }
  }

  async requestPermissionAndSubscribe(): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Web Push Notifications are not supported in this browser.' };
    }

    this.isProcessing.set(true);

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus.set(permission);

      if (permission !== 'granted') {
        this.isProcessing.set(false);
        return { success: false, error: 'Notification permission was denied.' };
      }

      // Register or get active service worker from public/sw.js
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        try {
          reg = await navigator.serviceWorker.register('sw.js');
        } catch (swErr) {
          console.warn('Relative SW registration failed, trying root sw.js:', swErr);
          reg = await navigator.serviceWorker.register('/sw.js');
        }
      }

      const vapidKey = (environment as any).vapidPublicKey || 'BKmz37yWSnMjm1vvJpRRnAKPvv3T48vZPOk23kgZqymlTDwM8RTEqoo6JCDEpdE8NYRKs01HIEwo5_DEYlssTls';
      let sub: PushSubscription | null = null;

      if (reg) {
        sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
          }).catch((subErr) => {
            console.warn('PushManager subscribe warning:', subErr);
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
