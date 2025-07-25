# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install project dependencies
- `npm run dev` - Start development server on localhost:8080 with hot reload
- `npm run build` - Create production build in `dist/` folder
- `npm run dev-nolog` - Development server without telemetry
- `npm run build-nolog` - Production build without telemetry

## Project Architecture

This is a **Space Taxi Clone** game built with Phaser 3, TypeScript, and Vite. The game features a dusky cityscape with pixel art aesthetics where players control a taxi to pickup and dropoff passengers.

### Entry Flow
- `src/main.ts` - Application bootstrap, waits for DOM and starts game
- `src/game/main.ts` - Game configuration and scene setup
- Scene order: `Pre` (asset loading) → `Game` (main gameplay)

### Game Configuration
- Resolution: 700x300 pixels
- Scaling: FIT mode with center alignment
- Background: Sunset orange (#fa782d)
- Development server: Port 8080

### Scene Architecture
- **Pre Scene** (`src/game/scenes/Pre.ts`): Asset loading and preload logic
- **Game Scene** (`src/game/scenes/Game.ts`): Main gameplay implementation
- Utility functions: `halfWidth()` and `halfHeight()` for scene positioning

### Color System
Organized color palettes in `src/constants/constants.ts`:
- **SKY_COLORS**: Sunset/horizon colors (cream to night purple)
- **ENVIRONMENT_COLORS**: Building/vegetation colors (dark purples to blacks)
- All colors use hex values and TypeScript const assertions for type safety

## Game Design Specifications

### Core Mechanics
- **Controls**: W (thrust), A/D (lateral), S (brake), Shift (afterburner), Mouse (weapon)
- **Objective**: Pickup and dropoff passengers within time limits
- **Progression**: Maps get wider, more passengers required, increased hazard patterns
- **Economy**: Cash from successful deliveries, costs from damage/rough landings

### Visual Style
- Pixel art aesthetic with dusky/sunset color palette
- Procedural cityscape with buildings (10-65% screen height)
- Buildings have 1-3 platforms and lit/unlit windows
- Taxi spawns on landing platforms, passengers spawn on similar platforms

## Asset Management

### Static Assets
Assets are stored in `public/assets/` and loaded via Phaser's asset loading system:
- `citybg.png` - City background
- `taxi.png` - Player taxi sprite
- `passenger.png` / `passenger2.png` - Passenger sprites

### Asset Loading Pattern
```typescript
// In preload() method
this.load.setPath("assets");
this.load.image("keyName", "filename.png");
```

## Technical Stack

- **Phaser**: 3.90.0 (game engine)
- **TypeScript**: 5.7.2 with strict configuration
- **Vite**: 6.3.1 (bundler and dev server)
- **Build Target**: ES2020 with DOM support

### TypeScript Configuration
- Strict mode enabled with property initialization disabled
- Unused locals/parameters detection enabled
- Bundler module resolution for Vite compatibility

## Development Notes

- Assets in `public/assets/` are served directly and copied to `dist/assets/` on build
- Scene transitions use `this.scene.start("SceneName")`
- Color constants provide type safety and consistent theming
- Game uses Phaser's AUTO renderer type for optimal performance