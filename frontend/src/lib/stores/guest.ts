import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function getInitialGuestState(): boolean {
  if (!browser) return true;
  try {
    const explicitlyDisabled = localStorage.getItem('diverge_guest_mode') === 'false';
    return !explicitlyDisabled;
  } catch {
    return true;
  }
}

function createGuestStore() {
  const { subscribe, set } = writable<boolean>(getInitialGuestState());

  return {
    subscribe,
    enableGuest() {
      if (browser) {
        try {
          localStorage.setItem('diverge_guest_mode', 'true');
          localStorage.setItem('diverge_splash_seen', 'true');
          sessionStorage.setItem('diverge_splash_seen', 'true');
        } catch {}
      }
      set(true);
    },
    disableGuest() {
      if (browser) {
        try {
          localStorage.setItem('diverge_guest_mode', 'false');
          sessionStorage.removeItem('diverge_guest_mode');
        } catch {}
      }
      set(false);
    }
  };
}

export const guestStore = createGuestStore();
