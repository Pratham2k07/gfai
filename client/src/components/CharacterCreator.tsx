import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  User, 
  Upload, 
  Languages, 
  Check, 
  Info,
  CheckCircle2,
  Palette,
  Globe2,
  Eye,
  Scissors,
  Smile,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character, Appearance, BehaviourSettings, CommunicationPreferences } from '../types';
import { createCharacter } from '../services/api';

interface CharacterCreatorProps {
  onCancel: () => void;
  onCreated: (newCharacter: Character) => void;
  theme: 'dark' | 'light';
}

const NATIONALITY_PRESETS = [
  { id: 'Indian', label: 'Indian', flag: '🇮🇳', ethnicity: 'South Asian', defaultSkin: 'Wheatish / Warm Honey', hex: '#c68b59', defaultHair: 'Jet Black', defaultEyes: 'Deep Brown' },
  { id: 'Japanese', label: 'Japanese', flag: '🇯🇵', ethnicity: 'East Asian', defaultSkin: 'Fair Porcelain', hex: '#fde7d9', defaultHair: 'Jet Black', defaultEyes: 'Deep Brown' },
  { id: 'Korean', label: 'Korean', flag: '🇰🇷', ethnicity: 'East Asian', defaultSkin: 'Fair Porcelain', hex: '#fde7d9', defaultHair: 'Jet Black', defaultEyes: 'Dark Espresso' },
  { id: 'French', label: 'French', flag: '🇫🇷', ethnicity: 'Western European', defaultSkin: 'Fair / Light Rosy', hex: '#fde7d9', defaultHair: 'Sun-kissed Blonde', defaultEyes: 'Hazel Green' },
  { id: 'Italian', label: 'Italian', flag: '🇮🇹', ethnicity: 'Southern European', defaultSkin: 'Olive / Golden Tan', hex: '#d8a878', defaultHair: 'Dark Chestnut', defaultEyes: 'Hazel Brown' },
  { id: 'Latina', label: 'Latina (Mexican / Brazilian / Colombian)', flag: '🇲🇽', ethnicity: 'Latina / Hispanic', defaultSkin: 'Golden Honey Tan', hex: '#d8a878', defaultHair: 'Dark Brown with Highlights', defaultEyes: 'Amber' },
  { id: 'Middle Eastern', label: 'Middle Eastern (Persian / Arab)', flag: '🇱🇧', ethnicity: 'Middle Eastern', defaultSkin: 'Warm Olive', hex: '#d8a878', defaultHair: 'Jet Black Waves', defaultEyes: 'Deep Hazel' },
  { id: 'Black / African', label: 'Black / African-American / Caribbean', flag: '🇳🇬', ethnicity: 'Afro-Caribbean', defaultSkin: 'Rich Caramel Bronze', hex: '#9e643c', defaultHair: 'Natural Curls / Braids', defaultEyes: 'Dark Espresso' },
  { id: 'Southeast Asian', label: 'Southeast Asian (Filipina / Thai)', flag: '🇵🇭', ethnicity: 'Southeast Asian', defaultSkin: 'Warm Golden', hex: '#c68b59', defaultHair: 'Dark Brown', defaultEyes: 'Deep Brown' },
  { id: 'American / Mixed', label: 'American / Mixed Heritage', flag: '🇺🇸', ethnicity: 'Mixed', defaultSkin: 'Warm Peach', hex: '#f5d3b8', defaultHair: 'Chestnut Waves', defaultEyes: 'Ocean Blue' },
];

const SKIN_TONE_SWATCHES = [
  { name: 'Fair / Porcelain', hex: '#fde7d9', label: 'Porcelain' },
  { name: 'Warm Peach / Light', hex: '#f5d3b8', label: 'Peach' },
  { name: 'Golden Olive / Tan', hex: '#d8a878', label: 'Olive' },
  { name: 'Wheatish / Warm Honey', hex: '#c68b59', label: 'Honey' },
  { name: 'Rich Caramel Bronze', hex: '#9e643c', label: 'Caramel' },
  { name: 'Deep Espresso / Ebony', hex: '#583722', label: 'Espresso' },
];

