import React, { useState } from 'react';
import { X, Brain, Plus, Trash2, Edit2, Check, Sparkles, AlertCircle, Heart } from 'lucide-react';
import { Memory, Character } from '../types';
import { addMemory, updateMemory, deleteMemory } from '../services/api';

interface MemoryDrawerProps {
  character: Character;
  memories: Memory[];
  isOpen: boolean;
  onClose: () => void;
  onMemoriesUpdated: (memories: Memory[]) => void;
  theme: 'dark' | 'light';
}

export const MemoryDrawer: React.FC<MemoryDrawerProps> = ({
  character,
  memories,
  isOpen,
  onClose,
  onMemoriesUpdated,
  theme
}) => {
  if (!isOpen) return null;

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'personal' | 'preference' | 'hobby' | 'event' | 'inside_joke' | 'general'>('preference');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const filteredMemories = filterCategory === 'all'
    ? memories
    : memories.filter(m => m.category === filterCategory);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const created = await addMemory(character.id, {
        memory_content: newContent.trim(),
        category: newCategory,
        importance: 4
      });
      onMemoriesUpdated([created, ...memories]);
      setNewContent('');
      setIsAdding(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add memory');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const updated = await updateMemory(character.id, id, { memory_content: editContent.trim() });
      onMemoriesUpdated(memories.map(m => m.id === id ? updated : m));
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update memory');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMemory(character.id, id);
      onMemoriesUpdated(memories.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete memory');
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'preference': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'hobby': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'personal': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'event': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'inside_joke': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l transition-all ${
        theme === 'dark' ? 'bg-[#121212] border-[#262626] text-white' : 'bg-white border-[#dbdbdb] text-black'
      }`}>
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${
          theme === 'dark' ? 'bg-black border-[#262626]' : 'bg-white border-[#dbdbdb]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{character.name}'s Memory Bank</h3>
              <p className="text-[11px] text-gray-400">{memories.length} facts remembered</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className={`p-3 text-xs flex items-start gap-2 border-b ${
          theme === 'dark' ? 'bg-[#18181b] border-[#262626] text-gray-400' : 'bg-purple-50 border-purple-100 text-purple-800'
        }`}>
          <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
          <span>
            {character.name} recalls these personal details during Direct messages to make conversations deeply personal and authentic.
          </span>
        </div>

        {/* Categories Bar */}
        <div className={`p-3 flex items-center gap-1.5 overflow-x-auto border-b text-xs ${
          theme === 'dark' ? 'border-[#262626]' : 'border-[#dbdbdb]'
        }`}>
          {['all', 'personal', 'preference', 'hobby', 'event', 'inside_joke'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : theme === 'dark'
                  ? 'bg-[#18181b] text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Memories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isAdding && (
            <form onSubmit={handleAdd} className={`p-4 rounded-2xl border space-y-3 ${
              theme === 'dark' ? 'bg-[#18181b] border-purple-500/40' : 'bg-gray-50 border-purple-400 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400">Add New Memory</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <textarea
                rows={2}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="e.g. User has a cat named Luna who sleeps on keyboard..."
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 ${
                  theme === 'dark' ? 'bg-[#262626] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                autoFocus
              />

              <div className="flex items-center justify-between gap-2">
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className={`px-2 py-1.5 rounded-lg border text-xs ${
                    theme === 'dark' ? 'bg-[#262626] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="preference">Preference</option>
                  <option value="hobby">Hobby</option>
                  <option value="personal">Personal</option>
                  <option value="event">Important Event</option>
                  <option value="inside_joke">Inside Joke</option>
                  <option value="general">General</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#0095f6] hover:bg-[#1877f2] text-white transition-all shadow-sm"
                >
                  Save Fact
                </button>
              </div>
            </form>
          )}

          {filteredMemories.length === 0 && !isAdding ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <Brain className="w-10 h-10 mx-auto text-gray-600" />
              <p className="text-sm">No memories in this category yet.</p>
              <p className="text-xs text-gray-500">
                Mention your favorite things in chat, or manually click "+ Add Memory".
              </p>
            </div>
          ) : (
            filteredMemories.map(mem => (
              <div
                key={mem.id}
                className={`p-3.5 rounded-2xl border transition-all group ${
                  theme === 'dark'
                    ? 'bg-[#182229] border-gray-800 hover:border-gray-700'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${getCategoryBadgeColor(mem.category)}`}>
                    {mem.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(mem.id);
                        setEditContent(mem.memory_content);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-emerald-400"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="p-1 rounded text-gray-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === mem.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      rows={2}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        theme === 'dark' ? 'bg-[#202c33] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(mem.id)}
                        className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed">{mem.memory_content}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'bg-black border-[#262626]' : 'bg-gray-50 border-gray-200'
        }`}>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-[#0095f6] hover:bg-[#1877f2] text-white transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Memory Fact Manually
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

