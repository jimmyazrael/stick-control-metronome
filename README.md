# Stick Control Metronome

A modern, touch-friendly metronome web app designed for practicing exercises from [Stick Control for the Snare Drummer][stick-control].

**Live App:** [https://jimmyazrael.github.io/stick-control-metronome/][metronome]

## Features

- 🎵 **Precise timing** - Web Audio API for accurate beat scheduling
- 📱 **Touch-friendly UI** - Large buttons and responsive design optimized for mobile
- 🔄 **Pause/Resume** - Pause mid-practice and resume from repetition or exercise start
- 🗣️ **Vocal cues** - Announces last 3 repetitions of each exercise (3, 2, 1)
- 📊 **Progress tracking** - Real-time display of exercise, repetition, and bar
- 🎨 **Visual feedback** - Screen flashing on last bar, highlighted beat indicators
- 💾 **Settings persistence** - All configurations saved across sessions
- 📋 **Preset management** - Save, load, rename, and delete custom presets
- ❓ **Contextual help** - Help icons explain each setting
- 🌙 **Dark mode** - Automatic dark theme support

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Web Audio API** - Audio generation and scheduling
- **Web Speech API** - Vocal countdown announcements

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── audio/          # Web Audio API classes
│   ├── AudioContext.js    # Audio context lifecycle management
│   ├── Beeper.js          # Metronome beat scheduling
│   ├── AudioClicks.js     # Click sound generators
│   └── SpeechSynthesis.js # Vocal announcements
├── components/     # React components (future expansion)
├── hooks/          # React hooks
│   └── useMetronome.js    # Main metronome state management
├── utils/          # Utility functions
│   ├── patterns.js        # Pattern parsing
│   ├── formatting.js      # Time/progress formatting
│   └── constants.js       # App constants
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions on push to `main` branch.

## License

[MIT License](LICENSE)

[metronome]: https://jimmyazrael.github.io/stick-control-metronome/
[stick-control]: https://www.stonepercussionbooks.com/stick-control.html
