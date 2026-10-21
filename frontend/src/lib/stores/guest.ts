import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createGuestStore() {
  const initial = browser ? sessionStorage.getItem('diverge_guest_mode') === 'true' : false;
  const { subscribe, set } = writable<boolean>(initial);

  return {
    subscribe,
    enableGuest() {
      if (browser) sessionStorage.setItem('diverge_guest_mode', 'true');
      set(true);
    },
    disableGuest() {
      if (browser) sessionStorage.removeItem('diverge_guest_mode');
      set(false);
    }
  };
}

export const guestStore = createGuestStore();
