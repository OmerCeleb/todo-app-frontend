// src/utils/sounds.ts

/**
 * Sound utility for playing audio feedback
 * Uses Web Audio API to generate simple sound effects
 */

// Audio context (initialized on first use)
let audioContext: AudioContext | null = null;

/**
 * Get or create audio context
 */
const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Check if sound effects are enabled in settings
 */
const isSoundEnabled = (): boolean => {
    try {
        const settings = localStorage.getItem('app-settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            return parsed.soundEffects === true;
        }
    } catch (error) {
        console.error('Error reading sound settings:', error);
    }
    return false;
};

/**
 * Play a simple beep sound
 */
const playBeep = (frequency: number, duration: number, volume: number = 0.3) => {
    if (!isSoundEnabled()) return;

    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
        console.error('Error playing sound:', error);
    }
};

/**
 * Play a success sound (rising tone)
 */
export const playSuccessSound = () => {
    if (!isSoundEnabled()) return;

    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Rising tone: C to E
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
        console.error('Error playing success sound:', error);
    }
};

/**
 * Play an error sound (descending tone)
 */
export const playErrorSound = () => {
    if (!isSoundEnabled()) return;

    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Descending tone: E to C
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        oscillator.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.15); // C5
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
        console.error('Error playing error sound:', error);
    }
};

/**
 * Play a completion sound (cheerful tune)
 */
export const playCompleteSound = () => {
    if (!isSoundEnabled()) return;

    try {
        const ctx = getAudioContext();

        // Play a quick C-E-G chord sequence
        [523.25, 659.25, 783.99].forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = ctx.currentTime + (index * 0.08);
            gainNode.gain.setValueAtTime(0.15, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.15);
        });
    } catch (error) {
        console.error('Error playing complete sound:', error);
    }
};

/**
 * Play a delete sound (quick low tone)
 */
export const playDeleteSound = () => {
    if (!isSoundEnabled()) return;
    playBeep(200, 0.1, 0.2);
};

/**
 * Play a create sound (quick high tone)
 */
export const playCreateSound = () => {
    if (!isSoundEnabled()) return;
    playBeep(800, 0.1, 0.2);
};

/**
 * Play an update sound (medium tone)
 */
export const playUpdateSound = () => {
    if (!isSoundEnabled()) return;
    playBeep(600, 0.1, 0.2);
};

/**
 * Play a notification sound (attention grabber)
 */
export const playNotificationSound = () => {
    if (!isSoundEnabled()) return;

    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Two-tone notification
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
};

/**
 * Play a click sound (subtle feedback)
 */
export const playClickSound = () => {
    if (!isSoundEnabled()) return;
    playBeep(1000, 0.05, 0.1);
};

/**
 * Play a toggle sound (switch on/off)
 */
export const playToggleSound = (isOn: boolean) => {
    if (!isSoundEnabled()) return;
    playBeep(isOn ? 800 : 600, 0.08, 0.15);
};

/**
 * Sound effects object for easy access
 */
export const sounds = {
    success: playSuccessSound,
    error: playErrorSound,
    complete: playCompleteSound,
    delete: playDeleteSound,
    create: playCreateSound,
    update: playUpdateSound,
    notification: playNotificationSound,
    click: playClickSound,
    toggle: playToggleSound,
};

export default sounds;