# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

-   `npm install` - Install project dependencies
-   `npm run dev` - Start development server on localhost:8080 with hot reload
-   `npm run build` - Create production build in `dist/` folder
-   `npm run dev-nolog` - Development server without telemetry
-   `npm run build-nolog` - Production build without telemetry

## Project Architecture

This is a **Space Taxi Clone** game built with Phaser 3, TypeScript, and Vite. The game features a dusky cityscape with pixel art aesthetics where players control a taxi to pickup and dropoff passengers.

### Entry Flow

-   `src/main.ts` - Application bootstrap, waits for DOM and starts game
-   `src/game/main.ts` - Game configuration and scene setup
-   Scene order: `Pre` (asset loading) → `Game` (main gameplay)

### Game Configuration

-   Resolution: 700x300 pixels
-   Scaling: FIT mode with center alignment
-   Background: Sunset orange (#fa782d)
-   Development server: Port 8080

### Scene Architecture

-   **Pre Scene** (`src/game/scenes/Pre.ts`): Asset loading and preload logic
-   **Game Scene** (`src/game/scenes/Game.ts`): Main gameplay implementation
-   Utility functions: `halfWidth()` and `halfHeight()` for scene positioning

### Color System

Organized color palettes in `src/constants/constants.ts`:

-   **SKY_COLORS**: Sunset/horizon colors (cream to night purple)
-   **ENVIRONMENT_COLORS**: Building/vegetation colors (dark purples to blacks)
-   All colors use hex values and TypeScript const assertions for type safety

## Game Design Specifications

### Core Mechanics

-   **Controls**: W (thrust), A/D (lateral), S (brake), Shift (afterburner), Mouse (weapon)
-   **Objective**: Pickup and dropoff passengers within time limits
-   **Progression**: Maps get wider, more passengers required, increased hazard patterns
-   **Economy**: Cash from successful deliveries, costs from damage/rough landings

### Visual Style

-   Pixel art aesthetic with dusky/sunset color palette
-   Procedural cityscape with buildings (10-65% screen height)
-   Buildings ( 1-3 ) spawn in early levels and for now
-   Buildings have 1-3 platforms and lit/unlit windows
-   Taxi spawns on landing platforms, passengers spawn on similar platforms

## Asset Management

### Static Assets

Assets are stored in `public/assets/` and loaded via Phaser's asset loading system:

-   `citybg.png` - City background
-   `taxi.png` - Player taxi sprite
-   `passenger.png` / `passenger2.png` - Passenger sprites

### Asset Loading Pattern

```typescript
// In preload() method
this.load.setPath("assets");
this.load.image("keyName", "filename.png");
```

## Technical Stack

-   **Phaser**: 3.90.0 (game engine)
-   **TypeScript**: 5.7.2 with strict configuration
-   **Vite**: 6.3.1 (bundler and dev server)
-   **Build Target**: ES2020 with DOM support

### TypeScript Configuration

-   Strict mode enabled with property initialization disabled
-   Unused locals/parameters detection enabled
-   Bundler module resolution for Vite compatibility

## Development Notes

-   Assets in `public/assets/` are served directly and copied to `dist/assets/` on build
-   Scene transitions use `this.scene.start("SceneName")`
-   Color constants provide type safety and consistent theming
-   Game uses Phaser's AUTO renderer type for optimal performance

# City Vibe Taxi Game - Enhanced City Generation

## Overview

This document describes the enhanced city generation system for the City Vibe Taxi game, featuring dynamic building variations, realistic environments, and atmospheric elements.

## Building Generation System

### Building Variations

#### 1. Brick Texture Buildings

-   **Probability**: 30% chance per building (`LEVEL_CONFIG.BRICK_BUILDING_CHANCE`)
-   **Implementation**: Buildings can have realistic brick textures instead of solid colors
-   **Features**:
    -   Staggered brick pattern for authenticity
    -   Multiple brick colors: brown variations (`#8b4513`, `#a0522d`, `#cd853f`, `#d2691e`)
    -   Mortar color: `#2a2a2a` (dark gray)
    -   Brick dimensions: 8×4 pixels

#### 2. Tall Buildings

-   **Probability**: 20% chance per building (`LEVEL_CONFIG.TALL_BUILDING_CHANCE`)
-   **Implementation**: Buildings can be up to 100% taller than normal maximum height
-   **Height Calculation**: `baseHeight * 2` (capped at 280px to avoid touching top of screen)
-   **Visual Impact**: Creates varied skyline with prominent towers

#### 3. Connected Structures (Garages)

-   **Probability**: 25% chance per building (`LEVEL_CONFIG.CONNECTED_STRUCTURE_CHANCE`)
-   **Dimensions**:
    -   Width: 40-60 pixels
    -   Height: 20-40 pixels
-   **Positioning**: Randomly placed left or right of main building
-   **Features**:
    -   Independent brick/solid texture decision
    -   Separate color from main building
    -   Extends building footprint when needed

### Building Width Adaptation

-   Main buildings expand by 50% of garage width when garage is added
-   Ensures visual coherence between connected structures
-   Maintains proper spacing and navigation gaps

## Environment Elements

### 1. Street and Horizon

-   **Street Area**: Dark strip at ground level (`#1a1a1a`)
-   **Street Height**: 20 pixels (`LEVEL_CONFIG.STREET_HEIGHT`)
-   **Horizon Gradient**: 30-pixel transition from street to background
-   **Purpose**: Clearly delineates ground level and adds urban realism

### 2. Sun

-   **Position**: X: 600px, Y: 80px (upper right area)
-   **Radius**: 25 pixels
-   **Color**: Golden `#ffd700`
-   **Style**: Solid circle for clear visibility against sky

### 3. Animated Clouds

-   **Count**: 5 clouds per level
-   **Shape**: Pill-shaped (rounded rectangles)
-   **Dimensions**:
    -   Width: 40-80 pixels (random)
    -   Height: 20 pixels (fixed)
-   **Visual Properties**:
    -   Alpha: 0.25-0.5 (semi-transparent)
    -   Color: White (`#ffffff`)
-   **Animation**:
    -   Speed: 0.1-0.3 pixels per frame (random per cloud)
    -   Movement: Horizontal left-to-right
    -   Wrapping: Clouds loop around screen edges
    -   Vertical Position: 40-120 pixels from top (random)

## Technical Implementation

### Data Structures

#### Building Interface

```typescript
interface Building {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    windows: Window[];
    color: string;
    isBrick: boolean; // New: Brick texture flag
    isTall: boolean; // New: Double height flag
    garage?: Garage; // New: Optional connected structure
    collisionBody?: Phaser.Physics.Arcade.Body;
}
```

#### Garage Interface

```typescript
interface Garage {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    isBrick: boolean;
}
```

#### Cloud Interface

```typescript
interface Cloud {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha: number;
    speed: number;
}
```

### Generation Process

#### 1. Building Generation (`BuildingGenerator.generateBuilding`)

1. Determine building variations using RNG
2. Calculate dimensions (apply tall modifier if selected)
3. Generate garage if selected
4. Adjust width to accommodate garage
5. Generate windows avoiding garage overlap
6. Return complete building structure

#### 2. Level Generation (`LevelGenerator.generateLevel`)

1. Generate buildings with spacing validation
2. Generate cloud array with random properties
3. Return level with buildings and environmental elements

#### 3. Rendering Process (`Game.renderLevel`)

1. **Environment Layer**:
    - Street/horizon gradient
    - Sun (static)
    - Clouds (animated)
2. **Building Layer**:
    - Main building structures
    - Garage structures (if present)
    - Windows with cross patterns

### Rendering Details

#### Brick Texture Algorithm

1. Fill area with mortar color
2. Calculate brick grid with staggered rows
3. Render individual bricks with random colors
4. Clip bricks to building boundaries
5. Leave 1-pixel gaps for mortar visibility

#### Cloud Animation

-   Real-time position updates in `update()` loop
-   Clear and re-render environment graphics each frame
-   Seamless wrapping at screen edges
-   Independent speed for each cloud creates parallax-like effect

## Configuration Constants

### Building Variations

```typescript
BRICK_BUILDING_CHANCE: 0.3; // 30% probability
TALL_BUILDING_CHANCE: 0.2; // 20% probability
CONNECTED_STRUCTURE_CHANCE: 0.25; // 25% probability
```

### Environment Settings

```typescript
ENVIRONMENT_CONFIG: {
    SUN: { RADIUS: 25, X_POSITION: 600, Y_POSITION: 80 },
    CLOUDS: { COUNT: 5, MIN_WIDTH: 40, MAX_WIDTH: 80, HEIGHT: 20 },
    HORIZON: { COLOR: "#1a1a1a", GRADIENT_HEIGHT: 30 }
}
```

## Visual Design Philosophy

### Color Harmony

-   Building colors use existing environment palette
-   Brick colors complement sunset/dusk theme
-   Street darkness contrasts with illuminated buildings
-   Cloud transparency preserves background visibility

### Architectural Realism

-   Brick patterns follow real-world masonry techniques
-   Garage placement mimics urban building arrangements
-   Height variations create believable city skyline
-   Window patterns remain consistent across building types

### Atmospheric Enhancement

-   Moving clouds suggest wind and weather
-   Low sun position implies sunset/sunrise timing
-   Street delineation grounds buildings in urban context
-   Transparency effects add depth and atmosphere

## Performance Considerations

### Optimization Strategies

-   Brick rendering uses minimal draw calls
-   Cloud animation reuses existing graphics objects
-   Environment layer renders separately from building layer
-   Texture patterns calculated once per building

### Resource Management

-   Graphics objects properly cleaned up in `shutdown()`
-   Cloud array copied to avoid modifying level data
-   Rendering layers isolated for independent updates

This enhanced system creates a dynamic, atmospheric city environment that maintains performance while adding significant visual variety and realism to the game world.
