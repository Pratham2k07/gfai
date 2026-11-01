import React, { useState } from 'react';
import { X, Sliders, Save, Sparkles, Languages, Palette, User } from 'lucide-react';
import { Character, Appearance, BehaviourSettings, CommunicationPreferences } from '../types';
import { updateCharacter } from '../services/api';

interface CharacterEditorModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: Character) => void;
  theme: 'dark' | 'light';
}

const PREDEFINED_PERSONALITIES = [
  'Caring and affectionate',
  'Romantic',
  'Shy and introverted',
  'Funny and playful',
  'Savage and sarcastic',
  'Intelligent and mature',
  'Slightly possessive',
  'Calm and understanding',
];

export const CharacterEditorModal: React.FC<CharacterEditorModalProps> = ({
  character,
  isOpen,
  onClose,
  onSaved,
  theme
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'sliders' | 'traits' | 'appearance' | 'communication'>('sliders');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(character.name);
  const [backstory, setBackstory] = useState(character.backstory);
  const [avatar, setAvatar] = useState(character.avatar);

  const [appearance, setAppearance] = useState<Appearance>({ ...character.appearance });
  const [personalities, setPersonalities] = useState<string[]>([...character.personality]);
  const [sliders, setSliders] = useState<BehaviourSettings>({ ...character.behaviour_settings });
  const [commPrefs, setCommPrefs] = useState<CommunicationPreferences>({ ...character.communication_preferences });

  const toggleTrait = (t: string) => {
    if (personalities.includes(t)) {
      if (personalities.length === 1) return;
      setPersonalities(personalities.filter(item => item !== t));
    } else {
      setPersonalities([...personalities, t]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updated = await updateCharacter(character.id, {
        name,
        backstory,
        avatar,
        appearance,
        personality: personalities,
        behaviour_settings: sliders,
        communication_preferences: commPrefs
      });
      onSaved(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        theme === 'dark' ? 'bg-[#111b21] border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          theme === 'dark' ? 'bg-[#202c33] border-gray-800' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <img src={character.avatar} alt={character.name} className="w-10 h-10 rounded-full object-cover border border-emerald-500" />
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Edit {character.name}'s Personality
              </h3>
              <p className="text-xs text-gray-400">All chat history is permanently preserved.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className={`flex border-b text-xs font-semibold ${
          theme === 'dark' ? 'bg-black border-[#262626] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          {[
            { id: 'sliders', label: 'Behaviour Sliders', icon: Sliders },
            { id: 'traits', label: 'Personality Traits', icon: Sparkles },
            { id: 'communication', label: 'Communication', icon: Languages },
            { id: 'appearance', label: 'Appearance', icon: Palette },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-400'
                  : 'border-transparent hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'sliders' && (
            <div className="space-y-4">
              {[
                { key: 'affection', label: 'Affection & Warmth' },
                { key: 'romantic', label: 'Romantic Tension & Flirting' },
                { key: 'humour', label: 'Humour & Playful Teasing' },
                { key: 'jealousy', label: 'Jealousy & Possessiveness' },
                { key: 'talkativeness', label: 'Talkativeness' },
                { key: 'expressiveness', label: 'Emotional Expressiveness' },
                { key: 'playfulness', label: 'Playfulness' },
              ].map(item => {
                const val = (sliders as any)[item.key];
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{item.label}</span>
                      <span className="text-emerald-400 font-bold">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={val}
                      onChange={e => setSliders({ ...sliders, [item.key]: parseInt(e.target.value) })}
                      className="w-full accent-emerald-500 h-2 bg-gray-700/40 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'traits' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">Combine multiple traits to define how she responds:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PREDEFINED_PERSONALITIES.map(trait => {
                  const isChecked = personalities.includes(trait);
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => toggleTrait(trait)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : theme === 'dark'
                          ? 'bg-[#182229] border-gray-700 text-gray-400'
                          : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    >
                      <span>{trait}</span>
                      {isChecked && <span className="text-emerald-400 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Language</label>
                <select
                  value={commPrefs.language}
                  onChange={(e: any) => setCommPrefs({ ...commPrefs, language: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${
                    theme === 'dark' ? 'bg-[#182229] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="English">English</option>
                  <option value="Hinglish">Hinglish</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Tone</label>
                <select
                  value={commPrefs.formality}
                  onChange={(e: any) => setCommPrefs({ ...commPrefs, formality: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${
                    theme === 'dark' ? 'bg-[#182229] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Casual">Casual</option>
                  <option value="Flirty">Flirty</option>
                  <option value="Formal">Formal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Reply Length</label>
                <select
                  value={commPrefs.replyLength}
                  onChange={(e: any) => setCommPrefs({ ...commPrefs, replyLength: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${
                    theme === 'dark' ? 'bg-[#182229] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Short">Short</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Detailed">Detailed</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Nationality / Heritage</label>
                  <input
                    type="text"
                    value={appearance.nationality || ''}
                    onChange={e => setAppearance({ ...appearance, nationality: e.target.value })}
                    placeholder="e.g. Indian, French, Japanese, Latina..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Complexion / Skin Tone</label>
                  <input
                    type="text"
                    value={appearance.skinTone || ''}
                    onChange={e => setAppearance({ ...appearance, skinTone: e.target.value })}
                    placeholder="e.g. Wheatish / Warm Honey, Olive, Fair..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Hair Color & Hairstyle</label>
                  <input
                    type="text"
                    value={`${appearance.hairColor} (${appearance.hairstyle})`}
                    onChange={e => setAppearance({ ...appearance, hairColor: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Eye Color & Shape</label>
                  <input
                    type="text"
                    value={`${appearance.eyeColor} (${appearance.eyeShape || 'Almond'})`}
                    onChange={e => setAppearance({ ...appearance, eyeColor: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Height & Build</label>
                  <input
                    type="text"
                    value={`${appearance.height || "5'5\""}, ${appearance.bodyType || 'Slender'}`}
                    onChange={e => setAppearance({ ...appearance, height: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Clothing Style</label>
                  <input
                    type="text"
                    value={appearance.clothingStyle}
                    onChange={e => setAppearance({ ...appearance, clothingStyle: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 flex items-center justify-end gap-3 border-t ${
          theme === 'dark' ? 'bg-black border-[#262626]' : 'bg-gray-50 border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#0095f6] hover:bg-[#1877f2] text-white transition-all shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

