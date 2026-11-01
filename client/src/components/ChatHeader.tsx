import React from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Info 
} from 'lucide-react';
import { Character } from '../types';

interface ChatHeaderProps {
  character: Character;
  isTyping: boolean;
  memoriesCount: number;
  onBack?: () => void;
  onOpenProfile: () => void;
  onOpenMemories?: () => void;
  onStartCall: () => void;
  onTriggerProactive?: () => void;
  theme: 'dark' | 'light';
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  character,
  isTyping,
  memoriesCount,
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
            ) : (
              <span className="text-gray-400">
                Active now
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Authentic Instagram DM Header Icons */}
      <div className="flex items-center gap-1 sm:gap-2">
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
