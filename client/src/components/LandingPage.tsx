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
  User,
  MessageCircle,
  Lock
} from 'lucide-react';
import { Character } from '../types';
import { soundFX } from '../utils/audio';

interface LandingPageProps {
  onStartCreate: () => void;
  onOpenChat: (characterId?: string) => void;
  onOpenSettings: () => void;
  characters: Character[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

// Preset showcase for the Look Customizer interactive preview
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
  onToggleTheme
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
          1. NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#000000]/85 border-b border-[#292929] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left: VELORA Brand Logo & Wordmark */}
          <div 
            onClick={() => onOpenChat()} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Instagram-inspired Circular Gradient Emblem */}
            <div className="w-10 h-10 rounded-full velora-story-ring p-[2px] shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <div className="w-full h-full bg-[#000000] rounded-full flex items-center justify-center">
                {/* VELORA Custom V Geometry in White */}
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l8 16 8-16" />
                </svg>
              </div>
            </div>

            <div>
              <span className="font-extrabold text-xl tracking-[0.08em] text-[#FFFFFF] uppercase">
                VELORA
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-medium uppercase tracking-widest text-[#71717A]">
                Direct
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
            <button 
              onClick={() => scrollTo('look-customizer')}
              className="hover:text-[#FFFFFF] transition-colors duration-200"
            >
              Look Customizer
            </button>
            <button 
              onClick={() => scrollTo('dm-experience')}
              className="hover:text-[#FFFFFF] transition-colors duration-200"
            >
              DM Experience
            </button>
            <button 
              onClick={() => scrollTo('companions')}
              className="hover:text-[#FFFFFF] transition-colors duration-200"
            >
              Companions
            </button>
            <button 
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-[#FFFFFF] transition-colors duration-200"
            >
              How It Works
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#151515] transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FEDA75]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#151515] transition-colors"
              title="Settings & API Key"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Open DMs Button */}
            <button
              onClick={() => onOpenChat()}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#151515] text-[#FFFFFF] border border-[#292929] hover:border-[#71717A] hover:bg-[#1a1a1a] transition-all"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
              Open DMs
            </button>

            {/* Primary CTA: Create Girlfriend with Instagram Gradient */}
            <button
              onClick={onStartCreate}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold velora-gradient text-[#FFFFFF] velora-glow hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Girlfriend
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#A1A1AA] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-5 py-4 border-t border-[#292929] bg-[#0B0B0B] space-y-3 animate-fade-in">
            <button 
              onClick={() => scrollTo('look-customizer')}
              className="block w-full text-left py-2 text-sm text-[#A1A1AA] hover:text-white font-medium"
            >
              Look Customizer
            </button>
            <button 
              onClick={() => scrollTo('dm-experience')}
              className="block w-full text-left py-2 text-sm text-[#A1A1AA] hover:text-white font-medium"
            >
              DM Experience
            </button>
            <button 
              onClick={() => scrollTo('companions')}
              className="block w-full text-left py-2 text-sm text-[#A1A1AA] hover:text-white font-medium"
            >
              Companions
            </button>
            <button 
              onClick={() => scrollTo('how-it-works')}
              className="block w-full text-left py-2 text-sm text-[#A1A1AA] hover:text-white font-medium"
            >
              How It Works
            </button>
            <div className="pt-2 border-t border-[#292929] flex items-center gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenChat(); }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#151515] text-white border border-[#292929] text-center"
              >
                Open Direct Messages
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION — 3D IMMERSIVE (DARK ONLY)
          ========================================================================= */}
      <section className="relative min-h-screen bg-[#000000] flex flex-col items-center justify-center overflow-hidden border-b border-[#292929]" style={{ paddingTop: '80px', backgroundColor: '#000000' }}>

        {/* ── LiquidEther interactive fluid background — dark with glowing silk swirls ── */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <LiquidEther
            colors={['#4F5BD5', '#962FBF', '#D62976', '#FA7E1E']}
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
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-white leading-[0.95] mb-4">
            Create your<br />
            <span className="shimmer-text">ideal companion.</span>
          </h1>
          <p className="text-xl sm:text-2xl font-light text-[#71717A] tracking-tight mb-8">
            Your connection. Your way.
          </p>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-[#A1A1AA] leading-relaxed mb-10">
            Design her appearance, choose her personality, and build a connection through an immersive messaging experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
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

          {/* Feature chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: <Palette className="w-3.5 h-3.5" />, label: 'Customizable Appearance', color: '#FA7E1E' },
              { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'AI Personality', color: '#D62976' },
              { icon: <Brain className="w-3.5 h-3.5" />, label: 'Memory System', color: '#962FBF' },
              { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Private & 18+', color: '#4F5BD5' },
            ].map(({ icon, label, color }) => (
              <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#A1A1AA] backdrop-blur-sm">
                <span style={{ color }}>{icon}</span>
                {label}
              </div>
            ))}
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
          4. DM EXPERIENCE SECTION
          ========================================================================= */}
      <section id="dm-experience" className="py-20 sm:py-28 bg-[#000000] border-b border-[#292929]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#D62976]">
              Immersive Messaging
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#FFFFFF] mt-2 mb-3">
              Not another chatbot. Your own DMs.
            </h2>
            <p className="text-base text-[#A1A1AA]">
              Conversations that feel personal, natural and familiar.
            </p>
          </div>

          {/* Authentic Instagram Direct Messaging Preview Window */}
          <div className="max-w-3xl mx-auto rounded-2xl border border-[#292929] bg-[#000000] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#0B0B0B] border-b border-[#292929] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full p-[2px] velora-story-ring">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Aanya"
                    className="w-full h-full rounded-full object-cover border border-black"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    Aanya Sharma
                    <span className="text-[10px] text-[#A1A1AA] font-normal">@aanya.sharma</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active now
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenChat('char-aanya')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold velora-gradient text-white transition-all shadow-sm"
                >
                  Send DM →
                </button>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="p-6 sm:p-8 space-y-4 bg-[#000000] text-sm">
              {/* Incoming Bubble 1 */}
              <div className="flex items-end gap-2.5 justify-start">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Aanya"
                  className="w-7 h-7 rounded-full object-cover mb-1 border border-[#292929]"
                />
                <div className="bg-[#151515] text-[#FFFFFF] border border-[#292929] px-4 py-2.5 rounded-[22px] max-w-sm leading-relaxed">
                  Hey! Finally got a break, drinking a matcha latte 🍵 How is your project going today?
                </div>
              </div>

              {/* Outgoing Bubble with Instagram Purple-Pink Gradient & Double-tap Heart Pop */}
              <div className="flex justify-end">
                <div className="relative">
                  <div className="velora-gradient text-white px-4 py-2.5 rounded-[22px] max-w-sm leading-relaxed shadow-sm">
                    Just completed the main screen designs! Feels super clean and responsive.
                  </div>
                  {/* Heart Reaction Badge */}
                  <div className="absolute -bottom-2 -right-1 bg-[#151515] border border-[#292929] rounded-full px-1.5 py-0.5 text-xs shadow-md">
                    ❤️
                  </div>
                </div>
              </div>

              {/* Persistent Memory Recall Badge */}
              <div className="flex justify-center py-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs bg-[#0B0B0B] border border-[#962FBF]/30 text-[#A1A1AA]">
                  <Brain className="w-3.5 h-3.5 text-[#D62976]" />
                  <span>Memory Recall: <em>"Aanya remembered you prefer matcha lattes over coffee"</em></span>
                </div>
              </div>

              {/* Incoming Bubble 2 */}
              <div className="flex items-end gap-2.5 justify-start pt-1">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Aanya"
                  className="w-7 h-7 rounded-full object-cover mb-1 border border-[#292929]"
                />
                <div className="bg-[#151515] text-[#FFFFFF] border border-[#292929] px-4 py-2.5 rounded-[22px] max-w-sm leading-relaxed">
                  So proud of you! But please don't stare at the monitor for 5 hours straight, take a quick walk okay? 🤗
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex items-center gap-2 justify-start pt-1">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Aanya"
                  className="w-7 h-7 rounded-full object-cover border border-[#292929]"
                />
                <div className="bg-[#151515] border border-[#292929] px-4 py-2.5 rounded-[20px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#71717A] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#71717A] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#71717A] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              {/* Seen Receipt */}
              <div className="text-right text-[11px] text-[#71717A] pr-2">
                Seen just now
              </div>
            </div>

            {/* Input Capsule Bar */}
            <div className="p-3 bg-[#0B0B0B] border-t border-[#292929]">
              <div className="flex items-center gap-3 bg-[#151515] border border-[#292929] rounded-full px-4 py-2">
                <Camera className="w-5 h-5 text-[#A1A1AA] cursor-pointer" />
                <input 
                  type="text" 
                  readOnly 
                  value="Message..." 
                  className="bg-transparent text-xs text-[#71717A] flex-1 outline-none cursor-pointer"
                  onClick={() => onOpenChat('char-aanya')}
                />
                <Smile className="w-5 h-5 text-[#A1A1AA]" />
                <Heart className="w-5 h-5 text-[#D62976] fill-[#D62976] cursor-pointer hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MEET YOUR COMPANIONS SECTION
          ========================================================================= */}
      <section id="companions" className="py-20 sm:py-28 bg-[#0B0B0B] border-b border-[#292929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#962FBF]">
                Pre-configured Personalities
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#FFFFFF] mt-2">
                Different personalities. Endless possibilities.
              </h2>
            </div>

            <button
              onClick={onStartCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold velora-gradient text-white shadow-sm self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Build Custom Companion
            </button>
          </div>

          {/* Companion Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => {
              // Map to personality archetype
              const archetype = char.id === 'char-aanya' ? 'The Caring One'
                : char.id === 'char-chloe' ? 'The Romantic'
                : char.id === 'char-maya' ? 'The Playful One'
                : 'The Intellectual';

              return (
                <div
                  key={char.id}
                  className="rounded-2xl border border-[#292929] bg-[#151515] p-5 flex flex-col justify-between hover:border-[#D62976]/60 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div>
                    {/* Photo with Story Ring */}
                    <div className="relative mb-4 overflow-hidden rounded-xl">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10">
                        Age {char.age}
                      </div>

                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold velora-gradient text-white shadow-md">
                        {archetype}
                      </div>
                    </div>

                    {/* Name, Handle & Voice Greeting Button */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <h3 className="font-bold text-lg text-white">{char.name}</h3>
                        <p className="text-xs text-[#71717A]">
                          @{char.handle || char.name.toLowerCase().replace(/\s+/g, '_')}
                        </p>
                      </div>

                      <button
                        onClick={() => playVoiceGreeting(char.id)}
                        className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                          playingAudioId === char.id
                            ? 'velora-gradient text-white scale-105'
                            : 'bg-[#292929] text-[#A1A1AA] hover:text-white'
                        }`}
                        title="Voice Intro Greeting"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-[11px]">Voice</span>
                      </button>
                    </div>

                    {/* Nationality & Complexion Chip */}
                    {char.appearance && (
                      <div className="flex items-center gap-1.5 my-2.5 flex-wrap">
                        {char.appearance.nationality && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-medium bg-[#292929] text-[#A1A1AA]">
                            {char.appearance.nationality}
                          </span>
                        )}
                        {char.appearance.skinTone && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-medium bg-[#292929] text-[#A1A1AA] flex items-center gap-1">
                            {char.appearance.skinToneHex && (
                              <span 
                                className="w-2 h-2 rounded-full inline-block border border-black/40"
                                style={{ backgroundColor: char.appearance.skinToneHex }}
                              />
                            )}
                            {char.appearance.skinTone}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quote */}
                    <p className="text-xs text-[#FA7E1E] italic mb-2 line-clamp-2">
                      "{char.introduction}"
                    </p>

                    {/* Backstory */}
                    <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mb-4">
                      {char.backstory}
                    </p>

                    {/* Personality Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {char.personality.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#000000] text-[#A1A1AA] border border-[#292929]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Message Button */}
                  <div className="pt-4 mt-3 border-t border-[#292929]">
                    <button
                      onClick={() => onOpenChat(char.id)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#000000] hover:bg-gradient-to-r hover:from-[#4F5BD5] hover:to-[#D62976] text-white border border-[#292929] transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5 -rotate-12 text-[#FA7E1E]" />
                      Message {char.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. HOW IT WORKS
          ========================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#000000] border-b border-[#292929]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#4F5BD5]">
              Seamless Workflow
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#FFFFFF] mt-2 mb-3">
              Three steps. One personal connection.
            </h2>
            <p className="text-base text-[#A1A1AA]">
              From concept to active conversation in less than two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] relative hover:border-[#FA7E1E]/50 transition-colors">
              <div className="text-4xl font-extrabold text-[#FA7E1E] mb-4">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Create Her</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Choose her name, appearance and identity. Select nationality, complexion swatches, eyes, hair, and clothing style.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] relative hover:border-[#D62976]/50 transition-colors">
              <div className="text-4xl font-extrabold text-[#D62976] mb-4">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Make Her Yours</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Customize her personality, communication style and behaviour. Fine-tune sliders for affection, humor, and talkativeness.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] relative hover:border-[#4F5BD5]/50 transition-colors">
              <div className="text-4xl font-extrabold text-[#4F5BD5] mb-4">03</div>
              <h3 className="text-lg font-bold text-white mb-2">Start Talking</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Open your private DMs and start chatting. Enjoy natural conversations, persistent memories, voice notes, and reactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FINAL CTA
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
