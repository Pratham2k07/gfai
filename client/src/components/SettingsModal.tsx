import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Cpu, 
  BellRing,
  Lock,
  Sparkles,
  Clock,
  Zap
} from 'lucide-react';
import { AppSettings } from '../types';
import { updateSettings, testApiKey } from '../services/api';
import { soundFX } from '../utils/audio';

interface SettingsModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: (updated: AppSettings) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSettingsUpdated,
  theme,
  onToggleTheme
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'groq' | 'openrouter'>(settings.apiProvider || 'gemini');
  const [model, setModel] = useState(settings.model || 'gemini-3.8-flash');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);
  const [proactiveMessages, setProactiveMessages] = useState(settings.proactiveMessages ?? true);
  const [realisticDelays, setRealisticDelays] = useState(settings.realisticDelays ?? true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const currentHour = new Date().getHours();
  const isNightNow = currentHour >= 22 || currentHour < 6;

  const handleTestKey = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await testApiKey(apiKey, provider);
      setTestResult(res);
      if (res.success) {
        soundFX.playLevelUp();
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Key test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateSettings({
        apiKey,
        apiProvider: provider,
        model,
        soundEnabled,
        proactiveMessages,
        realisticDelays,
        theme
      });
      soundFX.setEnabled(soundEnabled);
      onSettingsUpdated(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        theme === 'dark' ? 'bg-[#111b21] border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          theme === 'dark' ? 'bg-[#202c33] border-gray-800' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Platform & AI Settings</h3>
              <p className="text-xs text-gray-400">Configure your real LLM backend and preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* AI Model & Credentials Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                AI Provider & API Key
              </label>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                settings.hasApiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {settings.hasApiKey ? '✓ API Key Active' : '⚠️ No Key Configured'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'gemini', label: 'Google Gemini', desc: 'Recommended (Free)' },
                { id: 'groq', label: 'Groq', desc: 'Ultra-fast Llama' },
                { id: 'openai', label: 'OpenAI', desc: 'GPT-4o Mini' },
                { id: 'openrouter', label: 'OpenRouter', desc: 'Multi-model' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProvider(p.id as any);
                    if (p.id === 'gemini') setModel('gemini-3.8-flash');
                    else if (p.id === 'groq') setModel('llama-3.3-70b-versatile');
                    else if (p.id === 'openai') setModel('gpt-4o-mini');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    provider === p.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm'
                      : theme === 'dark'
                      ? 'bg-[#182229] border-gray-700 text-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-bold text-xs">{p.label}</div>
                  <div className="text-[10px] opacity-75">{p.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-400">
                  {provider.toUpperCase()} API Key
                </label>
                {provider === 'gemini' && (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Get Free Gemini Key <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder={settings.hasApiKey ? '••••••••••••••••••••••••' : `Paste your ${provider} API key here...`}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className={`w-full pl-3 pr-20 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    theme === 'dark' ? 'bg-[#182229] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testing}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test Key'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500">
                <Lock className="w-3.5 h-3.5" />
                <span>Keys are safely handled on your backend server and never exposed to the browser.</span>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Model Selection</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. gemini-1.5-flash, gemini-2.0-flash, gpt-4o-mini"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  theme === 'dark' ? 'bg-[#182229] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <hr className={theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} />

          {/* Preferences */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              User Experience Preferences
            </h4>

            {/* Realistic Human Reply Delays */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-pink-400" />
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>Realistic Reply Delays</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-400 font-bold">
                        Recommended
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Simulates authentic human pacing instead of instant replies every time
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={realisticDelays}
                  onChange={e => setRealisticDelays(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-500 cursor-pointer"
                />
              </div>

              {realisticDelays && (
                <div className={`p-3 rounded-2xl text-xs space-y-2 ${
                  theme === 'dark' ? 'bg-[#18181b] border border-gray-800' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="font-bold text-[10px] text-pink-400 uppercase tracking-wider">
                    Timing Distribution Rules
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>☀️</span>
                        <span className="font-medium">Daytime (6 AM – 10 PM):</span>
                      </span>
                      <span className="text-gray-400 text-[10px] font-mono">
                        Instant (35%) • 2-5m (45%) • ~10m (20%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>🌙</span>
                        <span className="font-medium text-purple-300">Night (10 PM – 6 AM):</span>
                      </span>
                      <span className="text-emerald-400 font-semibold text-[10px] font-mono">
                        Fast within 1-2 min
                      </span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-gray-700/30 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Your device time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      isNightNow ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {isNightNow ? '🌙 Night mode active' : '☀️ Daytime mode active'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                <div>
                  <div className="font-semibold text-xs">Direct Message Chimes</div>
                  <div className="text-[11px] text-gray-400">Crisp Web Audio notification pops on incoming and outgoing DMs</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={e => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 cursor-pointer"
              />
            </div>

            {/* Proactive Check-ins */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-semibold text-xs">Spontaneous Proactive DMs</div>
                  <div className="text-[11px] text-gray-400">Allow your companion to send spontaneous DMs when you click check-in</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={proactiveMessages}
                onChange={e => setProactiveMessages(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 cursor-pointer"
              />
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <div>
                  <div className="font-semibold text-xs">Theme Mode</div>
                  <div className="text-[11px] text-gray-400">Instagram Dark or Light appearance</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-yellow-400' : 'bg-gray-100 border-gray-300 text-gray-800'
                }`}
              >
                {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 flex items-center justify-end gap-3 border-t ${
          theme === 'dark' ? 'bg-black border-[#262626]' : 'bg-gray-50 border-[#dbdbdb]'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#0095f6] hover:bg-[#1877f2] text-white transition-all shadow-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

