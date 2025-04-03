import { AUDIO_FILE } from '../Constants/constants';

export function playSound() {
    const audio = new Audio(AUDIO_FILE);
    audio.play();
}
