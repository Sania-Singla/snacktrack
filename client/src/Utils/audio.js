// audioUtils.js
import { AUDIO_FILE } from '../Constants/constants';

let audio = null;
let audioAllowed = false;
let audioListeners = [];

// Notify all listeners when audio state changes
function notifyListeners() {
    audioListeners.forEach((cb) => cb(audioAllowed));
}

function enableAudio() {
    if (!audio) {
        audio = new Audio(AUDIO_FILE);
        audio.preload = 'auto';
    }
    audioAllowed = true;
    notifyListeners();
}

function disableAudio() {
    audioAllowed = false;
    notifyListeners();
}

function toggleAudio() {
    if (audioAllowed) {
        disableAudio();
    } else {
        enableAudio();
    }
}

function getAudioState() {
    return audioAllowed;
}

function subscribeToAudioChanges(callback) {
    audioListeners.push(callback);
    return () => {
        audioListeners = audioListeners.filter((cb) => cb !== callback);
    };
}

async function playSound() {
    if (!audioAllowed || !audio) return;
    try {
        audio.currentTime = 0;
        await audio.play();
    } catch (err) {
        console.log('Audio play failed:', err);
        disableAudio();
    }
}

export {
    enableAudio,
    disableAudio,
    toggleAudio,
    getAudioState,
    subscribeToAudioChanges,
    playSound,
    audioAllowed,
};
