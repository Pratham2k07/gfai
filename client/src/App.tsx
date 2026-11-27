import React, { useState, useEffect } from 'react';
import { Character, AppSettings, User } from './types';
import { fetchCharacters, fetchSettings } from './services/api';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { CharacterCreator } from './components/CharacterCreator';
import { SettingsModal } from './components/SettingsModal';
import { AccountModal } from './components/AccountModal';
import { soundFX } from './utils/audio';

export const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'chat' | 'create'>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('velora_current_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    hasApiKey: false,
    apiProvider: 'gemini',
    model: 'gemini-1.5-flash',
    soundEnabled: true,
    theme: 'dark',
    proactiveMessages: true,
    realisticDelays: true
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetchCharacters().catch(() => []),
      fetchSettings().catch(() => null)
    ]).then(([chars, setts]) => {
      if (chars && chars.length > 0) {
        setCharacters(chars);
        const storedActiveId = localStorage.getItem('velora_active_char_id');
        if (storedActiveId && chars.some(c => c.id === storedActiveId)) {
          setActiveCharacterId(storedActiveId);
        } else {
          setActiveCharacterId(chars[0].id);
        }
      }
      if (setts) {
        setSettings(setts);
        if (setts.theme) setTheme(setts.theme);
        soundFX.setEnabled(setts.soundEnabled ?? true);
      }
      setLoading(false);
    });
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth Routing: after logging in -> if new user then create, if old then to chat
  const handleLogin = (user: User, isNewUser: boolean) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('velora_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setShowAccountModal(false);

    if (isNewUser || characters.length === 0) {
      // New user -> direct to create her first companion!
      setView('create');
    } else {
      // Old user -> direct straight to chat section with her!
      if (!activeCharacterId && characters.length > 0) {
        setActiveCharacterId(characters[0].id);
      }
      setView('chat');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('velora_current_user');
    } catch (e) {
      console.error(e);
    }
    setShowAccountModal(false);
    setView('landing');
  };

  const handleOpenChat = (charId?: string) => {
    if (!currentUser) {
      // Prompt user to log in or continue
      setShowAccountModal(true);
      return;
    }

    if (charId) {
      setActiveCharacterId(charId);
      try {
        localStorage.setItem('velora_active_char_id', charId);
      } catch (e) {}
    } else if (!activeCharacterId && characters.length > 0) {
      setActiveCharacterId(characters[0].id);
      try {
        localStorage.setItem('velora_active_char_id', characters[0].id);
      } catch (e) {}
    }
    setView('chat');
  };

  const handleStartCreate = () => {
    setView('create');
  };

  const handleCharacterCreated = (newChar: Character) => {
    setCharacters(prev => {
      const filtered = prev.filter(c => c.id !== newChar.id);
      const updated = [newChar, ...filtered];
      try {
        localStorage.setItem('velora_saved_characters', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    setActiveCharacterId(newChar.id);
    try {
      localStorage.setItem('velora_active_char_id', newChar.id);
    } catch (e) {}
    // After creating a companion, direct straight to chat with her!
    setView('chat');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <div className="w-16 h-16 rounded-full p-[3px] ig-story-ring flex items-center justify-center shadow-lg shadow-pink-500/25 animate-pulse">
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-2xl">
            💬
          </div>
        </div>
        <div className="text-xs font-bold tracking-widest uppercase text-gray-400 animate-pulse">
          Loading Direct Messages...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {view === 'landing' && (
        <LandingPage
          onStartCreate={handleStartCreate}
          onOpenChat={handleOpenChat}
          onOpenSettings={() => setShowSettings(true)}
          characters={characters}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenAccount={() => setShowAccountModal(true)}
        />
      )}

      {view === 'create' && (
        <CharacterCreator
          onCancel={() => setView(characters.length > 0 ? 'chat' : 'landing')}
          onCreated={handleCharacterCreated}
          theme={theme}
        />
      )}

      {view === 'chat' && (
        <ChatInterface
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelectCharacter={(id) => setActiveCharacterId(id)}
          onNewCharacter={() => setView('create')}
          onOpenSettings={() => setShowSettings(true)}
          onCharactersUpdated={(chars) => setCharacters(chars)}
          settings={settings}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onNavigateDiscover={() => setView('landing')}
          currentUser={currentUser}
          onOpenAccount={() => setShowAccountModal(true)}
        />
      )}

      {/* Account Profile & Auth Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        characters={characters}
        onSelectCharacter={(id) => {
          setActiveCharacterId(id);
          setView('chat');
        }}
        onStartCreate={() => setView('create')}
        onOpenSettings={() => setShowSettings(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Settings & API Key Modal */}
      <SettingsModal
        settings={settings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsUpdated={(updated) => setSettings(updated)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
};

export default App;
