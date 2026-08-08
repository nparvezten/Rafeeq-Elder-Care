export interface PushSubscriptionModel {
  id?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  created_at?: string;
  created_by?: string;
}
