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

  const privateSession = writable<boolean>(initialPrivate);
  const audioQuality = writable<string>(initialQuality);
  const crossfade = writable<number>(initialCrossfade);
  const normalizeVolume = writable<boolean>(initialNormalize);
  const slicedWavesEnabled = writable<boolean>(initialWaves);
  const activeDevice = writable<DeviceInfo>(availableDevices[0]);
  const devicesList = writable<DeviceInfo[]>(availableDevices);

  return {
    privateSession,
    audioQuality,
    crossfade,
    normalizeVolume,
    slicedWavesEnabled,
    activeDevice,
    devicesList,

    togglePrivateSession() {
      privateSession.update(v => {
        const next = !v;
        if (browser) {
          sessionStorage.setItem('diverge_private_session', String(next));
        }
        return next;
      });
    },

    setAudioQuality(quality: string) {
      audioQuality.set(quality);
      if (browser) localStorage.setItem('diverge_audio_quality', quality);
    },

    setCrossfade(seconds: number) {
      crossfade.set(seconds);
      if (browser) localStorage.setItem('diverge_crossfade', String(seconds));
    },

    setNormalize(val: boolean) {
      normalizeVolume.set(val);
      if (browser) localStorage.setItem('diverge_normalize', String(val));
    },

    setSlicedWaves(val: boolean) {
      slicedWavesEnabled.set(val);
      if (browser) localStorage.setItem('diverge_sliced_waves', String(val));
    },

    selectDevice(deviceId: string) {
      devicesList.update(list =>
        list.map(d => ({ ...d, active: d.id === deviceId }))
      );
      const found = get(devicesList).find(d => d.id === deviceId);
      if (found) {
        activeDevice.set(found);
      }
    }
  };
}

export const preferences = createPreferencesStore();
