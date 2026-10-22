// DIVERGE — Preferences & Device Management Store
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'browser' | 'cast' | 'airplay' | 'bluetooth';
  quality: string;
  active: boolean;
}

export interface PreferencesState {
  privateSession: boolean;
  audioQuality: string;
  crossfade: number;
  normalizeVolume: boolean;
  slicedWavesEnabled: boolean;
  activeDevice: DeviceInfo;
  devicesList: DeviceInfo[];
}

export const availableDevices: DeviceInfo[] = [
  { id: 'browser', name: 'Web Browser (This Device)', type: 'browser', quality: 'Lossless 24-bit / 96kHz Direct', active: true },
  { id: 'cast', name: 'DIVERGE Studio Cast', type: 'cast', quality: 'Lossless Network Stream (FLAC)', active: false },
  { id: 'airplay', name: 'Living Room Hi-Fi (DLNA/AirPlay)', type: 'airplay', quality: '320 kbps Studio AAC', active: false },
  { id: 'bluetooth', name: 'Studio Reference Headphones', type: 'bluetooth', quality: 'aptX HD / LDAC Lossless', active: false },
];

function createPreferencesStore() {
  const initialPrivate = browser ? sessionStorage.getItem('diverge_private_session') === 'true' : false;
  const initialQuality = (browser && localStorage.getItem('diverge_audio_quality')) || 'lossless_24bit';
  const initialCrossfade = (browser && Number(localStorage.getItem('diverge_crossfade'))) || 3;
  const initialNormalize = browser ? localStorage.getItem('diverge_normalize') !== 'false' : true;
  const initialWaves = browser ? localStorage.getItem('diverge_sliced_waves') !== 'false' : true;

  const { subscribe, set, update } = writable<PreferencesState>({
    privateSession: initialPrivate,
    audioQuality: initialQuality,
    crossfade: initialCrossfade,
    normalizeVolume: initialNormalize,
    slicedWavesEnabled: initialWaves,
    activeDevice: availableDevices[0],
    devicesList: availableDevices,
  });

  return {
    subscribe,
    set,
    update,

    togglePrivateSession() {
      update(s => {
        const next = !s.privateSession;
        if (browser) {
          sessionStorage.setItem('diverge_private_session', String(next));
        }
        return { ...s, privateSession: next };
      });
    },

    setAudioQuality(quality: string) {
      if (browser) localStorage.setItem('diverge_audio_quality', quality);
      update(s => ({ ...s, audioQuality: quality }));
    },

    setCrossfade(seconds: number) {
      if (browser) localStorage.setItem('diverge_crossfade', String(seconds));
      update(s => ({ ...s, crossfade: seconds }));
    },

    setNormalize(val: boolean) {
      if (browser) localStorage.setItem('diverge_normalize', String(val));
      update(s => ({ ...s, normalizeVolume: val }));
    },

    setSlicedWaves(val: boolean) {
      if (browser) localStorage.setItem('diverge_sliced_waves', String(val));
      update(s => ({ ...s, slicedWavesEnabled: val }));
    },

    selectDevice(deviceId: string) {
      update(s => {
        const nextList = s.devicesList.map(d => ({ ...d, active: d.id === deviceId }));
        const found = nextList.find(d => d.id === deviceId) || s.activeDevice;
        return { ...s, devicesList: nextList, activeDevice: found };
      });
    }
  };
}

export const preferences = createPreferencesStore();
