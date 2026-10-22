import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createGuestStore() {
  const initial = browser
    ? localStorage.getItem('diverge_guest_mode') === 'true' ||
      sessionStorage.getItem('diverge_guest_mode') === 'true'
    : false;
  const { subscribe, set } = writable<boolean>(initial);

  return {
    subscribe,
    enableGuest() {
      if (browser) {
        localStorage.setItem('diverge_guest_mode', 'true');
        localStorage.setItem('diverge_splash_seen', 'true');
        sessionStorage.setItem('diverge_splash_seen', 'true');
      }
      set(true);
    },
    disableGuest() {
      if (browser) {
        localStorage.removeItem('diverge_guest_mode');
        sessionStorage.removeItem('diverge_guest_mode');
      }
      set(false);
    }
  };
}

export const guestStore = createGuestStore();
