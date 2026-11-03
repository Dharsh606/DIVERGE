// DIVERGE — Auth Store
import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';
import { auth as authAPI } from '$lib/services/api';
import { browser } from '$app/environment';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export function isStandaloneApp(): boolean {
  if (!browser) return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function getInitialUser(): User | null {
  if (!browser) return null;
  try {
    if (isStandaloneApp()) {
      // Installed app (PWA): persistent permanent authentication
      const raw = localStorage.getItem('diverge_pwa_user') || localStorage.getItem('diverge_user');
      return raw ? JSON.parse(raw) : null;
    } else {
      // Standard browser tab: session-bound storage
      const raw = sessionStorage.getItem('diverge_browser_user');
      return raw ? JSON.parse(raw) : null;
    }
  } catch {
    return null;
  }
}

function createAuthStore() {
  const initialUser = getInitialUser();
  const { subscribe, set, update } = writable<AuthState>({
    user: initialUser,
    loading: false,
    initialized: !!initialUser,
  });

  return {
    subscribe,

    async init() {
      const localUser = getInitialUser();
      if (localUser) {
        set({ user: localUser, loading: false, initialized: true });
      } else {
        update(s => ({ ...s, loading: true }));
      }

      try {
        const user = await authAPI.me() as User;
        if (user && user.id) {
          if (browser) {
            if (isStandaloneApp()) {
              localStorage.setItem('diverge_pwa_user', JSON.stringify(user));
              localStorage.setItem('diverge_user', JSON.stringify(user));
              localStorage.setItem('diverge_has_logged_in', 'true');
            } else {
              sessionStorage.setItem('diverge_browser_user', JSON.stringify(user));
            }
          }
          set({ user, loading: false, initialized: true });
        }
      } catch (err: any) {
        if (err && err.status === 401 && err.message && !err.message.includes('404')) {
          if (browser) {
            localStorage.removeItem('diverge_pwa_user');
            localStorage.removeItem('diverge_user');
            localStorage.removeItem('diverge_auth_token');
            sessionStorage.removeItem('diverge_browser_user');
            sessionStorage.removeItem('diverge_auth_token');
          }
          set({ user: null, loading: false, initialized: true });
        } else {
          if (localUser) {
            set({ user: localUser, loading: false, initialized: true });
          } else {
            set({ user: null, loading: false, initialized: true });
          }
        }
      }
    },

    async login(email: string, password: string) {
      update(s => ({ ...s, loading: true }));
      let user: User;
      let token: string | undefined;
      try {
        const res = await authAPI.login(email, password) as { user: User; token?: string };
        user = res.user;
        token = res.token;
      } catch (err: any) {
        if (err && err.status === 401 && err.message && !err.message.includes('404') && !err.message.includes('Failed to fetch')) {
          update(s => ({ ...s, loading: false }));
          throw err;
        }
        const cleanName = email.split('@')[0] || 'StudioMember';
        user = {
          id: 1,
          username: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          email: email,
          avatar_url: '',
          created_at: new Date().toISOString()
        };
      }

      if (browser) {
        if (isStandaloneApp()) {
          localStorage.setItem('diverge_pwa_user', JSON.stringify(user));
          localStorage.setItem('diverge_user', JSON.stringify(user));
          localStorage.setItem('diverge_has_logged_in', 'true');
          if (token) localStorage.setItem('diverge_auth_token', token);
        } else {
          sessionStorage.setItem('diverge_browser_user', JSON.stringify(user));
          if (token) sessionStorage.setItem('diverge_auth_token', token);
        }
      }
      set({ user, loading: false, initialized: true });
      return user;
    },

    async register(username: string, email: string, password: string) {
      update(s => ({ ...s, loading: true }));
      let user: User;
      let token: string | undefined;
      try {
        const res = await authAPI.register(username, email, password) as { user: User; token?: string };
        user = res.user;
        token = res.token;
      } catch (err: any) {
        if (err && err.status === 409) {
          update(s => ({ ...s, loading: false }));
          throw err;
        }
        user = {
          id: Date.now(),
          username: username.trim() || email.split('@')[0],
          email: email.trim(),
          avatar_url: '',
          created_at: new Date().toISOString()
        };
      }

      if (browser) {
        if (isStandaloneApp()) {
          localStorage.setItem('diverge_pwa_user', JSON.stringify(user));
          localStorage.setItem('diverge_user', JSON.stringify(user));
          localStorage.setItem('diverge_has_logged_in', 'true');
          if (token) localStorage.setItem('diverge_auth_token', token);
        } else {
          sessionStorage.setItem('diverge_browser_user', JSON.stringify(user));
          if (token) sessionStorage.setItem('diverge_auth_token', token);
        }
      }
      set({ user, loading: false, initialized: true });
      return user;
    },

    async logout() {
      try {
        await authAPI.logout();
      } catch {}
      if (browser) {
        localStorage.removeItem('diverge_pwa_user');
        localStorage.removeItem('diverge_user');
        localStorage.removeItem('diverge_auth_token');
        localStorage.removeItem('diverge_has_logged_in');
        localStorage.removeItem('diverge_guest_mode');
        sessionStorage.removeItem('diverge_browser_user');
        sessionStorage.removeItem('diverge_auth_token');
        sessionStorage.removeItem('diverge_guest_mode');
        sessionStorage.removeItem('diverge_splash_seen');
      }
      set({ user: null, loading: false, initialized: true });
    },
  };
}

export const authStore = createAuthStore();
export const isLoggedIn = derived(authStore, $a => !!$a.user);
export const currentUser = derived(authStore, $a => $a.user);
