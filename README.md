<div align="center">
   <h1>ActiveRecall Flashcards</h1>
  <p>Master any subject with <strong>Active Recall</strong> and <strong>FSRS (Free Spaced Repetition Scheduler)</strong>.</p>

  <p>
    <img src="https://img.shields.io/badge/react-19-blue?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/typescript-5.8-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/tailwindcss-4-blue?logo=tailwindcss" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
    <img src="https://img.shields.io/badge/PWA-ready-purple?logo=pwa" alt="PWA Ready" />
  </p>
</div>

---

## ✨ Features

- **Advanced Spaced Repetition (FSRS)** — Integrates the state-of-the-art Free Spaced Repetition Scheduler algorithm to optimize study intervals and maximize retention with minimal effort.
- **Limitless Storage (IndexedDB)** — Migrated from LocalStorage to IndexedDB, supporting infinite scalability and separating logs from card metadata entirely offline.
- **3D Flip Cards** — Smooth spring animations powered by Motion.
- **Cloze Deletion** — Create fill-in-the-blank cards with `{{answer}}` syntax.
- **Performance Dashboard** — Track streaks, mastery distribution, and study volume over time.
- **Import / Export Sharing** — Backup, restore, and share your individual cards or entire decks as JSON.
- **PWA & Offline-First** — Install on any device (iOS/Android/Desktop) and use 100% offline. Data never leaves your device.
- **i18n** — Interface fully available in English and Portuguese.
- **Dark Mode** — System, Light, and Dark high-contrast themes.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Motion |
| State | Zustand |
| Database | IndexedDB (natively wrapped via `idb`) |
| Algorithm | `ts-fsrs` (Free Spaced Repetition Scheduler) |
| Charts | Recharts |
| Build | Vite |
| Tests | Vitest |

## 📁 Project Structure

```
src/
├── domain/
│   ├── entities/          # Flashcard & StudyLog models
│   └── services/          # SRSEngine (FSRS implementation) & MigrationService
├── application/store/     # Zustand stores + IndexedDB Adapters
├── presentation/
│   ├── components/        # Reusable UI (Card, Typography)
│   ├── hooks/             # Custom hooks (PWA install, i18n, Shortcuts)
│   ├── layouts/           # MainLayout (sidebar, nav, footer)
│   └── pages/             # Dashboard, Study, Library, Settings
├── translations.ts        # i18n strings (en/pt)
└── main.tsx               # Application entry point
```

## 🚀 Getting Started

**Prerequisites:** Node.js >= 18

```bash
# Clone the repository
git clone https://github.com/HermesEsp/activerecall-flashcards.git
cd activerecall-flashcards

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## 📦 Production

We recommend standard static hosting (Vercel, Netlify, Cloudflare Pages, etc.) since the app is fully local and runs entirely in the browser.

```bash
# Build the production PWA bundle
npm run build

# Preview locally
npm run preview
```

## 🧪 Tests

```bash
npm test           # Run unit tests (FSRS edge cases & state)
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <p>Made with ☕ by <a href="https://github.com/HermesEsp">Hermes</a></p>
  <p>Licensed under <strong>MIT</strong> — Open Source and Sovereign.</p>
</div>