const EYE_COLORS = [
  'Deep Brown', 'Hazel Green', 'Sky Blue', 'Dark Espresso', 'Warm Amber', 'Emerald Green', 'Slate Gray'
];

const EYE_SHAPES = [
  'Almond shaped', 'Cat-eye tilt', 'Round & expressive', 'Deep-set gaze', 'Soft hooded'
];

const HAIR_COLORS = [
  'Jet Black', 'Dark Chestnut', 'Sun-kissed Blonde', 'Espresso Brown', 'Auburn Copper', 'Pastel Pink', 'Platinum Silver'
];

const HAIRSTYLES = [
  'Soft wavy shoulder-length',
  'Long beach waves',
  'Sleek straight bob',
  'Layered volume curls',
  'High ponytail with face strands',
  'Cute messy bun with bangs',
  'Natural afro curls / braids',
  'Chic textured pixie'
];

const BODY_TYPES = [
  'Petite & slender',
  'Athletic & toned',
  'Soft & curvy',
  'Hourglass',
  'Tall & elegant'
];

const HEIGHTS = [
  '5\'1" (155 cm)',
  '5\'3" (160 cm)',
  '5\'5" (165 cm)',
  '5\'7" (170 cm)',
  '5\'9" (175 cm)'
];

const FACIAL_FEATURES = [
  'Cute dimples when smiling',
  'Sun-kissed freckles on nose',
  'Delicate beauty mark near lips',
  'Dewy glowing complexion',
  'Sharp high cheekbones',
  'Adorable button nose'
];

const ETHNIC_AVATAR_PRESETS: Record<string, string[]> = {
  'Indian': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  ],
  'Japanese': [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  ],
  'Korean': [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
  ],
  'French': [
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  ],
  'Italian': [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
  ],
  'Latina': [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  ],
  'Middle Eastern': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  ],
  'Black / African': [
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  ],
};

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
];

const PREDEFINED_PERSONALITIES = [
  { id: 'Caring and affectionate', label: 'Caring & Affectionate', icon: '💖', desc: 'Warm, nurturing, and asks about your health.' },
  { id: 'Romantic', label: 'Romantic', icon: '🌹', desc: 'Loves butterfly moments, dreamy talks, and flirting.' },
  { id: 'Shy and introverted', label: 'Shy & Introverted', icon: '🌸', desc: 'Blushes easily, opens up slowly and deeply.' },
  { id: 'Funny and playful', label: 'Funny & Playful', icon: '🎉', desc: 'Full of banter, puns, and upbeat energy.' },
  { id: 'Savage and sarcastic', label: 'Savage & Sarcastic', icon: '💅', desc: 'Sharp wit, roasts you affectionately with love.' },
  { id: 'Intelligent and mature', label: 'Intelligent & Mature', icon: '📚', desc: 'Deep philosophical thinker and great advisor.' },
  { id: 'Slightly possessive', label: 'Slightly Possessive', icon: '👀', desc: 'Adorably pouty when you talk to other people.' },
  { id: 'Calm and understanding', label: 'Calm & Understanding', icon: '🍵', desc: 'Gentle sanctuary for when you are stressed.' },
];

