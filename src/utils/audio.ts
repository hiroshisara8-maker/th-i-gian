import { ChimeSoundType } from '../types';

// Shared AudioContext instance
let sharedAudioCtx: AudioContext | null = null;
let audioUnlocked = false;

/**
 * Gets or creates the shared AudioContext
 */
export function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    console.warn('AudioContext creation failed:', e);
    return null;
  }
}

/**
 * Checks if audio has been unlocked by user gesture
 */
export function isAudioUnlocked(): boolean {
  return audioUnlocked;
}

/**
 * Unlocks the Web Audio context via a user gesture (click, touch, etc.)
 */
export async function unlockAudio(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Play a tiny silent buffer to warm up audio pipeline
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    audioUnlocked = true;
    return true;
  } catch (err) {
    console.warn('Could not unlock audio context:', err);
    return false;
  }
}

// Global listener to unlock audio on first user gesture anywhere
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown'];
  const handleInitialUserGesture = () => {
    unlockAudio().then(() => {
      unlockEvents.forEach((evt) => window.removeEventListener(evt, handleInitialUserGesture));
    });
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, handleInitialUserGesture, { passive: true }));
}

/**
 * Synthesizes a crisp, audible chime with warm harmonic overtones and master compression
 */
export function playSoftChime(soundType: ChimeSoundType = 'bell', volume: number = 0.8): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Trigger device vibration if supported (especially helpful when user is on another app on phone)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([250, 100, 250]);
        } catch {
          // ignore if vibration denied
        }
      }

      const ctx = getAudioContext();
      if (!ctx) {
        resolve(false);
        return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Ensure volume is well audible: min 0.2, max 1.0
      const vol = Math.max(0.15, Math.min(volume, 1.0));

      // Master gain node & dynamics compressor to prevent clipping while maximizing audibility
      const masterGain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, now);
      compressor.knee.setValueAtTime(10, now);
      compressor.ratio.setValueAtTime(4, now);
      compressor.attack.setValueAtTime(0.003, now);
      compressor.release.setValueAtTime(0.25, now);

      masterGain.gain.setValueAtTime(vol * 0.85, now);
      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      let totalDuration = 1.0;

      if (soundType === 'school') {
        // School chime (Westminster-style 4 notes: Sol - Do - Re - Sol cao, 392 -> 523 -> 587 -> 784)
        const notes = [
          { freq: 392.00, start: 0, dur: 0.38 },      // G4
          { freq: 523.25, start: 0.32, dur: 0.42 },   // C5
          { freq: 587.33, start: 0.68, dur: 0.42 },   // D5
          { freq: 783.99, start: 1.05, dur: 0.95 },   // G5
        ];
        totalDuration = 2.1;

        notes.forEach(({ freq, start, dur }) => {
          // Primary bell tone
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(freq, now + start);

          // Second harmonic for crisp presence
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq * 2, now + start);

          gain1.gain.setValueAtTime(0.001, now + start);
          gain1.gain.linearRampToValueAtTime(0.65, now + start + 0.03);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          gain2.gain.setValueAtTime(0.001, now + start);
          gain2.gain.linearRampToValueAtTime(0.35, now + start + 0.02);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + start + dur * 0.8);

          osc1.connect(gain1);
          osc2.connect(gain2);
          gain1.connect(masterGain);
          gain2.connect(masterGain);

          osc1.start(now + start);
          osc2.start(now + start);
          osc1.stop(now + start + dur + 0.05);
          osc2.stop(now + start + dur + 0.05);
        });

      } else if (soundType === 'bell') {
        // Bright 3-note bell arpeggio (C5 - E5 - G5 - C6), clear, crisp, very audible
        const notes = [
          { freq: 523.25, start: 0, dur: 0.5 },     // C5
          { freq: 659.25, start: 0.18, dur: 0.5 },  // E5
          { freq: 783.99, start: 0.36, dur: 0.6 },  // G5
          { freq: 1046.50, start: 0.54, dur: 1.1 }, // C6
        ];
        totalDuration = 1.8;

        notes.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const oscHarmonic = ctx.createOscillator();
          const noteGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          oscHarmonic.type = 'triangle';
          oscHarmonic.frequency.setValueAtTime(freq * 1.5, now + start);

          noteGain.gain.setValueAtTime(0.001, now + start);
          noteGain.gain.linearRampToValueAtTime(0.7, now + start + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(noteGain);
          oscHarmonic.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(now + start);
          oscHarmonic.start(now + start);
          osc.stop(now + start + dur + 0.05);
          oscHarmonic.stop(now + start + dur + 0.05);
        });

      } else if (soundType === 'marimba') {
        // Warm wooden strike (Marimba A4 - C#5 - E5 - A5)
        const notes = [
          { freq: 440.00, start: 0, dur: 0.32 },
          { freq: 554.37, start: 0.12, dur: 0.35 },
          { freq: 659.25, start: 0.24, dur: 0.4 },
          { freq: 880.00, start: 0.36, dur: 0.75 },
        ];
        totalDuration = 1.3;

        notes.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(0.85, now + start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + start);
          osc.stop(now + start + dur + 0.03);
        });

      } else {
        // 'gentle' harmonic chord (D5 -> F#5 -> A5)
        const notes = [
          { freq: 587.33, start: 0, dur: 0.7 },      // D5
          { freq: 739.99, start: 0.12, dur: 0.8 },   // F#5
          { freq: 880.00, start: 0.24, dur: 1.2 },   // A5
        ];
        totalDuration = 1.6;

        notes.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(0.68, now + start + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + start);
          osc.stop(now + start + dur + 0.05);
        });
      }

      audioUnlocked = true;
      setTimeout(() => resolve(true), totalDuration * 1000);
    } catch (err) {
      console.warn('Audio chime could not be played:', err);
      resolve(false);
    }
  });
}

