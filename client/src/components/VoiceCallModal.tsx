import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Heart } from 'lucide-react';
import { Character } from '../types';
import { soundFX } from '../utils/audio';

interface VoiceCallModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  character,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');

  useEffect(() => {
    soundFX.playReceived();
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      soundFX.playLevelUp();
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-b from-[#18181b] to-black text-white border border-[#2f2f35] shadow-2xl p-8 flex flex-col items-center justify-between min-h-[500px]">
        {/* Top Info */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-400 mb-2">
            <Heart className="w-3.5 h-3.5 fill-pink-400" />
            Instagram Direct Call
          </div>
          <h3 className="text-2xl font-bold">{character.name}</h3>
          <p className="text-xs text-gray-400">
            {callStatus === 'ringing' ? 'Calling...' : formatTime(callDuration)}
          </p>
        </div>

        {/* Avatar with Story Ring and Soundwave Pulse */}
        <div className="relative my-8">
          {callStatus === 'connected' && (
            <>
              <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-pink-500/30 animate-pulse" />
            </>
          )}
          <div className="w-36 h-36 rounded-full p-[3px] ig-story-ring relative z-10 shadow-2xl">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full rounded-full object-cover border-4 border-black"
            />
          </div>
        </div>

        {/* Audio Waveform Visualization */}
        {callStatus === 'connected' ? (
          <div className="flex items-center gap-1.5 h-8 mb-6">
            {[8, 16, 24, 14, 28, 20, 12, 26, 18, 10].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full wave-bar"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 0.12}s`
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-pink-400 animate-pulse mb-6">Connecting encrypted line...</p>
        )}

        {/* Call Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-[#262626] text-gray-300 hover:bg-[#333]'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={onClose}
            className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all transform hover:scale-105"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <button
            onClick={() => soundFX.playReceived()}
            className="p-4 rounded-full bg-[#262626] text-gray-300 hover:bg-[#333] transition-all"
            title="Speaker"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
