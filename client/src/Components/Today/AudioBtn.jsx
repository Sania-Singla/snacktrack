import { useUserContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { Button } from '..';
import { useEffect } from 'react';
import {
    getAudioState,
    subscribeToAudioChanges,
    toggleAudio,
} from '../../Utils';
import toast from 'react-hot-toast';

export default function AudioBtn() {
    const { audioEnabled, setAudioEnabled } = useUserContext();

    useEffect(() => {
        setAudioEnabled(getAudioState());
        return subscribeToAudioChanges((enabled) => setAudioEnabled(enabled));
    }, []);

    return (
        <div className="relative">
            <Button
                btnText={
                    <div className="size-5 fill-gray-800">{icons.bell}</div>
                }
                title={audioEnabled ? 'Disable Audio' : 'Enable Audio'}
                className="bg-[#ffffff] flex items-center justify-center size-8 group border-1 border-gray-200 rounded-full"
                onClick={() => {
                    toggleAudio();
                    audioEnabled
                        ? toast.error('Audio Disabled')
                        : toast.success('Audio Enabled');
                }}
            />
            {!audioEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-[0.12rem] bg-red-500 rotate-45 transform origin-center" />
                </div>
            )}
        </div>
    );
}
