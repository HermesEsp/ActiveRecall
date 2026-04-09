<div align="center">
  <img width="1200" height="475" alt="ActiveRecall Flashcards" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>ActiveRecall Flashcards</h1>
  <p>Master any subject with <strong>Active Recall</strong> and <strong>Spaced Repetition</strong>.</p>

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

- **Spaced Repetition Algorithm** — Cards you fail reset to Level 0; cards you master increase their review interval (1d → 3d → 7d → 14d → 30d)
- **3D Flip Cards** — Smooth spring animations powered by Motion
- **Cloze Deletion** — Create fill-in-the-blank cards with `{{answer}}` syntax
- **Performance Dashboard** — Track streaks, mastery distribution, and study volume over time
- **Dark Mode** — System, Light, and Dark themes
- **PWA** — Install on any device and use offline
- **i18n** — English and Portuguese
- **Import / Export** — Backup and restore your data as JSON
- **Cloud Backup** — Google Drive integration (coming soon)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Motion |
| State | Zustand (persisted to LocalStorage) |
| Charts | Recharts |
| Server | Express, Helmet, CORS, Rate Limiting |
| Build | Vite |
| Tests | Vitest |

## 📁 Project Structure

```
src/
├── domain/entities/       # Flashcard & StudyLog types
├── application/store/     # Zustand store (mastery, streak, spaced repetition)
├── presentation/
│   ├── components/        # Reusable UI (Card)
│   ├── hooks/             # Custom hooks (PWA install)
│   ├── layouts/           # MainLayout (header, nav, footer)
│   └── pages/             # Dashboard, Study, Library, Settings
├── lib/                   # Utilities (cn)
├── translations.ts        # i18n strings (en/pt)
├── App.tsx                # Router + ErrorBoundary
└── main.tsx               # Entry point + SW registration
```

## 🚀 Getting Started

**Prerequisites:** Node.js >= 18

```bash
# Clone the repository
git clone https://github.com/frdev/activerecall-flashcards.git
cd activerecall-flashcards

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY (optional)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📦 Production

```bash
# Build frontend + server
npm run build

# Start production server
ALLOWED_ORIGIN=https://yourdomain.com npm start
```

## 🧪 Tests

```bash
npm test           # Run once
npm run test:watch # Watch mode
```

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |
| `ALLOWED_ORIGIN` | Production | CORS allowed origin |
| `PORT` | No | Server port (default: 3000) |

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <p>Made with ☕ by <a href="https://github.com/frdev">frdev</a></p>
</div>
