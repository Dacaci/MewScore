# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GlowScore is a React Native / Expo cross-platform mobile application targeting iOS, Android, and Web. Built with TypeScript in strict mode.

## Commands

```bash
npm start              # Start Expo development server
npm run android        # Start on Android emulator
npm run ios            # Start on iOS simulator
npm run web            # Start web version
npm run lint           # Run ESLint
```

## Architecture

### File-Based Routing (Expo Router)
- `app/` - All routes using file-based routing with typed routes enabled
- `app/(tabs)/` - Bottom tab navigation group (Home, Explore screens)
- `app/_layout.tsx` - Root layout with ThemeProvider
- `app/(tabs)/_layout.tsx` - Tab navigator configuration

### Theme System
- Light/dark mode with automatic system preference detection
- `constants/theme.ts` - Color palette (`Colors`) and platform-specific fonts (`Fonts`)
- `hooks/use-color-scheme.ts` - Native color scheme hook (`.web.ts` variant for web)
- `hooks/use-theme-color.ts` - Resolves colors based on current theme
- `components/themed-text.tsx` and `themed-view.tsx` - Theme-aware base components

### Platform-Specific Code
- Use `.ios.tsx` and `.web.ts` file extensions for platform variants
- `components/ui/icon-symbol.tsx` - SF Symbols (iOS) with Material Icons fallback (Android/web)
- Fonts vary by platform (system fonts on iOS, fallbacks on Android/web)

### Component Conventions
- `components/ui/` - Atomic/reusable UI components
- `components/` - Feature components (ParallaxScrollView, HapticTab, etc.)
- Path alias `@/` maps to project root

### Key Experimental Features
- `typedRoutes` - Type-safe routing
- `reactCompiler` - React compiler optimization
- `newArchEnabled` - Expo New Architecture
