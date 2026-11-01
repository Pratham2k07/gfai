import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Heart, 
  Sparkles,
  Info,
  Compass,
  SquarePlus,
  Send,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { Character, Message, Memory, AppSettings } from '../types';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatInput } from './ChatInput';
import { MemoryDrawer } from './MemoryDrawer';
import { CharacterProfileModal } from './CharacterProfileModal';
import { CharacterEditorModal } from './CharacterEditorModal';
import { VoiceCallModal } from './VoiceCallModal';
import { 
  fetchMessages, 
  sendMessage, 
  clearChatHistory, 
  deleteCharacter, 
  fetchMemories,
  triggerProactiveMessage,
  toggleMessageLike 
} from '../services/api';
import { soundFX } from '../utils/audio';

interface ChatInterfaceProps {
  characters: Character[];
  activeCharacterId: string;
  onSelectCharacter: (id: string) => void;
  onNewCharacter: () => void;
  onOpenSettings: () => void;
  onCharactersUpdated: (chars: Character[]) => void;
  settings: AppSettings;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigateDiscover?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  characters,
  activeCharacterId,
  onSelectCharacter,
  onNewCharacter,
  onOpenSettings,
  onCharactersUpdated,
  settings,
  theme,
  onToggleTheme,
  onNavigateDiscover
}) => {
  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [memoriesMap, setMemoriesMap] = useState<Record<string, Memory[]>>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Modals state
  const [showMemories, setShowMemories] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Mobile navigation
  const [mobileShowChat, setMobileShowChat] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = activeCharacter ? messagesMap[activeCharacter.id] || [] : [];
  const currentMemories = activeCharacter ? memoriesMap[activeCharacter.id] || [] : [];

  useEffect(() => {
    if (!activeCharacter) return;

    fetchMessages(activeCharacter.id)
      .then(msgs => {
        setMessagesMap(prev => ({ ...prev, [activeCharacter.id]: msgs }));
      })
      .catch(console.error);

    fetchMemories(activeCharacter.id)
      .then(mems => {
        setMemoriesMap(prev => ({ ...prev, [activeCharacter.id]: mems }));
      })
      .catch(console.error);
  }, [activeCharacter?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, isTyping]);

  const handleSendMessage = async (text: string, mediaUrl?: string, mediaType?: 'image' | 'audio') => {
    if (!activeCharacter) return;
    setApiKeyError(null);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      character_id: activeCharacter.id,
      user_id: 'user-default',
      sender: 'user',
      message: text || (mediaType === 'image' ? '📷 [Photo]' : '🎵 [Voice Note]'),
      media_url: mediaUrl,
      media_type: mediaType,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeCharacter.id]: [...(prev[activeCharacter.id] || []), tempUserMsg]
    }));

    setIsTyping(true);

    try {
      const response = await sendMessage(activeCharacter.id, {
        message: text,
        media_url: mediaUrl,
        media_type: mediaType
      });

      setMessagesMap(prev => {
        const filtered = (prev[activeCharacter.id] || []).filter(m => m.id !== tempUserMsg.id);
        return {
          ...prev,
          [activeCharacter.id]: [...filtered, response.userMessage, response.aiMessage]
        };
      });

      soundFX.playReceived();

      if (response.newMemory) {
        setMemoriesMap(prev => ({
          ...prev,
          [activeCharacter.id]: [response.newMemory!, ...(prev[activeCharacter.id] || [])]
        }));
      }

      if (response.relationshipUpdate) {
        if (response.relationshipUpdate.leveledUp) {
          soundFX.playLevelUp();
        }
        onCharactersUpdated(
          characters.map(c =>
            c.id === activeCharacter.id
              ? {
                  ...c,
                  relationship_level: response.relationshipUpdate!.level,
                  relationship_title: response.relationshipUpdate!.title,
                  xp: response.relationshipUpdate!.xp
                }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'NO_API_KEY' || err.code === 'INVALID_API_KEY') {
        setApiKeyError(err.message);
      } else {
        alert(err.message || 'Error communicating with AI service');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleLike = async (msgId: string) => {
    if (!activeCharacter) return;
    try {
      const updated = await toggleMessageLike(activeCharacter.id, msgId);
      setMessagesMap(prev => ({
        ...prev,
        [activeCharacter.id]: (prev[activeCharacter.id] || []).map(m => m.id === msgId ? updated : m)
      }));
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const handleTriggerProactive = async () => {
    if (!activeCharacter) return;
    setIsTyping(true);
    try {
      const newMsg = await triggerProactiveMessage(activeCharacter.id);
      setMessagesMap(prev => ({
        ...prev,
        [activeCharacter.id]: [...(prev[activeCharacter.id] || []), newMsg]
      }));
      soundFX.playReceived();
    } catch (err: any) {
      alert(err.message || 'Failed to trigger message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!activeCharacter) return;
    if (confirm(`Clear all Direct messages with ${activeCharacter.name}?`)) {
      await clearChatHistory(activeCharacter.id);
      setMessagesMap(prev => ({ ...prev, [activeCharacter.id]: [] }));
      setShowProfile(false);
    }
  };

  const handleDeleteCharacter = async (charId: string) => {
    if (characters.length <= 1) {
      alert("You need at least one companion. Please create another one first.");
      return;
    }
    const target = characters.find(c => c.id === charId);
    if (confirm(`Delete conversation and companion profile for ${target?.name}?`)) {
      await deleteCharacter(charId);
      const remaining = characters.filter(c => c.id !== charId);
      onCharactersUpdated(remaining);
      onSelectCharacter(remaining[0].id);
      setShowProfile(false);
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex transition-colors ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Far Left: Authentic Instagram Web Vertical Navigation Rail (Desktop) */}
      <nav className={`hidden md:flex flex-col items-center justify-between py-6 px-3 border-r select-none flex-shrink-0 z-30 transition-colors ${
        theme === 'dark' ? 'bg-black border-[#262626] text-white' : 'bg-white border-[#dbdbdb] text-[#262626]'
      }`}>
        {/* Top: Instagram Glyph & Navigation Actions */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onNavigateDiscover}
            className="p-2 rounded-xl hover:opacity-80 transition-opacity"
            title="Instagram Direct"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>

          {/* Direct Messages Icon (Active) */}
          <button
            className={`p-3 rounded-2xl relative transition-all ${
              theme === 'dark' ? 'bg-[#262626] text-white shadow-sm' : 'bg-gray-100 text-black shadow-sm'
            }`}
            title="Direct Messages"
          >
            <Send className="w-5 h-5 -rotate-12 fill-current" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#0095f6]" />
          </button>

          {/* Discover / Profiles Icon */}
          <button
            onClick={onNavigateDiscover}
            className={`p-3 rounded-2xl transition-all ${
              theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#18181b]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
            title="Explore Companions"
          >
            <Compass className="w-5 h-5" />
          </button>

          {/* Create New Companion (+) */}
          <button
            onClick={onNewCharacter}
            className={`p-3 rounded-2xl transition-all ${
              theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#18181b]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
            title="Create New Girlfriend"
          >
            <SquarePlus className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom: Settings, Theme, Profile */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl transition-all ${
              theme === 'dark' ? 'text-gray-400 hover:text-yellow-400 hover:bg-[#18181b]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenSettings}
            className={`p-2.5 rounded-xl transition-all ${
              theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#18181b]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full border border-gray-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#0095f6] transition-all"
            title="Settings & Key"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </nav>

      {/* Instagram Direct Left Inbox Sidebar */}
      <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-shrink-0 h-full`}>
        <ChatSidebar
          characters={characters}
          activeCharacterId={activeCharacter?.id || null}
          onSelectCharacter={(id) => {
            onSelectCharacter(id);
            setMobileShowChat(true);
          }}
          onNewCharacter={onNewCharacter}
          onOpenSettings={onOpenSettings}
          onEditCharacter={() => setShowEditor(true)}
          onDeleteCharacter={handleDeleteCharacter}
          theme={theme}
          onToggleTheme={onToggleTheme}
          messagesMap={messagesMap}
        />
      </div>

      {/* Main Instagram DM Conversation Window */}
      <main className={`${mobileShowChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full relative`}>
        {activeCharacter ? (
          <>
            {/* Conversation Header */}
            <ChatHeader
              character={activeCharacter}
              isTyping={isTyping}
              memoriesCount={currentMemories.length}
              onBack={() => setMobileShowChat(false)}
              onOpenProfile={() => setShowProfile(true)}
              onOpenMemories={() => setShowMemories(true)}
              onStartCall={() => setShowCall(true)}
              onTriggerProactive={handleTriggerProactive}
              theme={theme}
            />

            {/* In-Chat API Key Missing Alert Card */}
            {(!settings.hasApiKey || apiKeyError) && (
              <div className="p-3 bg-purple-950/40 border-b border-purple-500/30 text-purple-200 text-xs flex items-center justify-between gap-3 px-5 z-10 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>
                    {apiKeyError || "Add your free Google Gemini API key to activate realistic AI companion DMs."}
                  </span>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs whitespace-nowrap transition-transform active:scale-95 shadow-sm"
                >
                  Configure Key →
                </button>
              </div>
            )}

            {/* Direct Message Feed */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 select-none ${
              theme === 'dark' ? 'bg-black' : 'bg-white'
            }`}>
              {/* Instagram-style Top Companion Hero Profile Header */}
              <div className="flex flex-col items-center justify-center pt-6 pb-8 border-b border-gray-800/60 mb-6">
                <div className="w-20 h-20 rounded-full p-[2px] ig-story-ring mb-3">
                  <img
                    src={activeCharacter.avatar}
                    alt={activeCharacter.name}
                    className={`w-full h-full rounded-full object-cover border-2 ${
                      theme === 'dark' ? 'border-black' : 'border-white'
                    }`}
                  />
                </div>
                <h2 className="text-lg font-bold">{activeCharacter.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  @{activeCharacter.handle || activeCharacter.name.toLowerCase().replace(/\s+/g, '_')} • Instagram
                </p>
                <p className="text-xs text-pink-400 font-medium mt-1">
                  Level {activeCharacter.relationship_level}: {activeCharacter.relationship_title}
                </p>
                <button
                  onClick={() => setShowProfile(true)}
                  className={`mt-3 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    theme === 'dark'
                      ? 'bg-[#18181b] border-gray-700 hover:bg-[#262626] text-white'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-black'
                  }`}
                >
                  View Profile
                </button>
              </div>

              {/* Messages List */}
              {currentMessages.map((msg, idx) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  girlfriendAvatar={activeCharacter.avatar}
                  theme={theme}
                  onImageClick={(url) => setEnlargedImage(url)}
                  onToggleLike={handleToggleLike}
                  isLatestUserMessage={idx === currentMessages.length - 1 && msg.sender === 'user'}
                />
              ))}

              {/* Instagram Typing Dots Bubble */}
              {isTyping && (
                <div className="flex justify-start my-2 px-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeCharacter.avatar}
                      alt="Companion"
                      className="w-7 h-7 rounded-full object-cover border border-gray-700"
                    />
                    <div className={`px-4 py-3 rounded-[22px] flex items-center gap-1.5 ${
                      theme === 'dark' ? 'bg-[#262626]' : 'bg-[#efefef]'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Instagram DM Input Capsule */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              theme={theme}
              placeholder={`Message ${activeCharacter.name}...`}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-4">
            <Heart className="w-12 h-12 text-pink-500 animate-pulse" />
            <h3 className="text-xl font-bold">Your Direct Messages</h3>
            <p className="text-xs max-w-sm">
              Send private photos and messages to your AI companion.
            </p>
            <button
              onClick={onNewCharacter}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#0095f6] text-white shadow-md"
            >
              Send Message
            </button>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {activeCharacter && (
        <>
          <MemoryDrawer
            character={activeCharacter}
            memories={currentMemories}
            isOpen={showMemories}
            onClose={() => setShowMemories(false)}
            onMemoriesUpdated={(mems) => setMemoriesMap(prev => ({ ...prev, [activeCharacter.id]: mems }))}
            theme={theme}
          />

          <CharacterProfileModal
            character={activeCharacter}
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            onEdit={() => setShowEditor(true)}
            onClearChat={handleClearChat}
            onDelete={() => handleDeleteCharacter(activeCharacter.id)}
            theme={theme}
          />

          <CharacterEditorModal
            character={activeCharacter}
            isOpen={showEditor}
            onClose={() => setShowEditor(false)}
            onSaved={(updated) => {
              onCharactersUpdated(characters.map(c => c.id === updated.id ? updated : c));
            }}
            theme={theme}
          />

          <VoiceCallModal
            character={activeCharacter}
            isOpen={showCall}
            onClose={() => setShowCall(false)}
            theme={theme}
          />
        </>
      )}

      {/* Image Preview Lightbox */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEnlargedImage(null)}
        >
          <img
            src={enlargedImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
