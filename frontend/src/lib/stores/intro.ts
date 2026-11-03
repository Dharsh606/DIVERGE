import { writable } from 'svelte/store';

function createIntroStore() {
  const { subscribe, set } = writable(false);

  return {
    subscribe,
    play() {
      set(true);
    },
    dismiss() {
      set(false);
    }
  };
}

export const introStore = createIntroStore();
