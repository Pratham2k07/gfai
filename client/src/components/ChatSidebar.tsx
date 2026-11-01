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
  Heart
} from 'lucide-react';
import { Character, Message } from '../types';

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
  messagesMap
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
    <aside className={`w-full md:w-80 lg:w-96 flex flex-col h-full border-r select-none ${
      theme === 'dark' ? 'bg-black border-[#262626] text-white' : 'bg-white border-[#dbdbdb] text-black'
    }`}>
      {/* Top Header */}
      <div className={`px-5 py-4 flex items-center justify-between border-b ${
        theme === 'dark' ? 'border-[#262626]' : 'border-[#dbdbdb]'
      }`}>
        {/* Username with Down Arrow */}
        <div className="flex items-center gap-1.5 cursor-pointer">
          <span className="font-extrabold text-lg tracking-tight">velora.direct</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>

          <button
            onClick={onNewCharacter}
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
            title="New Companion"
          >
            <SquarePen className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
            title="Settings & API Key"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3">
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
      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-3 py-1 flex items-center justify-between text-xs font-bold text-gray-400">
          <span>Messages</span>
          <span className="text-pink-400 cursor-pointer" onClick={onNewCharacter}>+ New</span>
        </div>

        {filteredCharacters.length === 0 ? (
          <div className="py-12 px-4 text-center text-gray-500 space-y-2">
            <p className="text-xs">No conversations found</p>
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
                      {lastMsg ? (
                        <span>{lastMsg.sender === 'user' ? `You: ${lastMsg.message}` : lastMsg.message}</span>
                      ) : (
                        <span>{char.introduction}</span>
                      )}
                    </p>
                    <span className="text-[11px] text-gray-500 flex-shrink-0">
                      • {formatMessageTime(lastMsg?.timestamp)}
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

      {/* Bottom CTA */}
      <div className={`p-3 border-t ${
        theme === 'dark' ? 'border-[#262626]' : 'border-[#dbdbdb]'
      }`}>
        <button
          onClick={onNewCharacter}
          className="w-full py-2.5 rounded-2xl text-xs font-bold velora-gradient hover:opacity-95 text-white transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Heart className="w-4 h-4 fill-white" />
          Create New Companion
        </button>
      </div>
    </aside>
  );
};
