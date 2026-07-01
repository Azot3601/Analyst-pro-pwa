import { useAppStore } from '../../app/store';

// «Тихий архив»: мягкие звуковые cue через Web Audio API (синтез, без ассетов —
// офлайн-safe для PWA). Синусоиды/треугольники, короткая атака, тихий уровень.
// Глобальный mute и громкость берутся из стора настроек.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

type Note = { freq: number; start: number; dur: number; type?: OscillatorType; gain?: number };

function play(notes: Note[]) {
  const state = useAppStore.getState();
  const master = state.soundEnabled ? state.volume : 0;
  if (master <= 0) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  for (const note of notes) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = note.type ?? 'sine';
    osc.frequency.value = note.freq;
    const peak = Math.max(0.0001, (note.gain ?? 0.12) * master);
    const t0 = now + note.start;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + note.dur + 0.03);
  }
}

// Мягкий «тик» — лист перевернулся.
export const playClick = () => play([{ freq: 660, start: 0, dur: 0.06, type: 'triangle', gain: 0.05 }]);

// Любопытное «хм?» — поднимающаяся терция, приглашает подумать.
export const playHint = () => play([
  { freq: 659.25, start: 0, dur: 0.16 },
  { freq: 830.61, start: 0.07, dur: 0.18 }
]);

// Тёплое разрешение — мажорное трезвучие вверх.
export const playSuccess = () => play([
  { freq: 523.25, start: 0, dur: 0.18 },
  { freq: 659.25, start: 0.09, dur: 0.2 },
  { freq: 783.99, start: 0.18, dur: 0.26 }
]);

// Доброе «не совсем» — мягкая нисходящая секунда, без резкого баззера.
export const playError = () => play([
  { freq: 392.0, start: 0, dur: 0.18, gain: 0.08 },
  { freq: 369.99, start: 0.06, dur: 0.2, gain: 0.08 }
]);

// Празднование — редкое, полнее и теплее, для ранга/главы.
export const playLevelUp = () => play([
  { freq: 523.25, start: 0, dur: 0.22 },
  { freq: 659.25, start: 0.1, dur: 0.24 },
  { freq: 783.99, start: 0.2, dur: 0.26 },
  { freq: 1046.5, start: 0.32, dur: 0.36 },
  { freq: 523.25, start: 0.32, dur: 0.36, gain: 0.05 }
]);