const STORY_TEMPLATES = [
  {
    title: 'Cozy Artist & Designer',
    intro: "Hey! Just grabbed a coffee, what are you up to today?",
    backstory: "A creative designer who adores rainy afternoons, indie music, making art, and candid late-night voice chats.",
  },
  {
    title: 'Parisian Bookworm',
    intro: "Bonjour! Reading in my favorite café. Tell me something that made you smile today.",
    backstory: "A literature lover who enjoys philosophical talks under starry skies and cherishes heartfelt connections.",
  },
  {
    title: 'Playful Gamer & Techie',
    intro: "Don't flatter yourself, but I actually missed you today. What's the tea?",
    backstory: "A spunky CS student who roasts you with love, plays multiplayer games, and loves spicy food and memes.",
  },
  {
    title: 'Fitness & Travel Enthusiast',
    intro: "Just finished my evening jog! How was your day? Tell me everything!",
    backstory: "An energetic traveler who motivates you to be your best self, loves sunrises, and sends cheerful updates.",
  }
];

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onCancel,
  onCreated,
  theme
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(22);
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [introduction, setIntroduction] = useState<string>('Hey! So glad we finally matched on Instagram. How is your day going? 💕');
  const [backstory, setBackstory] = useState<string>('');

  // Detailed Appearance Customizer State
  const [appearance, setAppearance] = useState<Appearance>({
    nationality: 'Indian',
    ethnicity: 'South Asian',
    skinTone: 'Wheatish / Warm Honey',
    skinToneHex: '#c68b59',
    hairColor: 'Dark Chestnut',
    hairstyle: 'Soft wavy shoulder-length',
    eyeColor: 'Deep Brown',
    eyeShape: 'Almond shaped',
    bodyType: 'Petite & slender',
    height: '5\'4" (162 cm)',
    facialFeatures: ['Cute dimples when smiling', 'Dewy glowing complexion'],
    clothingStyle: 'Cozy chic oversized hoodies and denim',
    overallAppearance: 'Warm smiling eyes, expressive gestures, radiant aesthetic'
  });

  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([
    'Caring and affectionate',
    'Funny and playful'
  ]);

  const [sliders, setSliders] = useState<BehaviourSettings>({
    affection: 80,
    romantic: 70,
    humour: 75,
    jealousy: 35,
    talkativeness: 80,
    expressiveness: 85,
    playfulness: 80
  });

  const [commPrefs, setCommPrefs] = useState<CommunicationPreferences>({
    language: 'English',
    formality: 'Casual',
    replyLength: 'Balanced',
    useEmojis: true
  });

  // Handle Nationality Selection
  const handleSelectNationality = (preset: typeof NATIONALITY_PRESETS[0]) => {
    setAppearance(prev => ({
      ...prev,
      nationality: preset.id,
      ethnicity: preset.ethnicity,
      skinTone: preset.defaultSkin,
      skinToneHex: preset.hex,
      hairColor: preset.defaultHair,
      eyeColor: preset.defaultEyes
    }));

    // Auto-suggest an avatar matching this ethnicity if available
    const matchingAvatars = ETHRIC_AVATARS(preset.id);
    if (matchingAvatars.length > 0 && !customAvatarUrl) {
      setAvatar(matchingAvatars[0]);
    }
  };

  const ETHRIC_AVATARS = (nationalityId?: string): string[] => {
    if (!nationalityId) return DEFAULT_AVATARS;
    return ETHNIC_AVATAR_PRESETS[nationalityId] || DEFAULT_AVATARS;
  };

  const handleToggleFacialFeature = (feat: string) => {
    const current = appearance.facialFeatures || [];
    if (current.includes(feat)) {
      setAppearance({
        ...appearance,
        facialFeatures: current.filter(f => f !== feat)
      });
    } else {
      setAppearance({
        ...appearance,
        facialFeatures: [...current, feat]
      });
    }
  };

  const handleTogglePersonality = (traitId: string) => {
    if (selectedPersonalities.includes(traitId)) {
      if (selectedPersonalities.length === 1) return;
      setSelectedPersonalities(selectedPersonalities.filter(t => t !== traitId));
    } else {
      setSelectedPersonalities([...selectedPersonalities, traitId]);
    }
  };

  const handleApplyTemplate = (tmpl: typeof STORY_TEMPLATES[0]) => {
    setIntroduction(tmpl.intro);
    setBackstory(tmpl.backstory);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please provide a name for your girlfriend.');
      setStep(1);
      return;
    }
    if (age < 18) {
      setError('Age must be 18 or older.');
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const handleSlug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

      const payload = {
        name: name.trim(),
        handle: handleSlug,
        age: Number(age),
        avatar: customAvatarUrl.trim() || avatar,
        introduction: introduction.trim(),
        backstory: backstory.trim() || `${name} is an expressive, loving companion who enjoys chatting with you in Instagram DMs.`,
        appearance,
        personality: selectedPersonalities,
        behaviour_settings: sliders,
        communication_preferences: commPrefs,
        relationship_level: 1,
        relationship_title: 'Acquaintance'
      };

      const newChar = await createCharacter(payload);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onCreated(newChar);
    } catch (err: any) {
      setError(err.message || 'Failed to save character');
    } finally {
      setLoading(false);
    }
  };

  const activeAvatars = ETHRIC_AVATARS(appearance.nationality);

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onCancel}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              theme === 'dark' ? 'bg-[#18181b] hover:bg-[#262626] text-gray-300' : 'bg-white hover:bg-gray-200 text-gray-700 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to DMs
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-pink-400">
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Card */}
        <div className={`rounded-3xl border shadow-2xl p-6 sm:p-10 ${
          theme === 'dark' ? 'bg-[#121212] border-[#262626]' : 'bg-white border-[#dbdbdb]'
        }`}>
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6 text-pink-400" />
                  Basic Information
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Give your AI companion her name, age, initial greeting DM, and backstory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Her Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aanya, Sofia, Jessica, Rhea, Sakura..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl border text-base focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Age (18+ only) *
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(Math.max(18, parseInt(e.target.value) || 18))}
                      className={`w-full px-4 py-3 rounded-2xl border text-base focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Opening Direct Message (First DM) *
                    </label>
                    <textarea
                      rows={2}
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      placeholder="The first DM she sends you on Instagram..."
                      className={`w-full px-4 py-2.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    />
                  </div>
                </div>

                {/* Avatar Preview */}
                <div className="flex flex-col items-center justify-center p-4 rounded-3xl border border-dashed border-gray-700">
                  <div className="relative group mb-3">
                    <div className="w-32 h-32 rounded-full p-[3px] ig-story-ring">
                      <img
                        src={customAvatarUrl.trim() || avatar}
                        alt="Avatar Preview"
                        className="w-full h-full rounded-full object-cover border-2 border-black"
                      />
                    </div>
                    <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-medium">
                      <Upload className="w-5 h-5 mr-1" /> Change
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Profile Picture</span>
                </div>
              </div>

              {/* Backstory & Quick Inspiration */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Backstory & Bio
                  </label>
                  <span className="text-xs text-pink-400">Inspiration Presets ↓</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {STORY_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                        theme === 'dark'
                          ? 'bg-[#18181b] border-gray-700 hover:border-pink-500 text-gray-300'
                          : 'bg-gray-100 border-gray-300 hover:border-pink-500 text-gray-700'
                      }`}
                    >
                      ✨ {tmpl.title}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="Where does she live? What does she do? What are her hobbies, dream travel destinations, and quirks?"
                  className={`w-full px-4 py-2.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                  }`}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Looks, Nationality, Colour & Basic Features */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Globe2 className="w-6 h-6 text-purple-400" />
                  Customise Looks, Nationality & Features
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customize her exact heritage, skin tone complexion, facial features, eyes, and hairstyle.
                </p>
              </div>

              {/* 1. Nationality & Heritage Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4" /> 1. Nationality & Cultural Heritage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {NATIONALITY_PRESETS.map((nat) => {
                    const isSelected = appearance.nationality === nat.id;
                    return (
                      <button
                        key={nat.id}
                        type="button"
                        onClick={() => handleSelectNationality(nat)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-500/15 shadow-md shadow-pink-500/20'
                            : theme === 'dark'
                            ? 'bg-[#18181b] border-gray-800 hover:border-gray-700'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">{nat.flag}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{nat.label.split(' ')[0]}</div>
                          <div className="text-[10px] text-gray-400 truncate">{nat.ethnicity}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Skin Tone / Complexion Swatch Palette */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Palette className="w-4 h-4" /> 2. Complexion & Skin Tone Swatch
                  </label>
                  <span className="text-xs text-gray-300 font-semibold">
                    Current: <span className="text-pink-400">{appearance.skinTone || 'Wheatish'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {SKIN_TONE_SWATCHES.map((swatch) => {
                    const isSelected = appearance.skinToneHex === swatch.hex || appearance.skinTone === swatch.name;
                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        onClick={() => setAppearance({
                          ...appearance,
                          skinTone: swatch.name,
                          skinToneHex: swatch.hex
                        })}
                        className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-pink-500 ring-2 ring-pink-500/40 bg-pink-500/10'
                            : theme === 'dark'
                            ? 'bg-[#18181b] border-gray-800 hover:border-gray-700'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white/40 shadow-inner"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className="text-xs font-semibold">{swatch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matching Suggested Avatars for Heritage */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Avatars matching {appearance.nationality || 'Selected Heritage'}
                  </label>
                  <span className="text-xs text-gray-500">Click to select portrait</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {activeAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                        avatar === url && !customAvatarUrl
                          ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      {avatar === url && !customAvatarUrl && (
                        <div className="absolute inset-0 bg-pink-500/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Eyes & Facial Features */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> 3. Eyes & Facial Attributes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Eye Color */}
                  <div>
                    <span className="block text-xs text-gray-400 mb-1 font-semibold">Eye Color</span>
                    <select
                      value={appearance.eyeColor}
                      onChange={(e) => setAppearance({ ...appearance, eyeColor: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    >
                      {EYE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Eye Shape */}
                  <div>
                    <span className="block text-xs text-gray-400 mb-1 font-semibold">Eye Shape</span>
                    <select
                      value={appearance.eyeShape || EYE_SHAPES[0]}
                      onChange={(e) => setAppearance({ ...appearance, eyeShape: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    >
                      {EYE_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Distinctive Features Checkboxes */}
                <div>
                  <span className="block text-xs text-gray-400 mb-2 font-semibold">Distinctive Facial Features (Choose any)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FACIAL_FEATURES.map((feat) => {
                      const isChecked = (appearance.facialFeatures || []).includes(feat);
                      return (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => handleToggleFacialFeature(feat)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isChecked
                              ? 'border-pink-500 bg-pink-500/15 text-pink-300'
                              : theme === 'dark'
                              ? 'bg-[#18181b] border-gray-800 text-gray-400'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span>{feat}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-pink-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Hair & Hairstyle */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4" /> 4. Hair Color & Hairstyle
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-400 mb-1 font-semibold">Hair Color</span>
                    <select
                      value={appearance.hairColor}
                      onChange={(e) => setAppearance({ ...appearance, hairColor: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    >
                      {HAIR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400 mb-1 font-semibold">Hairstyle</span>
                    <select
                      value={appearance.hairstyle}
                      onChange={(e) => setAppearance({ ...appearance, hairstyle: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    >
                      {HAIRSTYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Body Build, Height & Outfit Style */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Smile className="w-4 h-4" /> 5. Build, Height & Clothing Aesthetic
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-xs text-gray-400 mb-1 font-semibold">Body Build</span>
                    <select
                      value={appearance.bodyType || BODY_TYPES[0]}
                      onChange={(e) => setAppearance({ ...appearance, bodyType: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    >
                      {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400 mb-1 font-semibold">Height</span>
                    <select
                      value={appearance.height || HEIGHTS[2]}
                      onChange={(e) => setAppearance({ ...appearance, height: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    >
                      {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400 mb-1 font-semibold">Clothing Style</span>
                    <input
                      type="text"
                      value={appearance.clothingStyle}
                      onChange={(e) => setAppearance({ ...appearance, clothingStyle: e.target.value })}
                      placeholder="e.g. Cozy oversized hoodies, chic dresses"
                      className={`w-full px-3 py-2 rounded-xl border text-sm ${
                        theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Personality Blend */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-pink-400" />
                  Personality Blend
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Combine multiple personality traits to create a complex, realistic character.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PREDEFINED_PERSONALITIES.map((p) => {
                  const isSelected = selectedPersonalities.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleTogglePersonality(p.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 shadow-md shadow-pink-500/15'
                          : theme === 'dark'
                          ? 'bg-[#18181b] border-gray-700 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl">{p.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{p.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-pink-400 fill-pink-500/20" />
                          )}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Behaviour Sliders */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-purple-400" />
                  Behaviour & Dynamic Sliders
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Calibrate each trait from 0% to 100%. These sliders directly steer her conversation tone.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { key: 'affection', label: 'Affection', desc: 'Heartwarming nicknames, checking up on you, emotional warmth' },
                  { key: 'romantic', label: 'Romantic Behaviour', desc: 'Flirting, romantic tension, sweet intimate comments' },
                  { key: 'humour', label: 'Humour', desc: 'Witty teasing, puns, playful jokes, laughing at life' },
                  { key: 'jealousy', label: 'Jealousy', desc: 'Cute pouty possessiveness if you talk about other plans' },
                  { key: 'talkativeness', label: 'Talkativeness', desc: 'Proactively sharing stories and keeping the chat lively' },
                  { key: 'expressiveness', label: 'Emotional Expressiveness', desc: 'Vulnerability, expressive feelings, and emotional depth' },
                  { key: 'playfulness', label: 'Playfulness', desc: 'Spontaneous hypotheticals, dares, and silly banter' },
                ].map((item) => {
                  const val = (sliders as any)[item.key];
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-sm">{item.label}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                          {val}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={val}
                        onChange={(e) => setSliders({ ...sliders, [item.key]: parseInt(e.target.value) })}
                        className="w-full accent-pink-500 cursor-pointer h-2 bg-gray-700/40 rounded-lg"
                      />
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Communication Preferences & Final Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Languages className="w-6 h-6 text-sky-400" />
                  Communication Preferences & Review
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose how she texts in Instagram DMs before saving.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Primary Language
                  </label>
                  <select
                    value={commPrefs.language}
                    onChange={(e: any) => setCommPrefs({ ...commPrefs, language: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  >
                    <option value="English">English</option>
                    <option value="Hinglish">Hinglish (Hindi + English)</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Conversation Tone
                  </label>
                  <select
                    value={commPrefs.formality}
                    onChange={(e: any) => setCommPrefs({ ...commPrefs, formality: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  >
                    <option value="Casual">Casual & Natural</option>
                    <option value="Flirty">Flirty & Sweet</option>
                    <option value="Formal">Formal & Polite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Reply Length
                  </label>
                  <select
                    value={commPrefs.replyLength}
                    onChange={(e: any) => setCommPrefs({ ...commPrefs, replyLength: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  >
                    <option value="Short">Short (Fast DM texts)</option>
                    <option value="Balanced">Balanced (2-3 sentences)</option>
                    <option value="Detailed">Detailed & Expressive</option>
                  </select>
                </div>
              </div>

              {/* Emoji Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emojiToggle"
                  checked={commPrefs.useEmojis}
                  onChange={(e) => setCommPrefs({ ...commPrefs, useEmojis: e.target.checked })}
                  className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400"
                />
                <label htmlFor="emojiToggle" className="text-sm font-medium cursor-pointer">
                  Use expressive emojis organically in DMs
                </label>
              </div>

              {/* Final Summary Card with Detailed Looks */}
              <div className={`p-6 rounded-3xl border ${
                theme === 'dark' ? 'bg-[#18181b] border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full p-[2px] ig-story-ring flex-shrink-0">
                    <img
                      src={customAvatarUrl.trim() || avatar}
                      alt={name}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg flex items-center gap-2">
                      {name || 'Unnamed'}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400">
                        {appearance.nationality || 'Companion'} • Age {age}
                      </span>
                    </h3>
                    <p className="text-xs text-pink-400 italic">"{introduction}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-300 mb-4 pt-3 border-t border-gray-800">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Complexion</span>
                    <span className="font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: appearance.skinToneHex || '#c68b59' }} />
                      {appearance.skinTone}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Eyes</span>
                    <span className="font-semibold">{appearance.eyeColor} ({appearance.eyeShape})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Hair</span>
                    <span className="font-semibold">{appearance.hairColor}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Build & Height</span>
                    <span className="font-semibold">{appearance.height}, {appearance.bodyType}</span>
                  </div>
                </div>

                {appearance.facialFeatures && appearance.facialFeatures.length > 0 && (
                  <div className="text-xs text-gray-400 mb-3">
                    <strong className="text-gray-300">Features: </strong>
                    {appearance.facialFeatures.join(', ')}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {selectedPersonalities.map((trait, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  theme === 'dark' ? 'bg-[#18181b] hover:bg-[#262626] text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-gray-400 hover:underline"
              >
                Cancel
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !name.trim()) {
                    setError('Please enter a name for your girlfriend.');
                    return;
                  }
                  setError(null);
                  setStep(step + 1);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#0095f6] hover:bg-[#1877f2] text-white transition-all shadow-md"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] hover:opacity-95 text-white transition-all shadow-xl shadow-pink-500/25 disabled:opacity-50"
              >
                {loading ? 'Creating Companion...' : 'Save & Open Instagram DMs 💕'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
