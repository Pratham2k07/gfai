import React, { useState, useEffect } from 'react';
import { Character, AppSettings } from './types';
import { fetchCharacters, fetchSettings } from './services/api';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { CharacterCreator } from './components/CharacterCreator';
import { SettingsModal } from './components/SettingsModal';
import { soundFX } from './utils/audio';

export const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'chat' | 'create'>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    hasApiKey: false,
    apiProvider: 'gemini',
    model: 'gemini-1.5-flash',
    soundEnabled: true,
    theme: 'dark',
    proactiveMessages: true
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
        setActiveCharacterId(chars[0].id);
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

  const handleOpenChat = (charId?: string) => {
    if (charId) {
      setActiveCharacterId(charId);
    } else if (!activeCharacterId && characters.length > 0) {
      setActiveCharacterId(characters[0].id);
    }
    setView('chat');
  };

  const handleCharacterCreated = (newChar: Character) => {
    setCharacters(prev => [newChar, ...prev]);
    setActiveCharacterId(newChar.id);
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
          onStartCreate={() => setView('create')}
          onOpenChat={handleOpenChat}
          onOpenSettings={() => setShowSettings(true)}
          characters={characters}
          theme={theme}
          onToggleTheme={handleToggleTheme}
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
        />
      )}

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
