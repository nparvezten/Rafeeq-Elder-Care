import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client: SupabaseClient | null = null;

  readonly currentUser = signal<User | null>(null);
  readonly session = signal<Session | null>(null);
  readonly isConfigured = signal<boolean>(false);

  constructor() {
    const isPlaceholder = 
      !environment.supabaseUrl || 
      environment.supabaseUrl.includes('YOUR_SUPABASE_URL') || 
      !environment.supabaseAnonKey || 
      environment.supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

    if (!isPlaceholder) {
      try {
        this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
        this.isConfigured.set(true);

        this.client.auth.getSession().then(({ data: { session } }) => {
          this.session.set(session);
          this.currentUser.set(session?.user ?? null);
        });

        this.client.auth.onAuthStateChange((_event, session) => {
          this.session.set(session);
          this.currentUser.set(session?.user ?? null);
        });
      } catch (err) {
        console.warn('Supabase initialization warning:', err);
      }
    }
  }

  get supabase(): SupabaseClient | null {
    return this.client;
  }

  async signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
    if (!this.client) {
      // Demo fallback mode for local testing without real keys
      const mockUser: Partial<User> = {
        id: 'demo-user-id',
        email: email,
        user_metadata: { name: email.split('@')[0] }
      };
      this.currentUser.set(mockUser as User);
      return { error: null };
    }

    try {
      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    if (!this.client) {
      this.currentUser.set(null);
      this.session.set(null);
      return { error: null };
    }
    const { error } = await this.client.auth.signOut();
    if (!error) {
      this.currentUser.set(null);
      this.session.set(null);
    }
    return { error: error as Error | null };
  }
}
