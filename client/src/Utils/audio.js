import { AUDIO_FILE } from '../Constants/constants';

// Preload the audio
const audio = new Audio(AUDIO_FILE);
audio.preload = 'auto';

export async function playSound() {
    try {
        // Reset audio to start
        audio.currentTime = 0;
        await audio.play();
    } catch (err) {
        console.log('Audio play failed:', err);
    }
}
