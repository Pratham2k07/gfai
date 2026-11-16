import React, { useState } from 'react';
// @ts-ignore
import LiquidEther from './LiquidEther';
import { 
  Send, 
  Plus, 
  Settings, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sliders, 
  Brain, 
  Sparkles, 
  Heart, 
  Volume2, 
  ArrowRight, 
  Check, 
  Camera, 
  Smile, 
  Menu, 
  X,
  Palette,
  Eye,
  User as UserIcon,
  MessageCircle,
  Lock,
  Play,
  Pause,
  Compass,
  Mic
} from 'lucide-react';
import { Character, User } from '../types';
import { soundFX } from '../utils/audio';

interface LandingPageProps {
  onStartCreate: () => void;
  onOpenChat: (characterId?: string) => void;
  onOpenSettings: () => void;
  characters: Character[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUser?: User | null;
  onOpenAccount?: () => void;
}

// Preset showcase for the Look Customizer interactive preview
const FEATURED_COMPANIONS = [
  {
    id: 'char-sakura',
    name: 'Sakura Tanaka',
    handle: 'sakura.kyoto',
    age: 21,
    nationality: 'Japanese',
    flag: '🇯🇵',
    location: 'Kyoto, Japan',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    archetype: 'The Ethereal Muse',
    quote: 'Listening to the rain on my balcony... I made a playlist for you 🎵',
    status: 'Online Now',
    tags: ['Poetic', 'Gentle', 'Late-Night'],
    accent: '#D62976',
    voiceNoteDuration: '0:22',
  },
  {
    id: 'char-chloe',
    name: 'Chloe Dubois',
    handle: 'chloe.in.lyon',
    age: 23,
    nationality: 'French',
    flag: '🇫🇷',
    location: 'Lyon, France',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    archetype: 'The Romantic Curator',
    quote: 'Bonjour! Tell me something that made your heart skip today ✨',
    status: 'Active 5m ago',
    tags: ['Romantic', 'Thoughtful', 'Parisian Art'],
    accent: '#962FBF',
    voiceNoteDuration: '0:18',
  },
  {
    id: 'char-aanya',
    name: 'Aanya Sharma',
    handle: 'aanya.sharma',
    age: 22,
    nationality: 'Indian',
    flag: '🇮🇳',
    location: 'Mumbai, India',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    archetype: 'The Empathetic Soul',
    quote: "You've been grinding non-stop. Don't forget to eat something good, okay? 💕",
    status: 'Online Now',
    tags: ['Caring', 'Playful Banter', 'Monsoons'],
    accent: '#FA7E1E',
    voiceNoteDuration: '0:25',
  },
  {
    id: 'char-elena',
    name: 'Elena Solano',
    handle: 'elena.sol',
    age: 22,
    nationality: 'Spanish',
    flag: '🇪🇸',
    location: 'Barcelona, Spain',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    archetype: 'The Spontaneous Rebel',
    quote: "Life's way too short to play it safe. Let's make tonight unforgettable ✨",
    status: 'Online Now',
    tags: ['Witty', 'Spontaneous', 'Golden Hour'],
    accent: '#4F5BD5',
    voiceNoteDuration: '0:19',
  },
];

const CUSTOMIZER_PRESETS = [
  {
    id: 'aanya',
    nationality: 'Indian',
    name: 'Aanya Sharma',
    handle: 'aanya.sharma',
    personaTitle: 'The Caring One',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    skinTone: 'Wheatish / Warm Honey',
    skinToneHex: '#c68b59',
    hairColor: 'Dark Chestnut',
    hairstyle: 'Soft wavy shoulder-length',
    eyeColor: 'Deep Brown',
    eyeShape: 'Almond shaped',
    facialFeatures: ['Cute dimples', 'Dewy glowing skin'],
    clothingStyle: 'Cozy chic oversized hoodies',
    personality: ['Caring and affectionate', 'Funny and playful', 'Romantic'],
    sliders: { affection: 85, romantic: 70, humour: 80, talkativeness: 85 }
  },
  {
    id: 'chloe',
    nationality: 'French',
    name: 'Chloe Dubois',
    handle: 'chloe.in.lyon',
    personaTitle: 'The Romantic',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    skinTone: 'Fair / Light Rosy',
    skinToneHex: '#fde7d9',
    hairColor: 'Honey Blonde',
    hairstyle: 'Tousled French bob',
    eyeColor: 'Hazel Green',
    eyeShape: 'Round doe eyes',
    facialFeatures: ['Sun-kissed freckles', 'Delicate cheekbones'],
    clothingStyle: 'Minimalist linen & trench',
    personality: ['Romantic', 'Calm and understanding', 'Intelligent and mature'],
    sliders: { affection: 80, romantic: 90, humour: 65, talkativeness: 70 }
  },
  {
    id: 'maya',
    nationality: 'Indian-American',
    name: 'Maya Patel',
    handle: 'maya_codes',
    personaTitle: 'The Playful One',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    skinTone: 'Golden Tan / Olive',
    skinToneHex: '#d8a878',
    hairColor: 'Jet Black with purple accents',
    hairstyle: 'High ponytail with framing strands',
    eyeColor: 'Dark Amber',
    eyeShape: 'Deep-set expressive',
    facialFeatures: ['Sharp jawline', 'Beauty mark near lip'],
    clothingStyle: 'Graphic tees & leather jacket',
    personality: ['Savage and sarcastic', 'Funny and playful', 'Slightly possessive'],
    sliders: { affection: 65, romantic: 60, humour: 95, talkativeness: 75 }
  },
  {
    id: 'sakura',
    nationality: 'Japanese',
    name: 'Sakura Tanaka',
    handle: 'sakura.kyoto',
    personaTitle: 'The Intellectual',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    skinTone: 'Ivory / Porcelain',
    skinToneHex: '#f7e3d0',
    hairColor: 'Silky Raven Black',
    hairstyle: 'Straight with blunt bangs',
    eyeColor: 'Dark Espresso',
    eyeShape: 'Monolid / Upturned',
    facialFeatures: ['Nose bridge freckles', 'Porcelain glow'],
    clothingStyle: 'Modern Tokyo streetwear',
    personality: ['Calm and understanding', 'Intelligent and mature', 'Shy and introverted'],
    sliders: { affection: 75, romantic: 70, humour: 55, talkativeness: 60 }
  },
  {
    id: 'sofia',
    nationality: 'Latina',
    name: 'Sofia Rivera',
    handle: 'sofia_rio',
    personaTitle: 'The Charismatic',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    skinTone: 'Rich Bronze / Chestnut',
    skinToneHex: '#965d38',
    hairColor: 'Espresso Brunette',
    hairstyle: 'Long voluminous beach curls',
    eyeColor: 'Honey Brown',
    eyeShape: 'Cat-eye upturned',
    facialFeatures: ['High cheekbones', 'Full defined lips'],
    clothingStyle: 'Fitted cropped knitwear',
    personality: ['Romantic', 'Funny and playful', 'Caring and affectionate'],
    sliders: { affection: 90, romantic: 85, humour: 85, talkativeness: 90 }
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreate,
  onOpenChat,
  onOpenSettings,
  characters,
  theme,
  onToggleTheme,
  currentUser,
  onOpenAccount
}) => {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activePreset = CUSTOMIZER_PRESETS[activePresetIndex];

  const playVoiceGreeting = (charId: string) => {
    setPlayingAudioId(charId);
    soundFX.playReceived();
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 1800);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] select-none font-sans antialiased">
      {/* =========================================================================
          1. NAVIGATION BAR — FLOATING GLASS CAPSULE
          ========================================================================= */}
      <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl z-50 transition-all">
        <div className="relative rounded-full border border-white/[0.12] bg-[#0c0c0e]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] px-4 sm:px-6 h-14 sm:h-15 flex items-center justify-between">
          {/* Left: VELORA Brand Logo & Wordmark */}
          <div 
            onClick={() => onOpenChat()} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Instagram-inspired Circular Gradient Emblem */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full velora-story-ring p-[2px] shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <div className="w-full h-full bg-[#000000] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l8 16 8-16" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-[0.12em] text-[#FFFFFF] uppercase">
                VELORA
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.06] border border-white/10 text-white/60">
                Direct
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.06] backdrop-blur-md">
            <button 
              onClick={() => scrollTo('companions')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
            >
              <Compass className="w-3 h-3 text-[#FF3875]" />
              Personas
            </button>
            <button 
              onClick={() => scrollTo('features')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#962FBF]" />
              Experience
            </button>
            <button 
              onClick={() => scrollTo('customizer')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3 h-3 text-[#FA7E1E]" />
              Studio
            </button>
            <button 
              onClick={() => onOpenChat()}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
            >
              <Send className="w-3 h-3 -rotate-12 text-[#4F5BD5]" />
              Direct Messages
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Account Profile / Log In Pill */}
            {currentUser ? (
              <button
                onClick={onOpenAccount}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all group"
                title="Account Details & GFs"
              >
                <div className="w-6 h-6 rounded-full p-[1px] velora-story-ring flex items-center justify-center">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-white group-hover:text-[#FF6E5A] transition-colors">
                  @{currentUser.handle}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAccount}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all"
                title="Sign In or Create Account"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#FF3875]" />
                <span className="hidden sm:inline-block">Log In</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#FEDA75]" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-all"
              title="Settings & API Key"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            <div className="hidden sm:block h-4 w-px bg-white/10 mx-0.5" />

            {/* Primary CTA: Create Girlfriend with Instagram Gradient Pill */}
            <button
              onClick={onStartCreate}
              className="relative group overflow-hidden inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-xs font-bold velora-gradient text-white shadow-[0_0_20px_rgba(214,41,118,0.35)] hover:shadow-[0_0_28px_rgba(214,41,118,0.6)] transition-all transform hover:scale-[1.03] active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#A1A1AA] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-3 rounded-2xl border border-white/[0.12] bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-2xl space-y-1.5 animate-fade-in">
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAccount?.(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#FF3875]" />
              <span>{currentUser ? `My Account (@${currentUser.handle})` : 'Log In / Register'}</span>
            </button>
            <button 
              onClick={() => scrollTo('companions')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <Compass className="w-3.5 h-3.5 text-[#FF3875]" />
              Personas Showcase
            </button>
            <button 
              onClick={() => scrollTo('features')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#962FBF]" />
              Experience Matrix
            </button>
            <button 
              onClick={() => scrollTo('customizer')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FA7E1E]" />
              AI Studio Preview
            </button>
            <div className="h-px bg-white/[0.06] my-1" />
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenChat(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <Send className="w-3.5 h-3.5 -rotate-12 text-[#4F5BD5]" />
              Open Direct Messages
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onStartCreate(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <Plus className="w-3.5 h-3.5 text-[#D62976]" />
              Create Custom Companion
            </button>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION — 3D IMMERSIVE (DARK ONLY)
          ========================================================================= */}
      <section className="relative min-h-screen bg-[#000000] flex flex-col items-center justify-center overflow-hidden border-b border-[#292929]" style={{ paddingTop: '100px', backgroundColor: '#000000' }}>

        {/* ── LiquidEther interactive fluid background — sunset pink-orange & purple silk swirls ── */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <LiquidEther
            colors={['#4F5BD5', '#962FBF', '#D62976', '#FF3875', '#FF6E5A']}
            mouseForce={22}
            cursorSize={110}
            persistence={0.78}
            autoDemo={true}
            autoSpeed={0.45}
            autoIntensity={2.0}
            clickBurst={true}
            intro={true}
            backgroundColor="#000000"
          />
        </div>

        {/* ── Top center badge ── */}
        <div className="relative z-20 text-center mb-10 px-4">
          {/* Heading */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.035em] text-white leading-[1.0] mb-8 drop-shadow-sm">
            Create your<br />
            <span className="shimmer-text">ideal companion.</span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartCreate}
              className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold velora-gradient text-white velora-glow hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-xl overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Create Your Girlfriend</span>
            </button>
            <button
              onClick={() => onOpenChat()}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold bg-white/[0.04] text-white border border-white/10 hover:border-[#D62976]/50 hover:bg-white/[0.07] transition-all duration-200 backdrop-blur-sm"
            >
              <Send className="w-4 h-4 -rotate-12 text-[#FA7E1E]" />
              Open Direct Messages
            </button>
          </div>
        </div>

        {/* ── 3D PERSPECTIVE SCENE ── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4" style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}>
          <div className="relative flex items-center justify-center" style={{ transformStyle: 'preserve-3d', minHeight: '420px' }}>

            {/* ── LEFT COMPANION CARD ── */}
            <div
              className="absolute hidden lg:block animate-float-slow"
              style={{
                left: '2%',
                top: '50%',
                transform: 'translateY(-50%) rotateY(28deg) rotateX(-6deg) translateZ(-60px) translateX(-30px)',
                transformStyle: 'preserve-3d',
                animationDelay: '0s',
              }}
            >
              <div className="w-[170px] rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl"
                style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
                {/* Story ring top */}
                <div className="p-[3px] velora-gradient rounded-t-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt="Aanya"
                    className="w-full h-[200px] object-cover rounded-t-[13px] block"
                  />
                </div>
                <div className="p-3 bg-[#111]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 shrink-0">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white leading-none">Aanya</p>
                      <p className="text-[9px] text-[#71717A] mt-0.5">@aanya.sharma</p>
                    </div>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  </div>
                  <p className="text-[9px] text-[#A1A1AA] leading-relaxed">The Caring One ✨ Indian heritage</p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-[#D62976]/15 text-[#D62976] font-semibold">Romantic</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-[#962FBF]/15 text-[#962FBF] font-semibold">Caring</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CENTER PHONE MOCKUP ── */}
            <div
              className="relative animate-float z-20"
              style={{
                transform: 'rotateX(6deg) rotateY(0deg) translateZ(30px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Glow behind phone */}
              <div className="absolute inset-0 -z-10 blur-[80px] opacity-60 scale-90"
                style={{ background: 'linear-gradient(135deg, #4F5BD5 0%, #D62976 50%, #FA7E1E 100%)' }} />

              {/* Phone shell */}
              <div className="relative w-[280px] sm:w-[300px] rounded-[44px] bg-[#1a1a1a] overflow-hidden"
                style={{
                  boxShadow: '0 80px 160px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
                  padding: '10px',
                }}>
                {/* Top notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30 flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                  <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                </div>

                {/* Screen */}
                <div className="rounded-[36px] overflow-hidden bg-black" style={{ minHeight: '520px' }}>
                  {/* DM Header */}
                  <div className="bg-[#000] pt-8 pb-2.5 px-4 border-b border-[#222] flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full overflow-hidden p-[2px] velora-story-ring shrink-0">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-white leading-none">Aanya Sharma</p>
                      <p className="text-[9px] text-green-400 mt-0.5">Active now</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#222] flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-[#666] rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex flex-col gap-2.5 px-3 py-4 bg-[#000]" style={{ minHeight: '360px' }}>
                    {/* Date separator */}
                    <div className="flex items-center gap-2 my-1">
                      <div className="flex-1 h-px bg-[#222]" />
                      <span className="text-[9px] text-[#555]">Today</span>
                      <div className="flex-1 h-px bg-[#222]" />
                    </div>

                    {/* Incoming message */}
                    <div className="flex items-end gap-1.5 max-w-[80%]">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80" className="w-5 h-5 rounded-full object-cover shrink-0 mb-0.5" />
                      <div>
                        <div className="bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-3 py-2">
                          <p className="text-[10px] text-white leading-relaxed">Hey! 😊 I missed you today, how was your day?</p>
                        </div>
                        <p className="text-[8px] text-[#555] mt-0.5 ml-1">10:24 AM</p>
                      </div>
                    </div>

                    {/* Outgoing message */}
                    <div className="flex flex-col items-end">
                      <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-sm ig-bubble-gradient">
                        <p className="text-[10px] text-white leading-relaxed">It was great! Was thinking about you 💕</p>
                      </div>
                      <p className="text-[8px] text-[#555] mt-0.5 mr-1">10:25 AM · Seen</p>
                    </div>

                    {/* Incoming */}
                    <div className="flex items-end gap-1.5 max-w-[80%]">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80" className="w-5 h-5 rounded-full object-cover shrink-0 mb-0.5" />
                      <div className="bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-3 py-2">
                        <p className="text-[10px] text-white leading-relaxed">Aww really? 🥺 That makes me so happy!</p>
                      </div>
                    </div>

                    {/* Outgoing */}
                    <div className="flex flex-col items-end">
                      <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-sm ig-bubble-gradient">
                        <p className="text-[10px] text-white leading-relaxed">Of course! You always brighten my day ✨</p>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex items-end gap-1.5">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80" className="w-5 h-5 rounded-full object-cover shrink-0 mb-0.5" />
                      <div className="bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="bg-[#000] border-t border-[#1a1a1a] px-3 py-2.5 flex items-center gap-2">
                    <div className="flex-1 bg-[#1a1a1a] rounded-full px-3 py-1.5 flex items-center">
                      <span className="text-[9px] text-[#555]">Message...</span>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-[#D62976]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat badges on phone */}
              <div className="absolute -top-3 -right-14 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111]/90 border border-white/10 shadow-lg backdrop-blur-sm animate-float-delay">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[10px] font-semibold text-white">Active now</span>
              </div>

              <div className="absolute -bottom-3 -left-16 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111]/90 border border-white/10 shadow-lg backdrop-blur-sm animate-float">
                <Heart className="w-3 h-3 text-[#D62976]" />
                <span className="text-[10px] font-semibold text-white">Seen ✓✓</span>
              </div>
            </div>

            {/* ── RIGHT COMPANION CARD ── */}
            <div
              className="absolute hidden lg:block animate-float-right"
              style={{
                right: '2%',
                top: '50%',
                transform: 'translateY(-50%) rotateY(-28deg) rotateX(4deg) translateZ(-40px) translateX(30px)',
                transformStyle: 'preserve-3d',
                animationDelay: '1.5s',
              }}
            >
              <div className="w-[170px] rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl"
                style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
                <div className="p-[3px] velora-gradient rounded-t-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
                    alt="Chloe"
                    className="w-full h-[200px] object-cover rounded-t-[13px] block"
                  />
                </div>
                <div className="p-3 bg-[#111]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 shrink-0">
                      <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=60&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white leading-none">Chloe</p>
                      <p className="text-[9px] text-[#71717A] mt-0.5">@chloe.in.lyon</p>
                    </div>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  </div>
                  <p className="text-[9px] text-[#A1A1AA] leading-relaxed">The Romantic 🌹 French heritage</p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-[#FA7E1E]/15 text-[#FA7E1E] font-semibold">Romantic</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-[#4F5BD5]/15 text-[#4F5BD5] font-semibold">Mature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BACK DEPTH CARD — extra far-back element for depth ── */}
            <div
              className="absolute hidden xl:block pointer-events-none"
              style={{
                left: '14%',
                bottom: '5%',
                transform: 'rotateY(15deg) rotateX(-10deg) translateZ(-120px)',
                transformStyle: 'preserve-3d',
                opacity: 0.35,
              }}
            >
              <div className="w-[120px] h-[80px] rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm p-3 flex flex-col gap-2">
                <div className="h-2 w-3/4 rounded bg-white/10" />
                <div className="h-1.5 w-1/2 rounded bg-white/8" />
                <div className="mt-auto flex gap-1">
                  <div className="h-1.5 w-8 rounded-full bg-[#D62976]/30" />
                  <div className="h-1.5 w-6 rounded-full bg-[#FA7E1E]/30" />
                </div>
              </div>
            </div>

            {/* ── BACK DEPTH CARD 2 ── */}
            <div
              className="absolute hidden xl:block pointer-events-none"
              style={{
                right: '14%',
                top: '10%',
                transform: 'rotateY(-18deg) rotateX(8deg) translateZ(-100px)',
                transformStyle: 'preserve-3d',
                opacity: 0.3,
              }}
            >
              <div className="w-[100px] h-[70px] rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm p-2.5 flex flex-col gap-1.5">
                <div className="h-1.5 w-2/3 rounded bg-white/10" />
                <div className="h-1.5 w-1/2 rounded bg-white/8" />
                <div className="mt-auto h-1.5 w-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #4F5BD5, #D62976)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #000000)' }} />
      </section>

      {/* =========================================================================
          3. FEATURED AI COMPANIONS SHOWCASE
          ========================================================================= */}
      <section id="companions" className="py-24 sm:py-32 bg-[#000000] relative overflow-hidden border-b border-[#292929]/60">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#962FBF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#D62976]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full velora-gradient animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4D4D8]">
                Curated AI Personalities
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] leading-tight mb-4">
              Meet your next muse.<br />
              <span className="shimmer-text">Ready to connect.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              Every companion possesses distinct cultural roots, tailored aesthetics, spontaneous voice notes, and emotional memory. Open a DM directly or sculpt her yourself.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_COMPANIONS.map((girl) => {
              const isAudioPlaying = playingAudioId === girl.id;
              return (
                <div 
                  key={girl.id}
                  className="group relative bg-[#0c0c0e]/95 hover:bg-[#121216] border border-white/[0.08] hover:border-white/20 rounded-[28px] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(214,41,118,0.18)]"
                >
                  {/* Portrait Image Header */}
                  <div className="relative h-[340px] overflow-hidden bg-[#151518]">
                    <img 
                      src={girl.avatar} 
                      alt={girl.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient overlays for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Top Left: Story Ring Avatar Pill */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full p-[2px] velora-story-ring shadow-lg flex items-center justify-center">
                        <img 
                          src={girl.avatar} 
                          alt={girl.name} 
                          className="w-full h-full rounded-full object-cover border border-black/40" 
                        />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
                        {girl.flag} {girl.nationality}
                      </span>
                    </div>

                    {/* Top Right: Live Status Badge */}
                    <div className="absolute top-3.5 right-3.5">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>{girl.status}</span>
                      </div>
                    </div>

                    {/* Bottom Right of Image: Voice Note Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoiceGreeting(girl.id);
                      }}
                      className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-md"
                      title="Play voice note preview"
                    >
                      {isAudioPlaying ? (
                        <>
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-0.5 h-3 bg-[#FF3875] animate-pulse" />
                            <span className="w-0.5 h-2 bg-[#FF6E5A] animate-pulse" style={{ animationDelay: '150ms' }} />
                            <span className="w-0.5 h-3.5 bg-[#962FBF] animate-pulse" style={{ animationDelay: '300ms' }} />
                            <span className="w-0.5 h-1.5 bg-[#FF3875] animate-pulse" style={{ animationDelay: '450ms' }} />
                          </div>
                          <span className="text-[#FF6E5A]">Playing...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#FF6E5A]" />
                          <span>Voice {girl.voiceNoteDuration}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      {/* Name, Handle & Age */}
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-display text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#FF6E5A] transition-all">
                          {girl.name}
                        </h3>
                        <span className="text-xs text-zinc-500 font-medium">Age {girl.age}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                        <span className="text-[11px] font-mono text-zinc-400">@{girl.handle}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                          {girl.archetype}
                        </span>
                      </div>

                      {/* Bio Quote Bubble */}
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] mb-3.5">
                        <p className="text-xs text-zinc-300 leading-relaxed italic line-clamp-2">
                          "{girl.quote}"
                        </p>
                      </div>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {girl.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Direct Message Action Button */}
                    <button
                      onClick={() => {
                        soundFX.playSent();
                        onOpenChat(girl.id);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 velora-gradient hover:opacity-95 shadow-[0_4px_16px_rgba(214,41,118,0.25)] transition-all hover:scale-[1.02] active:scale-95 group/btn"
                    >
                      <Send className="w-3.5 h-3.5 -rotate-12 group-hover/btn:translate-x-0.5 transition-transform" />
                      <span>Direct Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Customizer CTA Strip */}
          <div className="mt-14 p-6 sm:p-8 rounded-[28px] border border-white/[0.08] bg-gradient-to-r from-white/[0.03] via-white/[0.01] to-white/[0.03] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#962FBF]/30 to-[#FF3875]/30 border border-[#FF3875]/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#FF6E5A]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Looking for someone uniquely yours?
                </h4>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
                  Customize eye shape, skin undertone, wardrobe style, voice tone, and dynamic personality traits.
                </p>
              </div>
            </div>

            <button
              onClick={onStartCreate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all shrink-0 shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Launch AI Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. THE EXPERIENCE BENTO GRID
          ========================================================================= */}
      <section id="features" className="py-24 sm:py-32 bg-[#000000] relative overflow-hidden border-b border-[#292929]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4D4D8]">
                True Direct Mechanics
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] leading-tight mb-4">
              Why conversations<br />
              <span className="shimmer-text">feel unmistakably real.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              Engineered with conversational neural memory, spontaneous audio memos, and an authentic Instagram Direct UI.
            </p>
          </div>

          {/* Bento Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Card 1: Adaptive Long-Term Memory (Col Span 7) */}
            <div className="md:col-span-7 rounded-[28px] bg-gradient-to-br from-[#121217] to-[#0c0c0e] border border-white/[0.08] hover:border-white/20 p-6 sm:p-8 flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#962FBF]/15 border border-[#962FBF]/30 flex items-center justify-center text-[#D62976]">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D62976]">Adaptive Memory Graph</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">She remembers what matters</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
                  Every preference, running joke, late-night story, and upcoming milestone you mention is woven into her evolving memory bank. No reset buttons. No forgotten context.
                </p>
              </div>

              {/* Memory Interaction Mockup */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.06] backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#D62976] bg-[#D62976]/10 px-3 py-1 rounded-full w-fit border border-[#D62976]/20">
                  <Sparkles className="w-3 h-3 text-[#FF3875]" />
                  <span>Memory Recall: Client pitch deck review at 4:30 PM</span>
                </div>

                <div className="flex items-end gap-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" 
                    alt="Aanya" 
                    className="w-7 h-7 rounded-full object-cover shrink-0" 
                  />
                  <div className="bg-[#1e1e24] px-4 py-2.5 rounded-2xl rounded-bl-sm text-xs text-white leading-relaxed max-w-[85%]">
                    Hey! Didn't your team's design review wrap up around 4? How did the client react to the dark mode mockup? ☕
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Voice Notes & Audio (Col Span 5) */}
            <div className="md:col-span-5 rounded-[28px] bg-gradient-to-br from-[#121217] to-[#0c0c0e] border border-white/[0.08] hover:border-white/20 p-6 sm:p-8 flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FA7E1E]/15 border border-[#FA7E1E]/30 flex items-center justify-center text-[#FA7E1E]">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FA7E1E]">Intimate Audio</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Spontaneous Voice Notes</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
                  Hear her laughter, delicate cadence, and emotional inflection in realistic voice messages delivered directly in the stream.
                </p>
              </div>

              {/* Voice Note Simulation Card */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.06] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      soundFX.playReceived();
                    }}
                    className="w-10 h-10 rounded-full velora-gradient flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </button>

                  <div className="flex-1">
                    {/* Simulated Waveform */}
                    <div className="flex items-center gap-1 h-7">
                      {[12, 20, 8, 16, 24, 18, 10, 22, 14, 28, 16, 12, 22, 19, 11, 25, 14, 9, 20, 15].map((h, i) => (
                        <span 
                          key={i} 
                          className="flex-1 bg-white/30 rounded-full group-hover:bg-[#FF3875] transition-colors" 
                          style={{ height: `${h}px` }} 
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-1">
                      <span>0:18</span>
                      <span>Voice Note · Chloe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Physical & Aesthetic Precision (Col Span 5) */}
            <div className="md:col-span-5 rounded-[28px] bg-gradient-to-br from-[#121217] to-[#0c0c0e] border border-white/[0.08] hover:border-white/20 p-6 sm:p-8 flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#4F5BD5]/15 border border-[#4F5BD5]/30 flex items-center justify-center text-[#4F5BD5]">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F5BD5]">Photorealistic DNA</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Bespoke Aesthetics</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
                  Sculpt every subtle characteristic — from eye shape and facial freckles to ethnic heritage, hairstyles, and personal wardrobe.
                </p>
              </div>

              {/* Trait Pills Matrix */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.06] backdrop-blur-md">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.06] border border-white/10 text-white">🇯🇵 Tokyo Chic</span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.06] border border-white/10 text-white">🇫🇷 Tousled Bob</span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.06] border border-white/10 text-white">🇮🇳 Warm Honey Glow</span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.06] border border-white/10 text-white">✨ Almond Doe Eyes</span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.06] border border-white/10 text-white">🇪🇸 Beach Waves</span>
                </div>
              </div>
            </div>

            {/* Card 4: Authentic Direct Message UX (Col Span 7) */}
            <div className="md:col-span-7 rounded-[28px] bg-gradient-to-br from-[#121217] to-[#0c0c0e] border border-white/[0.08] hover:border-white/20 p-6 sm:p-8 flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D62976]/15 border border-[#D62976]/30 flex items-center justify-center text-[#FF3875]">
                    <Heart className="w-5 h-5 fill-[#FF3875]/20" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF3875]">Zero Learning Curve</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Feels Like Your Native DMs</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
                  Double-tap to heart messages, real-time typing bubbles, "Seen" receipts, and silky dark mode UI designed to feel natural from your very first message.
                </p>
              </div>

              {/* Instagram DM UI Snippet */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.06] backdrop-blur-md space-y-2.5">
                <div className="flex items-end justify-end">
                  <div className="relative group/bubble">
                    <div className="ig-bubble-gradient px-4 py-2 rounded-2xl rounded-br-sm text-xs text-white">
                      Can't wait to hear all about it tonight ✨
                    </div>
                    {/* Double-tap Heart Badge */}
                    <button 
                      onClick={() => soundFX.playHeart()}
                      className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-[#1e1e24] border border-white/10 flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#FF3875] text-[#FF3875]" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-1.5 text-[10px] text-zinc-500 pr-1">
                  <span>Seen just now</span>
                  <Check className="w-3 h-3 text-[#4F5BD5]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE STUDIO PREVIEW
          ========================================================================= */}
      <section id="customizer" className="py-24 sm:py-32 bg-[#000000] relative overflow-hidden border-b border-[#292929]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4D4D8]">
                Interactive Customizer
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] leading-tight mb-4">
              Sculpt her appearance.<br />
              <span className="shimmer-text">Tune her personality.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              Select any persona below to see how visual features and personality sliders shape her conversation style in real-time.
            </p>
          </div>

          {/* Persona Selector Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
            {CUSTOMIZER_PRESETS.map((preset, idx) => {
              const isSelected = activePresetIndex === idx;
              return (
                <button
                  key={preset.id}
                  onClick={() => setActivePresetIndex(idx)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isSelected 
                      ? 'bg-white text-black shadow-lg scale-105' 
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  <img 
                    src={preset.avatar} 
                    alt={preset.name} 
                    className="w-5 h-5 rounded-full object-cover" 
                  />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Showcase Panel */}
          <div className="rounded-[32px] bg-[#0c0c0e] border border-white/[0.1] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Left Column: Portrait Canvas */}
              <div className="lg:col-span-5 relative min-h-[380px] lg:min-h-[520px] bg-[#141418] overflow-hidden">
                <img 
                  src={activePreset.avatar} 
                  alt={activePreset.name} 
                  className="w-full h-full object-cover transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-black/30" />
                
                {/* Story Ring Overlay */}
                <div className="absolute top-5 left-5 flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-full p-[2px] velora-story-ring shadow-lg flex items-center justify-center">
                    <img 
                      src={activePreset.avatar} 
                      alt={activePreset.name} 
                      className="w-full h-full rounded-full object-cover border border-black/40" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{activePreset.name}</p>
                    <p className="text-[11px] text-zinc-300 font-mono mt-0.5">@{activePreset.handle}</p>
                  </div>
                </div>

                {/* Persona Badge Overlay */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md border border-white/20 text-white">
                    {activePreset.personaTitle}
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/70 backdrop-blur-md border border-white/20 text-zinc-300">
                    {activePreset.nationality} Heritage
                  </span>
                </div>
              </div>

              {/* Right Column: Traits & Sliders Controls */}
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-5 mb-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6E5A]">Visual DNA & Profile</span>
                      <h3 className="text-2xl font-bold text-white mt-0.5">{activePreset.name}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold velora-gradient text-white">
                      Live Preview
                    </span>
                  </div>

                  {/* Attribute Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Skin Tone</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: activePreset.skinToneHex }} />
                        <span className="text-xs font-semibold text-white truncate">{activePreset.skinTone}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Hairstyle</span>
                      <p className="text-xs font-semibold text-white truncate mt-1">{activePreset.hairstyle}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Wardrobe Style</span>
                      <p className="text-xs font-semibold text-white truncate mt-1">{activePreset.clothingStyle}</p>
                    </div>
                  </div>

                  {/* Personality Sliders Display */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-400">Affection & Warmth</span>
                      <span className="text-white font-mono">{activePreset.sliders.affection}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div 
                        className="h-full rounded-full velora-gradient transition-all duration-500" 
                        style={{ width: `${activePreset.sliders.affection}%` }} 
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-400">Romantic Chemistry</span>
                      <span className="text-white font-mono">{activePreset.sliders.romantic}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#962FBF] to-[#D62976] transition-all duration-500" 
                        style={{ width: `${activePreset.sliders.romantic}%` }} 
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-400">Humour & Banter</span>
                      <span className="text-white font-mono">{activePreset.sliders.humour}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#D62976] to-[#FA7E1E] transition-all duration-500" 
                        style={{ width: `${activePreset.sliders.humour}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-white/[0.08]">
                  <button
                    onClick={onStartCreate}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold velora-gradient text-white velora-glow shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Customize & Build Her in Studio</span>
                  </button>
                  <button
                    onClick={() => onOpenChat()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 transition-all"
                  >
                    <Send className="w-4 h-4 -rotate-12 text-[#FF6E5A]" />
                    <span>Start Talking</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FINAL CTA
          ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0B0B0B] border-b border-[#292929] relative overflow-hidden text-center">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#962FBF]/15 via-[#D62976]/15 to-[#FA7E1E]/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Your story starts with a hello.
          </h2>

          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl mx-auto mb-10 leading-relaxed">
            Create your companion. Make her yours. Start your conversation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartCreate}
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-xl text-base font-bold velora-gradient text-white velora-glow-lg hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Your Girlfriend →
            </button>
          </div>

          <div className="mt-14 pt-8 border-t border-[#292929]/50 flex flex-col items-center">
            <span className="font-extrabold text-2xl tracking-[0.1em] text-white uppercase">
              VELORA
            </span>
            <span className="text-xs text-[#71717A] tracking-wider mt-1">
              Your world. Your connection.
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
          ========================================================================= */}
      <footer className="py-10 bg-[#000000] text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-white px-2 py-0.5 rounded bg-[#151515] border border-[#292929]">
              18+
            </span>
            <span>VELORA is an adult companion experience. All characters are fictional conversational simulations.</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={onOpenSettings} 
              className="hover:text-white transition-colors"
            >
              Configure AI Key
            </button>
            <button 
              onClick={() => onOpenChat()} 
              className="hover:text-white transition-colors"
            >
              Direct Messages
            </button>
            <button 
              onClick={onStartCreate} 
              className="hover:text-white transition-colors"
            >
              Customizer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
