# 中文商务 · Business Chinese Learning Module

A structured, interactive Mandarin learning tool built for professionals who need practical Chinese — not textbook Chinese. Covers 16 lessons across 4 phases, from Pinyin fundamentals to contract language and negotiation, with audio pronunciation powered by Google TTS.

**[Live Demo →](https://your-deployment-url.vercel.app)** &nbsp;|&nbsp; Built with React · Google TTS · Web Speech API

---

![Business Chinese Module Screenshot](./screenshot.png)

---

## Why This Exists

Most Chinese learning apps teach you to order coffee. This one teaches you to negotiate a supplier contract, run a business meeting, write a formal email, and understand why a signature alone isn't enough to make a Chinese contract valid.

Built for my own use — I hear and speak some Mandarin from trilingual exposure (English, Indonesian, Mandarin) but had no formal literacy. I needed business-level reading and writing, not conversational basics. So I built the curriculum I couldn't find.

---

## Features

- **16 structured lessons** across 4 progressive phases — from Pinyin and tone system to contracts and advanced etiquette
- **48 business vocabulary flashcards** with phase filtering (P1 / P2 / P3 / P4 / All)
- **Audio pronunciation** on every character and phrase via Google Translate TTS, with Web Speech API fallback
- **Audio diagnostics** — a test button that tells you exactly which audio method works on your device
- **Recognition quiz** — 24 questions spanning all 4 phases, with instant pinyin feedback
- **Interactive tone explorer** — tap to expand each tone with example word and business usage
- **Full lesson navigation** — linear phase flow with back/next controls and direct lesson jumping
- **Mobile-first layout** — designed for a 480px screen, works on Chrome desktop and mobile

---

## Curriculum

### Phase 1 · Pinyin & Literacy (Weeks 1–4)
*Bridge what you already hear → written form*
1. The Pinyin Bridge — connect spoken sounds to written notation
2. The 4 Tones — why tone errors cost you in business negotiations
3. Radicals — decode unfamiliar characters using 6 high-value building blocks
4. First Business Characters — 12 foundational professional words

### Phase 2 · Business Vocabulary (Weeks 5–10)
*300 characters for professional use*

5. Professional Greetings — 您好 vs 你好, first-meeting script, business card etiquette
6. Numbers & Money — the 万 (10,000) unit, RMB, price phrases, reading business figures
7. Company Structure — full hierarchy from 董事长 to 员工, departments, title addressing rules
8. Business Culture — 关系, 面子, dinner toasts, the social layer behind every deal

### Phase 3 · Professional Communication (Weeks 11–18)
*Emails, meetings, negotiations*

9. Business Email Writing — anatomy of a formal Chinese email, full sample, 此致敬礼 explained
10. Meeting Language — opening to action items, polite disagreement formula
11. Negotiation Phrases — full arc from interest to 成交, anchor-and-counter dynamics
12. Formal vs Casual Register — 6 side-by-side comparisons, when 兹 appears and never spoken aloud

### Phase 4 · Advanced Fluency (Weeks 19–26)
*Contracts, presentations, industry vocabulary, protocol*

13. Contract Language — 甲方/乙方, 违约金, 不可抗力, the chop rule, 4 full contract sentences
14. Business Presentations — 6-stage phrase toolkit, buying time in Q&A
15. Industry Vocabulary — F&B sourcing terms (MOQ, shelf life, wholesale price) + tech/digital terms (AI, data analysis, digital transformation, ROI)
16. Etiquette & Protocol — gift giving rules, banquet seating, drinking culture, 红包, factory visits, holiday greetings

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React (functional components, hooks) |
| Styling | CSS-in-JS inline styles, mobile-first |
| Primary audio | Google Translate TTS (`/translate_tts` audio element) |
| Fallback audio | Web Speech API (`SpeechSynthesisUtterance`, zh-CN) |
| State management | React `useState` (no external library) |
| Deployment | Vercel / Netlify (static) |
| Build environment | Claude.ai Artifacts (React sandbox) |

---

## Getting Started

### Run locally

```bash
# Clone the repo
git clone https://github.com/your-username/business-chinese-module.git
cd business-chinese-module

# Install dependencies
npm install

# Start development server
npm start
```

The app runs on `http://localhost:3000`.

### Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo directly to [vercel.com](https://vercel.com) — it auto-detects React and deploys in under two minutes.

### Audio setup

Audio works out of the box in Chrome (desktop and Android) and Safari (iOS) via Google TTS — no voice installation required. If Google TTS is blocked on your network, install a Chinese (zh-CN) voice in your device's accessibility/text-to-speech settings for Web Speech API fallback.

Use the **"Test Audio"** button in the Learn tab to diagnose which method works on your device.

---

## Project Structure

```
src/
├── chinese-learning-module.jsx   # Single-file React app (all components, data, lessons)
public/
├── index.html
README.md
screenshot.png
```

All lesson content, vocabulary data, and UI components live in a single `.jsx` file. This was intentional for the artifact build environment and makes the full codebase readable in one pass.

---

## Content Notes

The business vocabulary, cultural notes, and phrase library are compiled from:
- Professional Mandarin business communication references
- Chinese contract and legal document conventions (CIETAC, standard PRC contract formats)
- Chinese business etiquette literature

> ⚠️ **Content review in progress.** Phrase accuracy and naturalness is being reviewed by a native Mandarin-speaking business professional. If you spot errors or awkward phrasing, please open an issue — corrections are welcome.

---

## Building Process

This project was built collaboratively using Claude (Anthropic) as a coding partner. The breakdown:

- **My contributions:** curriculum design, phase sequencing, vocabulary selection, cultural content, feature specifications, debugging (the audio fallback system was a multi-session problem), and all product decisions
- **Claude's contributions:** React component architecture, JSX implementation, CSS-in-JS styling

This reflects how I work with AI tools — I direct and decide; the AI implements and suggests. The audio diagnostic system (detecting whether Google TTS or Web Speech API is available and surfacing a specific error message) came from a real debugging session after the Web Speech API was found to be sandboxed in the Claude.ai artifact iframe.

---

## Roadmap

- [ ] Spaced repetition algorithm for flashcards (SM-2)
- [ ] Conversation simulator using Claude API (type your Chinese, get a response in character as a Chinese business contact)
- [ ] Listening drill mode (hear the audio, identify the character)
- [ ] Stroke order animations using Hanzi Writer
- [ ] Progress persistence using localStorage
- [ ] HSK level tags on vocabulary items
- [ ] Phase 5: Chinese for specific industries (manufacturing, F&B supply chain, tech partnerships)

---

## About the Builder

**Edo Sanjaya P (Jericho)** — Operations manager, F&B founder (Pinya Co., Bandung), ML Engineering Intern at FlyRank AI, and AI annotation specialist. Trilingual in English, Indonesian, and Mandarin.

Built this to close my own literacy gap before supplier negotiations with Chinese partners. Now using it as a daily study tool alongside the 26-week curriculum.

[LinkedIn](https://linkedin.com/in/your-profile) · [Notion Portfolio](https://your-notion-link) · [Upwork](https://your-upwork-link)

---

## License

MIT — free to use, modify, and distribute. If you build on this, a mention would be appreciated but is not required.

---

*"The best time to learn business Chinese was before your first supplier meeting. The second best time is now."*
