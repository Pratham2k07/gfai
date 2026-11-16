import React from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Info,
  Zap,
  Moon,
  Clock
} from 'lucide-react';
import { Character, PendingReplyInfo } from '../types';

interface ChatHeaderProps {
  character: Character;
  isTyping: boolean;
  memoriesCount: number;
  pendingReply?: PendingReplyInfo | null;
  onSkipDelay?: () => void;
  isSkipping?: boolean;
  onBack?: () => void;
  onOpenProfile: () => void;
  onOpenMemories?: () => void;
  onStartCall: () => void;
  onTriggerProactive?: () => void;
  theme: 'dark' | 'light';
}

function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'moments';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const remainingSec = seconds % 60;
  return remainingSec > 0 ? `${mins}m ${remainingSec}s` : `${mins}m`;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  character,
  isTyping,
  memoriesCount,
  pendingReply,
  onSkipDelay,
  isSkipping = false,
  onBack,
  onOpenProfile,
  onOpenMemories,
  onStartCall,
  onTriggerProactive,
  theme
}) => {
  return (
    <header className={`px-4 py-3 flex items-center justify-between border-b z-20 select-none ${
      theme === 'dark' ? 'bg-black border-[#262626] text-white' : 'bg-white border-[#dbdbdb] text-[#262626]'
    }`}>
      {/* Left: Avatar, Name & Active Status */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenProfile}>
        {onBack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="md:hidden p-1 -ml-1 text-gray-300 hover:text-white"
            title="Back to Direct Messages"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {/* Story Ring Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full p-[2px] ig-story-ring flex items-center justify-center">
            <img
              src={character.avatar}
              alt={character.name}
              className={`w-full h-full rounded-full object-cover border-2 ${
                theme === 'dark' ? 'border-black' : 'border-white'
              }`}
            />
          </div>
          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 ${
            theme === 'dark' ? 'border-black' : 'border-white'
          }`} />
        </div>

        <div>
          <h3 className="font-bold text-sm sm:text-base leading-tight">
            {character.name}
          </h3>

          <div className="text-xs">
            {isTyping ? (
              <span className="text-pink-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping inline-block" />
                typing...
              </span>
            ) : pendingReply?.isNight ? (
              <span className="text-purple-300 flex items-center gap-1 text-[11px]">
                <span>🌙</span>
                <span>Active tonight</span>
              </span>
            ) : (
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Active now</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center/Right: Pending Status Chip & Quick Skip for Testing */}
      <div className="flex items-center gap-1 sm:gap-3">
        {pendingReply && (
          <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full text-xs">
            <span className="text-purple-300 font-medium text-[11px]">
              {pendingReply.isSeen || pendingReply.isTyping ? 'Seen' : 'Delivered'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSkipDelay?.();
              }}
              disabled={isSkipping}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-all active:scale-95 shadow-sm disabled:opacity-50 ml-1 flex items-center gap-0.5"
              title="Skip delay and reply immediately"
            >
              <Zap className="w-2.5 h-2.5" />
              <span>{isSkipping ? 'Replying...' : 'Reply now'}</span>
            </button>
          </div>
        )}

        {/* Audio Phone Call */}
        <button
          onClick={onStartCall}
          className={`p-2 rounded-full transition-all ${
            theme === 'dark' ? 'hover:bg-[#262626] text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Voice Call"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Video Call */}
        <button
          onClick={onStartCall}
          className={`p-2 rounded-full transition-all ${
            theme === 'dark' ? 'hover:bg-[#262626] text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Video Call"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Info / Profile Details */}
        <button
          onClick={onOpenProfile}
          className={`p-2 rounded-full transition-all relative ${
            theme === 'dark' ? 'hover:bg-[#262626] text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Conversation Details"
        >
          <Info className="w-5 h-5" />
          {memoriesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0095f6]" />
          )}
        </button>
      </div>
    </header>
  );
};
