import React, { useState } from 'react';
import { 
  Search, 
  Settings, 
  MoreVertical, 
  Moon, 
  Sun, 
  SquarePen, 
  ChevronDown,
  Trash2, 
  Edit3,
  Heart,
  Plus,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { Character, Message, User, PendingReplyInfo } from '../types';

interface ChatSidebarProps {
  characters: Character[];
  activeCharacterId: string | null;
  onSelectCharacter: (id: string) => void;
  onNewCharacter: () => void;
  onOpenSettings: () => void;
  onEditCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  messagesMap: Record<string, Message[]>;
  currentUser?: User | null;
  onOpenAccount?: () => void;
  pendingReplies?: Record<string, PendingReplyInfo>;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  characters,
  activeCharacterId,
  onSelectCharacter,
  onNewCharacter,
  onOpenSettings,
  onEditCharacter,
  onDeleteCharacter,
  theme,
  onToggleTheme,
  messagesMap,
  currentUser,
  onOpenAccount,
  pendingReplies = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredCharacters = characters.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.handle && c.handle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.introduction.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (iso?: string) => {
    if (!iso) return 'Active now';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffMins < 1) return 'Active now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Active now';
    }
  };

  return (
    <aside className={`w-full md:w-80 lg:w-96 flex flex-col h-full border-r select-none overflow-hidden ${
      theme === 'dark' ? 'bg-black border-[#262626] text-white' : 'bg-white border-[#dbdbdb] text-black'
    }`}>
      {/* Top Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b shrink-0 ${
        theme === 'dark' ? 'border-[#262626]' : 'border-[#dbdbdb]'
      }`}>
        {/* User Profile Pill with Down Arrow */}
        <div 
          onClick={onOpenAccount}
          className="flex items-center gap-2.5 cursor-pointer p-1 -ml-1 rounded-2xl hover:bg-white/[0.06] transition-colors group"
          title="Account Profile & Settings"
        >
          <div className="w-8 h-8 rounded-full p-[1.5px] velora-story-ring flex items-center justify-center shrink-0">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-full h-full rounded-full object-cover border border-black"
            />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm tracking-tight group-hover:text-[#FF6E5A] transition-colors">
                {currentUser?.handle ? `@${currentUser.handle}` : 'velora.direct'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              {characters.length} Active {characters.length === 1 ? 'GF' : 'GFs'}
            </span>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          {/* Quick Create New GF Icon Button */}
          <button
            onClick={onNewCharacter}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors relative"
            title="Create New Girlfriend"
          >
            <SquarePen className="w-4 h-4 text-[#FF3875]" />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Story Tray: Companion Switcher & "+ New GF" ── */}
      <div className={`px-3 py-2 border-b overflow-x-auto scrollbar-none flex items-center gap-3 shrink-0 ${
        theme === 'dark' ? 'border-[#262626]/80 bg-[#09090b]' : 'border-[#dbdbdb]/80 bg-[#f9f9f9]'
      }`}>
        {/* "+ New Girlfriend" Story Circle */}
        <button
          onClick={onNewCharacter}
          className="flex flex-col items-center gap-1 group shrink-0 w-14"
          title="Create New Girlfriend"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#FF3875]/60 hover:border-[#FF3875] bg-gradient-to-tr from-[#962FBF]/20 to-[#FF3875]/20 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 shadow-sm shrink-0">
            <Plus className="w-5 h-5 text-[#FF6E5A]" />
          </div>
          <span className="text-[10px] font-bold text-[#FF6E5A] group-hover:text-white transition-colors truncate w-full text-center">
            + New GF
          </span>
        </button>

        {/* User's existing companions as story bubbles */}
        {characters.map(char => {
          const isActive = char.id === activeCharacterId;
          return (
            <button
              key={char.id}
              onClick={() => onSelectCharacter(char.id)}
              className="flex flex-col items-center gap-1 group shrink-0 w-14 relative"
              title={`Chat with ${char.name}`}
            >
              <div className={`w-12 h-12 rounded-full p-[2px] transition-all group-hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 ${
                isActive 
                  ? 'velora-story-ring ring-2 ring-white/20' 
                  : 'velora-story-ring opacity-80 group-hover:opacity-100'
              }`}>
                <img
                  src={char.avatar}
                  alt={char.name}
                  className="w-full h-full rounded-full object-cover border border-black/40 block"
                />
              </div>
              <span className={`text-[10px] font-medium truncate w-full text-center ${
                isActive ? 'text-white font-bold' : 'text-zinc-400 group-hover:text-zinc-200'
              }`}>
                {char.name.split(' ')[0]}
              </span>
              <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="p-3 shrink-0">
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs ${
          theme === 'dark' ? 'bg-[#18181b] text-gray-300' : 'bg-[#efefef] text-gray-800'
        }`}>
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Direct messages..."
            className="w-full bg-transparent focus:outline-none placeholder-gray-500 text-xs"
          />
        </div>
      </div>

      {/* Messages Thread List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-0.5">
        <div className="px-3 py-1 flex items-center justify-between text-xs font-bold text-gray-400">
          <span>Direct Messages</span>
          <button
            onClick={onNewCharacter}
            className="text-[11px] font-bold text-[#FF6E5A] hover:text-white flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>New GF</span>
          </button>
        </div>

        {filteredCharacters.length === 0 ? (
          <div className="py-12 px-4 text-center text-gray-500 space-y-3">
            <Heart className="w-8 h-8 text-[#FF3875]/40 mx-auto" />
            <p className="text-xs">No conversations yet</p>
            <button
              onClick={onNewCharacter}
              className="px-4 py-1.5 rounded-full text-xs font-bold velora-gradient text-white shadow-sm"
            >
              + Create Girlfriend
            </button>
          </div>
        ) : (
          filteredCharacters.map((char) => {
            const isActive = char.id === activeCharacterId;
            const history = messagesMap[char.id] || [];
            const lastMsg = history[history.length - 1];

            return (
              <div
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all my-0.5 relative group ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-[#18181b]'
                      : 'bg-[#efefef]'
                    : theme === 'dark'
                    ? 'hover:bg-[#18181b]/60'
                    : 'hover:bg-gray-100'
                }`}
              >
                {/* Avatar with status */}
                <div className="relative flex-shrink-0">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-700/60"
                  />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 ${
                    theme === 'dark' ? 'border-black' : 'border-white'
                  }`} />
                </div>

                {/* Text Thread details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm truncate flex items-center gap-1.5">
                      {char.name}
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-pink-500/20 text-pink-400">
                        Lvl {char.relationship_level}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <p className="truncate text-xs max-w-[170px]">
                      {pendingReplies[char.id]?.isTyping ? (
                        <span className="text-pink-400 font-semibold animate-pulse">typing...</span>
                      ) : lastMsg ? (
                        <span>{lastMsg.sender === 'user' ? `You: ${lastMsg.message}` : lastMsg.message}</span>
                      ) : (
                        <span>{char.introduction}</span>
                      )}
                    </p>
                    <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">
                      {pendingReplies[char.id]?.isTyping || pendingReplies[char.id]?.isSeen ? (
                        <span className="text-pink-400 font-medium">Seen</span>
                      ) : pendingReplies[char.id] ? (
                        <span>Delivered</span>
                      ) : lastMsg?.sender === 'user' ? (
                        <span>{lastMsg.status === 'read' || lastMsg.status === 'seen' ? 'Seen' : 'Delivered'}</span>
                      ) : lastMsg ? (
                        <span>Seen</span>
                      ) : null}
                    </span>
                  </div>
                </div>

                {/* Options kebab */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === char.id ? null : char.id)}
                    className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpenId === char.id && (
                    <div className={`absolute right-0 top-6 z-40 w-36 rounded-2xl border shadow-2xl p-1 text-xs animate-slide-up ${
                      theme === 'dark' ? 'bg-[#262626] border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
                    }`}>
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          onEditCharacter(char);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-700/40 flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          onDeleteCharacter(char.id);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky "+ Create New Girlfriend" Action */}
      <div className={`p-3 border-t shrink-0 ${
        theme === 'dark' ? 'border-[#262626]' : 'border-[#dbdbdb]'
      }`}>
        <button
          onClick={onNewCharacter}
          className="w-full py-2.5 rounded-2xl text-xs font-bold velora-gradient hover:opacity-95 text-white transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>+ Create New Girlfriend</span>
        </button>
      </div>
    </aside>
  );
};
