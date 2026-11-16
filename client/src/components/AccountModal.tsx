import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Sparkles, 
  Heart, 
  Send, 
  Plus, 
  LogOut, 
  Settings, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  RefreshCw,
  Lock,
  Mail,
  Key
} from 'lucide-react';
import { User, Character } from '../types';
import { soundFX } from '../utils/audio';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User, isNewUser: boolean) => void;
  onLogout: () => void;
  characters: Character[];
  onSelectCharacter: (charId: string) => void;
  onStartCreate: () => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

// Preset Demo Users
export const DEMO_RETURNING_USER: User = {
  id: 'user-alex',
  name: 'Alex Rivera',
  handle: 'alex',
  email: 'alex@velora.direct',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  isNewUser: false,
  bio: 'Coffee addict & UI engineer. Passionate about AI & candid chats ✨'
};

export const DEMO_NEW_USER: User = {
  id: 'user-new',
  name: 'Taylor Swiftly',
  handle: 'taylor_new',
  email: 'taylor@velora.direct',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  created_at: new Date().toISOString(),
  isNewUser: true,
  bio: 'Just joined VELORA! Ready to create my first companion.'
};

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  characters,
  onSelectCharacter,
  onStartCreate,
  onOpenSettings,
  theme,
  onToggleTheme
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [nameInput, setNameInput] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.setEnabled(next);
    if (next) soundFX.playReceived();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const newUser: User = {
        id: `user-${Date.now().toString(36)}`,
        name: nameInput.trim() || 'New Member',
        handle: handleInput.trim().replace(/^@/, '') || `user_${Math.floor(Math.random() * 8999 + 1000)}`,
        email: emailInput.trim() || 'user@velora.direct',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        created_at: new Date().toISOString(),
        isNewUser: true
      };
      soundFX.playSent();
      setIsSwitching(false);
      onLogin(newUser, true);
    } else {
      const returningUser: User = {
        id: `user-${Date.now().toString(36)}`,
        name: nameInput.trim() || (emailInput.includes('@') ? emailInput.split('@')[0] : 'Member'),
        handle: handleInput.trim().replace(/^@/, '') || (emailInput ? emailInput.split('@')[0] : 'member'),
        email: emailInput.trim() || 'member@velora.direct',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
        isNewUser: false
      };
      soundFX.playReceived();
      setIsSwitching(false);
      onLogin(returningUser, false);
    }
  };

  const handleQuickLoginReturning = () => {
    soundFX.playSent();
    setIsSwitching(false);
    onLogin(DEMO_RETURNING_USER, false);
  };

  const handleQuickLoginNew = () => {
    soundFX.playSent();
    setIsSwitching(false);
    onLogin(DEMO_NEW_USER, true);
  };

  const showAuthView = !currentUser || isSwitching;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#0c0c0e] border border-white/[0.12] rounded-[32px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Background Gradient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D62976]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#4F5BD5]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full velora-story-ring p-[2px] flex items-center justify-center">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-black">V</span>
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white">
                {showAuthView ? 'Account Access' : 'My Account'}
              </span>
              <span className="block text-[10px] text-zinc-400">
                VELORA Direct • 18+ Private
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 relative z-10">
          {showAuthView ? (
            /* =========================================================================
               AUTH VIEW (LOGIN / SIGN UP)
               ========================================================================= */
            <div className="space-y-6">
              {/* Intro Banner */}
              <div className="text-center space-y-1.5">
                <h3 className="text-2xl font-black text-white font-display tracking-tight">
                  {authMode === 'login' ? 'Welcome Back.' : 'Join VELORA Direct.'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {authMode === 'login' 
                    ? 'Log in to continue your private conversations with your AI companions.'
                    : 'Create your account to design and chat with custom virtual companions.'}
                </p>
              </div>

              {/* One-Click Quick Login Cards (Recommended for Instant Flow) */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                  ⚡ 1-Click Instant Sign-In
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Returning User Option */}
                  <button
                    type="button"
                    onClick={handleQuickLoginReturning}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-[#D62976]/50 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={DEMO_RETURNING_USER.avatar} 
                        alt="Alex" 
                        className="w-7 h-7 rounded-full object-cover border border-white/20" 
                      />
                      <div>
                        <p className="text-xs font-bold text-white leading-none">Alex Rivera</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">@alex</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                      <span>• Old User (Goes to Chat)</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* New User Option */}
                  <button
                    type="button"
                    onClick={handleQuickLoginNew}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-[#962FBF]/50 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full velora-gradient flex items-center justify-center text-white text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-none">New Member</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">@new_creator</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#FF6E5A] font-medium">
                      <span>• New User (Goes to Create)</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'login' 
                      ? 'bg-white text-black shadow-md' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'signup' 
                      ? 'bg-white text-black shadow-md' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Custom Credentials Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="e.g. Liam Walker"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#D62976] focus:outline-none text-xs text-white placeholder-zinc-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                        Handle (Username)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-zinc-500 text-xs font-mono">@</span>
                        <input
                          type="text"
                          value={handleInput}
                          onChange={(e) => setHandleInput(e.target.value)}
                          placeholder="liam_w"
                          className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#D62976] focus:outline-none text-xs text-white placeholder-zinc-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#D62976] focus:outline-none text-xs text-white placeholder-zinc-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#D62976] focus:outline-none text-xs text-white placeholder-zinc-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl text-xs font-bold velora-gradient text-white velora-glow shadow-lg hover:opacity-95 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{authMode === 'login' ? 'Log In to Direct' : 'Create Account & Begin'}</span>
                </button>
              </form>

              {currentUser && isSwitching && (
                <button
                  type="button"
                  onClick={() => setIsSwitching(false)}
                  className="w-full text-center text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  ← Back to Current Account ({currentUser.name})
                </button>
              )}
            </div>
          ) : (
            /* =========================================================================
               LOGGED IN ACCOUNT DASHBOARD
               ========================================================================= */
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.08] flex items-center gap-4">
                <div className="w-16 h-16 rounded-full p-[2px] velora-story-ring flex items-center justify-center shrink-0">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover border-2 border-black"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white truncate">
                      {currentUser.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.08] border border-white/10 text-white/80">
                      VIP Member
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    @{currentUser.handle}
                  </p>

                  <p className="text-[11px] text-zinc-500 truncate mt-1">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Account Quick Metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Companions</span>
                  <span className="text-lg font-black text-white font-display">{characters.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Encryption</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 18+ Private
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Direct DMs</span>
                  <span className="text-lg font-black text-[#FF3875] font-display">Active</span>
                </div>
              </div>

              {/* ── MY COMPANIONS & "CREATE MORE GFS" SECTION ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#D62976]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      My Companions ({characters.length})
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onStartCreate();
                    }}
                    className="text-xs font-bold text-[#FF6E5A] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create More</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {characters.map((char) => (
                    <div 
                      key={char.id}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full p-[1.5px] velora-story-ring shrink-0">
                          <img 
                            src={char.avatar} 
                            alt={char.name} 
                            className="w-full h-full rounded-full object-cover border border-black" 
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{char.name}</p>
                          <p className="text-[10px] text-zinc-400 font-medium">
                            Level {char.relationship_level} • {char.relationship_title}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onSelectCharacter(char.id);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold velora-gradient text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm"
                      >
                        <Send className="w-3 h-3 -rotate-12" />
                        <span>Chat</span>
                      </button>
                    </div>
                  ))}

                  {/* Primary "Create Another Girlfriend" Card */}
                  <button
                    onClick={() => {
                      onClose();
                      onStartCreate();
                    }}
                    className="w-full p-3.5 rounded-2xl border-2 border-dashed border-[#D62976]/40 hover:border-[#D62976] bg-gradient-to-r from-[#962FBF]/10 to-[#FF3875]/10 hover:bg-gradient-to-r hover:from-[#962FBF]/20 hover:to-[#FF3875]/20 flex items-center justify-center gap-2 text-white text-xs font-bold transition-all group shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-[#FF6E5A] group-hover:scale-110 transition-transform" />
                    <span>+ Create Another Girlfriend</span>
                  </button>
                </div>
              </div>

              {/* Quick Settings & Controls */}
              <div className="space-y-2 border-t border-white/[0.08] pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                  Preferences & Tools
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* Sound FX Toggle */}
                  <button
                    onClick={handleToggleSound}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-xs text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-[#FA7E1E]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-zinc-500" />
                      )}
                      <span>Sound Effects</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Theme Switcher */}
                  <button
                    onClick={onToggleTheme}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-xs text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-400" />
                      )}
                      <span>Theme</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {theme}
                    </span>
                  </button>
                </div>

                {/* API Key Config */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-xs text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#D62976]" />
                    <span>Google Gemini API Key</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#FF6E5A]">Configure →</span>
                </button>
              </div>

              {/* Footer Account Actions */}
              <div className="flex items-center gap-2 border-t border-white/[0.08] pt-4">
                <button
                  onClick={() => setIsSwitching(true)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playSent();
                    onLogout();
                    setIsSwitching(true);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

