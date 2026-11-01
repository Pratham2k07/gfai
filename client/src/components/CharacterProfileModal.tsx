import React from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  Edit3, 
  Eraser, 
  Sliders, 
  Palette
} from 'lucide-react';
import { Character } from '../types';

interface CharacterProfileModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onClearChat: () => void;
  onDelete: () => void;
  theme: 'dark' | 'light';
}

export const CharacterProfileModal: React.FC<CharacterProfileModalProps> = ({
  character,
  isOpen,
  onClose,
  onEdit,
  onClearChat,
  onDelete,
  theme
}) => {
  if (!isOpen) return null;

  const nextLevelThreshold = character.relationship_level === 1 ? 100
    : character.relationship_level === 2 ? 250
    : character.relationship_level === 3 ? 500
    : character.relationship_level === 4 ? 1000 : 1000;
  
  const currentLevelBase = character.relationship_level === 1 ? 0
    : character.relationship_level === 2 ? 100
    : character.relationship_level === 3 ? 250
    : character.relationship_level === 4 ? 500 : 1000;

  const xpProgress = character.relationship_level === 5 ? 100 : Math.min(
    100,
    Math.round(((character.xp - currentLevelBase) / (nextLevelThreshold - currentLevelBase)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l transition-all ${
        theme === 'dark' ? 'bg-[#121212] border-[#262626] text-white' : 'bg-white border-[#dbdbdb] text-black'
      }`}>
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${
          theme === 'dark' ? 'bg-black border-[#262626]' : 'bg-white border-[#dbdbdb]'
        }`}>
          <span className="font-bold text-base">Details</span>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instagram Avatar & Handle */}
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full p-[2px] ig-story-ring mb-3">
              <img
                src={character.avatar}
                alt={character.name}
                className={`w-full h-full rounded-full object-cover border-2 ${
                  theme === 'dark' ? 'border-black' : 'border-white'
                }`}
              />
            </div>
            <h2 className="text-xl font-bold flex items-center gap-1.5">
              {character.name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              @{character.handle || character.name.toLowerCase().replace(/\s+/g, '_')} • Age {character.age}
            </p>
            <p className="text-xs text-pink-400 italic mt-2">"{character.custom_status || character.introduction}"</p>
          </div>

          {/* Relationship Progression Card */}
          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#18181b] border-gray-800' : 'bg-gray-50 border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold flex items-center gap-1.5 text-pink-400">
                <Heart className="w-4 h-4 fill-pink-400" />
                Connection Level
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                Level {character.relationship_level}: {character.relationship_title}
              </span>
            </div>

            <div className="w-full h-2 bg-gray-700/40 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{character.xp} XP</span>
              <span>{character.relationship_level === 5 ? 'Max Level' : `${nextLevelThreshold} XP for next rank`}</span>
            </div>
          </div>

          {/* Bio / Backstory */}
          <div className="space-y-1.5">
            <h4 className="text-xs uppercase font-bold text-gray-400">Bio</h4>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {character.backstory}
            </p>
          </div>

          {/* Personality Traits */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-gray-400">Personality</h4>
            <div className="flex flex-wrap gap-1.5">
              {character.personality.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Behaviour Tuning */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-gray-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" /> Behaviour Sliders
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                <span className="text-gray-400">Affection:</span> <strong className="text-pink-400">{character.behaviour_settings.affection}%</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                <span className="text-gray-400">Romantic:</span> <strong className="text-rose-400">{character.behaviour_settings.romantic}%</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                <span className="text-gray-400">Humour:</span> <strong className="text-amber-400">{character.behaviour_settings.humour}%</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                <span className="text-gray-400">Jealousy:</span> <strong className="text-purple-400">{character.behaviour_settings.jealousy}%</strong>
              </div>
            </div>
          </div>

          {/* Appearance & Heritage */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-gray-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" /> Looks & Features
            </h4>
            <div className="text-xs space-y-1.5 text-gray-300">
              <p>
                <strong className="text-gray-400">Heritage:</strong>{' '}
                {character.appearance.nationality || 'International'} ({character.appearance.ethnicity || 'Global'})
              </p>
              <p className="flex items-center gap-1.5">
                <strong className="text-gray-400">Complexion:</strong>
                {character.appearance.skinToneHex && (
                  <span className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: character.appearance.skinToneHex }} />
                )}
                {character.appearance.skinTone || 'Warm glow'}
              </p>
              <p>
                <strong className="text-gray-400">Eyes:</strong>{' '}
                {character.appearance.eyeColor} ({character.appearance.eyeShape || 'Almond'})
              </p>
              <p>
                <strong className="text-gray-400">Hair:</strong>{' '}
                {character.appearance.hairColor} ({character.appearance.hairstyle})
              </p>
              <p>
                <strong className="text-gray-400">Build:</strong>{' '}
                {character.appearance.height || "5'5\""}, {character.appearance.bodyType || 'Slender'}
              </p>
              {character.appearance.facialFeatures && character.appearance.facialFeatures.length > 0 && (
                <p>
                  <strong className="text-gray-400">Features:</strong>{' '}
                  {character.appearance.facialFeatures.join(', ')}
                </p>
              )}
              <p>
                <strong className="text-gray-400">Style:</strong>{' '}
                {character.appearance.clothingStyle}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-800 space-y-2.5">
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-[#18181b] hover:bg-[#262626] text-white border border-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-pink-400" />
              Edit Profile & Sliders
            </button>

            <button
              onClick={onClearChat}
              className="w-full py-2.5 rounded-full text-xs font-semibold bg-gray-800/40 text-gray-300 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <Eraser className="w-4 h-4" />
              Clear Conversation History
            </button>

            <button
              onClick={onDelete}
              className="w-full py-2.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Companion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
