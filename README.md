# Aura AI | Customizable AI Companion — Instagram Direct Experience

> A premium, modern, fully responsive AI Companion platform where users create their own virtual girlfriend, customize her personality, sliders, and appearance, and chat with her in an authentic **Instagram Direct Message (DM)** environment.

---

## ✨ Key Platform Features

### 1. Authentic Instagram DM Interface
- **Pitch-Black Minimalist Aesthetic:** Deep black dark mode (`#000000`) and clean white light mode with zero wallpaper clutter.
- **Instagram Signature Gradient Bubbles:** Outgoing user messages rendered in vibrant Instagram gradients (`linear-gradient(135deg, #6366f1, #a855f7, #ec4899)`) with smooth pill geometry (`rounded-[22px]`).
- **Incoming Messages with Companion Mini-Avatar:** Sleek neutral gray bubbles (`#262626` / `#efefef`) with companion avatar.
- **Double-Tap to Like Reaction (❤️):** Double-tap any message to add an animated Instagram heart reaction badge.
- **Instagram Stories & Notes Tray:** Top horizontal tray of companion avatars with dynamic Instagram story rings (`ig-story-ring`) and green active dots.
- **Pill-Shaped Input Capsule:**
  - Blue camera quick-send icon.
  - Capsule text input with "Message..." placeholder.
  - Quick Heart button ❤️ when input is empty.
  - Blue bold "Send" button when text is typed.
  - Image attachments and voice notes.
- **Instagram Audio Calling & Voice Notes:** Simulated Instagram Direct call overlay with story ring avatars and animated audio waveform visualizers.
- **Mobile Responsive:** Seamless switching between the inbox message list and the active conversation with a back button.

### 2. Multi-Step Companion Creator & Customizer
- **Identity & Story:** Name, Instagram handle (`@aanya.sharma`), age (18+ verification enforced), curated avatar gallery or upload/URL, custom greeting text, and backstory with quick inspiration presets.
- **Appearance Customization:** Hair color, hairstyle, eye color, clothing style, and aesthetic demeanor.
- **Personality Blend:** Multi-select combinable personality archetypes (*Caring & Affectionate*, *Romantic*, *Shy & Introverted*, *Funny & Playful*, *Savage & Sarcastic*, *Intelligent & Mature*, *Slightly Possessive*, *Calm & Understanding*).
- **7 Behaviour Sliders (0-100%):** Affection, Romantic behaviour, Humour, Jealousy, Talkativeness, Emotional expressiveness, Playfulness.
- **Communication Preferences:** English, Hindi, and urban Hinglish; Casual, Flirty, Formal; Short, Balanced, Detailed; Emojis toggle.

### 3. Real LLM AI Integration
- **Google GenAI SDK (`@google/genai`):** Compatible with `gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`, plus Groq, OpenAI (`gpt-4o-mini`), and OpenRouter.
- **Behavioral Prompt Generator:** Prompts are dynamically generated incorporating character backstory, personality blend, behavioral sliders, communication preferences, relationship progression stage, and persistent memories.
- **Security:** Keys remain strictly on the backend and are never exposed in frontend code.

### 4. Persistent Memory Bank
- Remembers user's name, hobbies, favorite things, important events, and previous discussions.
- Automatic memory detection and manual Memory Drawer (add, edit, delete).

### 5. Relationship Progression
- 5 Intimacy Ranks: **Level 1 (Acquaintance)** → **Level 2 (Getting Familiar)** → **Level 3 (Close Connection)** → **Level 4 (Romantic Dating)** → **Level 5 (Soulmates)**.

---

## 🚀 Quick Start

```powershell
# Run backend + frontend in dev mode:
npm run dev

# Or build and run production server:
npm run build
npm start
```
Visit **`http://localhost:5000`** in your browser!
