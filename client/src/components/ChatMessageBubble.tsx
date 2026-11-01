import React, { useState } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { Message } from '../types';
import { soundFX } from '../utils/audio';

interface ChatMessageBubbleProps {
  message: Message;
  girlfriendAvatar?: string;
  theme: 'dark' | 'light';
  onImageClick?: (url: string) => void;
  onToggleLike?: (msgId: string) => void;
  isLatestUserMessage?: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  girlfriendAvatar,
  theme,
  onImageClick,
  onToggleLike,
  isLatestUserMessage = false
}) => {
  const isUser = message.sender === 'user';
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLiked, setIsLiked] = useState(message.liked || false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handlePlayVoice = () => {
    setIsPlayingAudio(true);
    soundFX.playReceived();
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2500);
  };

  const handleDoubleClick = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    if (nextState) {
      setShowHeartPop(true);
      soundFX.playHeart();
      setTimeout(() => setShowHeartPop(false), 800);
    }
    onToggleLike?.(message.id);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-1.5 px-3 group animate-fade-in`}>
      {/* Girlfriend mini avatar for incoming messages */}
      {!isUser && girlfriendAvatar && (
        <div className="flex-shrink-0 mr-2 self-end mb-1">
          <img
            src={girlfriendAvatar}
            alt="Companion"
            className="w-7 h-7 rounded-full object-cover border border-gray-700"
          />
        </div>
      )}

      <div className="flex flex-col items-end max-w-[80%] sm:max-w-md lg:max-w-lg">
        {/* The Message Bubble */}
        <div
          onDoubleClick={handleDoubleClick}
          className={`relative px-4 py-2.5 rounded-[22px] cursor-pointer select-text transition-transform active:scale-[0.98] ${
            isUser
              ? 'bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white shadow-sm'
              : theme === 'dark'
              ? 'bg-[#262626] text-[#f5f5f5]'
              : 'bg-[#efefef] text-[#262626]'
          }`}
        >
          {/* Heart Pop Animation on Double-Tap */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span className="text-4xl animate-heart-pop">❤️</span>
            </div>
          )}

          {/* Image Message */}
          {message.media_url && message.media_type === 'image' && (
            <div
              className="mb-1 rounded-[16px] overflow-hidden cursor-pointer max-h-72"
              onClick={() => onImageClick?.(message.media_url!)}
            >
              <img
                src={message.media_url}
                alt="Shared attachment"
                className="w-full h-full object-cover transition-transform hover:scale-102"
                loading="lazy"
              />
            </div>
          )}

          {/* Voice Note Audio */}
          {message.media_type === 'audio' ? (
            <div className="flex items-center gap-3 py-1 pr-2">
              <button
                onClick={handlePlayVoice}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isPlayingAudio
                    ? 'bg-white text-purple-600'
                    : isUser
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <div className="flex items-center gap-1 h-5">
                {[4, 12, 18, 10, 16, 22, 14, 8, 19, 12, 7, 15, 20, 10, 5].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isPlayingAudio ? 'bg-white wave-bar' : 'bg-white/60'
                    }`}
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                ))}
              </div>

              <span className="text-[11px] font-mono opacity-80">0:04</span>
            </div>
          ) : (
            /* Text Content */
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
              {message.message}
            </p>
          )}

          {/* Instagram Heart Reaction Badge */}
          {isLiked && (
            <div className="absolute -bottom-2 -right-1 bg-[#18181b] border border-gray-700/80 rounded-full px-1.5 py-0.5 flex items-center shadow-md animate-pop">
              <span className="text-[12px]">❤️</span>
            </div>
          )}
        </div>

        {/* Timestamp & Instagram "Seen" indicator for user messages */}
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] text-gray-500 font-medium">
            {formatTimestamp(message.timestamp)}
          </span>
          {isUser && isLatestUserMessage && (
            <span className="text-[10px] text-gray-400 font-medium">
              • Seen
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
