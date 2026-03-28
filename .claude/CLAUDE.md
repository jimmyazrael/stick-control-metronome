# stick-control-metronome

## Description
stick-control-metronome is a web app deployed on github.io, aiming to serve as a metronome to be used for practicing exercises in the book "Stick Control".

**Tech Stack:** React + Vite + Tailwind CSS

## Build And Test

- `npm run dev` - Start development server (http://localhost:5173/stick-control-metronome/)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

- `src/audio/` - Web Audio API classes (Beeper, AudioClicks, AudioContext with lifecycle fixes)
- `src/components/` - React UI components
- `src/hooks/` - React hooks (useMetronome for state management)
- `src/utils/` - Utility functions (patterns, formatting, constants)
- `public/` - Static assets (data.json, favicon)
- `index-old.html` - Original vanilla JS implementation (archived)


## Architecture Boundaries

- Do not put persistence logic in handlers

## Coding Conventions

- Prefer pure functions in domain layer
- Do not introduce new global state without explicit justification

## Safety Rails

## NEVER

- Modify `.env`, lockfiles, or CI secrets without explicit approval
- Remove feature flags without searching all call sites
- Commit without running tests

## ALWAYS

- Show diff before committing
- Update CHANGELOG for user-facing changes

## Verification

- Test the changes properly to make sure it's working

## Compact Instructions

Preserve:

1. Architecture decisions (NEVER summarize)
2. Modified files and key changes
3. Current verification status (pass/fail commands)
4. Open risks, TODOs, rollback notes

## Self Maintainence

- You should continously maintain CLAUDE.md but do not easily remove critial lines unless it's a better thing to do
- If you really need to remove a line here, confirm with user first
- When a crucial mistake is found, update CLAUDE.md so you don't make that mistake again