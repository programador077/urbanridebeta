import { useCallback } from 'react';

// Simple synthesizer using Web Audio API to avoid external assets
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, delay = 0) => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime + delay);

    gain.gain.setValueAtTime(0.1, audioContext.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime + delay);
    osc.stop(audioContext.currentTime + delay + duration);
};

export const useSound = () => {

    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }, []);

    const playRequestSound = useCallback(() => {
        // Alert sound: Two high pitched beeps
        playTone(800, 'sine', 0.1);
        playTone(1000, 'sine', 0.3, 0.15);
        vibrate([200, 100, 200]); // Vibrate: buzz-pause-buzz
    }, [vibrate]);

    const playSuccessSound = useCallback(() => {
        // Success: Ascending major triad
        playTone(440, 'sine', 0.1); // A4
        playTone(554, 'sine', 0.1, 0.1); // C#5
        playTone(659, 'sine', 0.2, 0.2); // E5
        vibrate(200);
    }, [vibrate]);

    const playMessageSound = useCallback(() => {
        // Message: Soft pop
        playTone(600, 'sine', 0.05);
        vibrate(50);
    }, [vibrate]);

    const playCancelSound = useCallback(() => {
        // Cancel: Descending low tone
        playTone(300, 'sawtooth', 0.3);
        playTone(200, 'sawtooth', 0.3, 0.2);
        vibrate(500);
    }, [vibrate]);

    return {
        playRequestSound,
        playSuccessSound,
        playMessageSound,
        playCancelSound
    };
};
