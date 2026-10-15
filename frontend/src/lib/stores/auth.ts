// DIVERGE — Auth Store
import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';
import { auth as authAPI } from '$lib/services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: false,
    initialized: false,
  });

  return {
    subscribe,

    async init() {
      update(s => ({ ...s, loading: true }));
      try {
        const user = await authAPI.me() as User;
        set({ user, loading: false, initialized: true });
      } catch {
        set({ user: null, loading: false, initialized: true });
      }
    },

    async login(email: string, password: string) {
      update(s => ({ ...s, loading: true }));
      const res = await authAPI.login(email, password) as { user: User };
      set({ user: res.user, loading: false, initialized: true });
      return res.user;
    },

    async register(username: string, email: string, password: string) {
      update(s => ({ ...s, loading: true }));
      const res = await authAPI.register(username, email, password) as { user: User };
      set({ user: res.user, loading: false, initialized: true });
      return res.user;
    },

    async logout() {
      await authAPI.logout();
      set({ user: null, loading: false, initialized: true });
    },
  };
}

export const authStore = createAuthStore();
export const isLoggedIn = derived(authStore, $a => !!$a.user);
export const currentUser = derived(authStore, $a => $a.user);
