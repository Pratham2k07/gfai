import React, { useState, useRef, useEffect } from 'react';
import { 
  Smile, 
  Image as ImageIcon, 
  Mic, 
  Heart, 
  X, 
  Camera
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface ChatInputProps {
  onSendMessage: (text: string, mediaUrl?: string, mediaType?: 'image' | 'audio') => void;
  disabled?: boolean;
  theme: 'dark' | 'light';
  placeholder?: string;
}

const POPULAR_EMOJIS = [
  '❤️', '💖', '🥰', '😘', '🥺', '😊', '✨', '☕', 
  '🌸', '🌹', '💅', '👀', '🔥', '🤗', '😴', '🥞',
  '🎉', '😂', '💀', '💯', '🙈', '🍷', '🍕', '🐱'
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
  theme,
  placeholder = "Message..."
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (disabled) return;
    if (!text.trim() && !attachedImage) return;

    soundFX.playSent();
    onSendMessage(
      text.trim(),
      attachedImage || undefined,
      attachedImage ? 'image' : undefined
    );

    setText('');
    setAttachedImage(null);
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Instant Instagram Quick Heart button
  const handleQuickHeart = () => {
    if (disabled) return;
    soundFX.playHeart();
    onSendMessage('❤️');
  };

  // Simulated Voice Note
  const handleSendVoiceNote = () => {
    if (disabled) return;
    soundFX.playSent();
    onSendMessage(
      "🎵 [Voice Note - 0:04]",
      undefined,
      'audio'
    );
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [text]);

  const hasContent = text.trim().length > 0 || attachedImage !== null;

  return (
    <div className={`p-3 sm:p-4 select-none ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Attached Image Preview */}
      {attachedImage && (
        <div className="mb-2 p-2 rounded-2xl flex items-center justify-between bg-[#1f1f23] border border-purple-500/30">
          <div className="flex items-center gap-2">
            <img src={attachedImage} alt="Attachment" className="w-12 h-12 object-cover rounded-xl" />
            <span className="text-xs text-gray-300">Photo ready to send</span>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className={`absolute bottom-20 left-4 p-3 rounded-3xl border shadow-2xl z-30 w-72 animate-slide-up ${
          theme === 'dark' ? 'bg-[#18181b] border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
        }`}>
          <div className="flex justify-between items-center mb-2 text-xs font-semibold text-gray-400">
            <span>Expressions & Reactions</span>
            <button onClick={() => setShowEmojiPicker(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {POPULAR_EMOJIS.map((em, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertEmoji(em)}
                className="text-xl p-1.5 rounded-xl hover:bg-gray-700/30 transition-all text-center"
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instagram Pill Input Capsule */}
      <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all ${
        theme === 'dark'
          ? 'bg-[#121212] border-[#2f2f35] focus-within:border-gray-500'
          : 'bg-[#fafafa] border-[#dbdbdb] focus-within:border-gray-400 shadow-sm'
      }`}>
        {/* Blue Camera Icon */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 rounded-full bg-[#0095f6] hover:bg-[#1877f2] text-white flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
          title="Send photo"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Text Area */}
        <div className="flex-1 flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent resize-none text-[14px] focus:outline-none max-h-24 placeholder-gray-500 leading-snug py-1"
          />
        </div>

        {/* File input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* Action Buttons inside capsule */}
        {hasContent ? (
          /* Send button */
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="text-[#0095f6] hover:text-[#1877f2] font-bold text-sm px-2 py-1 transition-transform active:scale-95 disabled:opacity-50"
          >
            Send
          </button>
        ) : (
          /* Icon set: Voice, Gallery, Emoji, and Quick Heart */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendVoiceNote}
              disabled={disabled}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Voice note"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Attach photo"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Quick Heart */}
            <button
              type="button"
              onClick={handleQuickHeart}
              disabled={disabled}
              className="p-1 text-rose-500 hover:scale-115 transition-transform"
              title="Send Heart"
            >
              <Heart className="w-5 h-5 fill-rose-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