// Active Ringing Controller
let activeRingingTimer: number | null = null;
let activeCountdownTimer: number | null = null;
let activeStopTimeout: number | null = null;
let currentlyRinging = false;
let onRingingStopCallback: (() => void) | null = null;
let onTickCallback: ((remainingSec: number) => void) | null = null;

/**
 * Checks whether the alarm chime is currently actively ringing
 */
export function isCurrentlyRinging(): boolean {
  return currentlyRinging;
}

/**
 * Stops any actively ringing chime sequence immediately
 */
export function stopRinging(): void {
  if (activeRingingTimer !== null) {
    clearInterval(activeRingingTimer);
    activeRingingTimer = null;
  }
  if (activeCountdownTimer !== null) {
    clearInterval(activeCountdownTimer);
    activeCountdownTimer = null;
  }
  if (activeStopTimeout !== null) {
    clearTimeout(activeStopTimeout);
    activeStopTimeout = null;
  }

  const wasRinging = currentlyRinging;
  currentlyRinging = false;

  if (wasRinging && onRingingStopCallback) {
    const cb = onRingingStopCallback;
    onRingingStopCallback = null;
    cb();
  } else {
    onRingingStopCallback = null;
  }
  onTickCallback = null;
}

/**
 * Starts continuous alarm ringing for the specified duration (in seconds)
 * durationSeconds = 0 means ring continuously until user stops it
 */
export async function startRinging(
  soundType: ChimeSoundType = 'bell',
  volume: number = 0.8,
  durationSeconds: number = 15,
  onStop?: () => void,
  onTick?: (remainingSec: number) => void
): Promise<void> {
  // If already ringing, stop old instance
  stopRinging();

  await unlockAudio();
  currentlyRinging = true;
  onRingingStopCallback = onStop || null;
  onTickCallback = onTick || null;

  // Play immediately
  playSoftChime(soundType, volume);

  // Play repeatedly every 2.4s so it sounds like a true alarm clock
  activeRingingTimer = window.setInterval(() => {
    if (!currentlyRinging) return;
    playSoftChime(soundType, volume);
  }, 2400);

  if (durationSeconds > 0) {
    let remaining = durationSeconds;
    if (onTickCallback) onTickCallback(remaining);

    activeCountdownTimer = window.setInterval(() => {
      remaining -= 1;
      if (onTickCallback) onTickCallback(Math.max(0, remaining));
      if (remaining <= 0) {
        stopRinging();
      }
    }, 1000);

    activeStopTimeout = window.setTimeout(() => {
      stopRinging();
    }, durationSeconds * 1000);
  } else {
    // 0 means continuous, emit 0
    if (onTickCallback) onTickCallback(0);
  }
}
