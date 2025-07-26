# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

-   `npm install` - Install project dependencies
-   `npm run dev` - Start development server on localhost:8080 with hot reload
-   `npm run build` - Create production build in `dist/` folder
-   `npm run dev-nolog` - Development server without telemetry
-   `npm run build-nolog` - Production build without telemetry
-   IMPORTANT: Dont run `npm run dev`. It is on "watch" and re-renders automatically on change. It is available at http://localhost:8080
-   IMPORTANT: Use Playwright (MCP) can be utilized for inspection

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
-   Simplified cityscape with 2-3 standardized buildings per level
-   Buildings use grid-based dimensions for clean, aligned rendering
-   Buildings have simple window patterns with lit/unlit states
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

# City Vibe Taxi Game - Simplified Building Generation

## Overview

The City Vibe Taxi game uses a simplified building generation system that creates clean, consistent cityscapes with 2-3 standardized buildings per level. This approach prioritizes visual clarity, performance, and maintainability over complex architectural details.

## Building Generation System

### Core Principles

-   **Minimal Building Count**: Each level contains exactly 2-3 buildings for clear navigation
-   **Standardized Dimensions**: Buildings use predefined grid-based widths and heights
-   **Simple Materials**: Only three material types: solid, brick, and concrete
-   **Clean Windows**: Basic grid pattern with lit/unlit states only
-   **No Complex Elements**: Removed garages, signs, balconies, and other architectural details

### Building Distribution

Buildings are evenly distributed across the level width using a calculated spacing algorithm:

```typescript
const buildingCount = Math.floor(Math.random() * 2) + 2; // 2-3 buildings
const totalGapSpace = levelWidth * 0.3; // 30% for gaps
const gapSize = totalGapSpace / (buildingCount + 1); // Even distribution
```

### Standardized Dimensions

#### Building Widths

-   **Available Options**: [60, 80, 100, 120, 140] pixels
-   **Selection**: Largest width that fits available space
-   **Purpose**: Consistent visual proportions

#### Building Heights

-   **Available Options**: [40, 60, 80, 100, 120, 140, 160] pixels
-   **Selection**: Random from options within difficulty-based height limit
-   **Tall Modifier**: 30% chance for 1.5x height increase (capped at 280px)

## Material System

### Supported Materials

1. **Solid** (Default)

    - Uses building's assigned color from environment palette
    - Simple filled rectangle rendering

2. **Brick**

    - Authentic staggered brick pattern
    - Multiple brown color variations
    - Mortar gaps for realistic appearance

3. **Concrete**
    - Simple gray (#808080) solid color
    - Clean, industrial appearance

### Material Selection

```typescript
const materials: MaterialType[] = ["solid", "brick", "concrete"];
const material = materials[Math.floor(Math.random() * materials.length)];
```

## Window System

### Window Properties

-   **Dimensions**: 12×16 pixels (standardized)
-   **Spacing**: 8 pixels horizontal, 25 pixels vertical (floor height)
-   **Type**: Standard only (no bay, arched, or special windows)
-   **States**: Lit (50% chance) or unlit
-   **No Accessories**: Removed AC units, awnings, damage states

### Window Layout

Windows are arranged in a clean grid pattern:

-   **Margin**: 8 pixels from building edges
-   **Centering**: Windows are centered within available width
-   **Floor-based**: Arranged by floor with consistent vertical spacing

## Technical Implementation

### Core Classes

#### LevelGenerator

-   `generateBuildings()`: Creates 2-3 evenly spaced buildings
-   **Algorithm**: Calculates optimal spacing for visual balance
-   **Input**: Level width and difficulty
-   **Output**: Array of Building objects

#### BuildingGenerator

-   `generateBuilding()`: Creates single building with standardized properties
-   `generateSimpleWindows()`: Adds basic window grid
-   `selectSimpleMaterial()`: Chooses from 3 material types

### Data Structures

#### Simplified Building Interface

```typescript
interface Building {
    id: string;
    x: number;
    y: number;
    width: number; // From standardized widths
    height: number; // From standardized heights
    windows: Window[]; // Simple grid layout
    color: string; // From environment palette
    material: MaterialType; // 'solid' | 'brick' | 'concrete'
    // Removed: garage, signs, balconies, weathering, damage
}
```

#### Window Interface

```typescript
interface Window {
    x: number;
    y: number;
    width: 12; // Fixed width
    height: 16; // Fixed height
    isLit: boolean; // 50% random chance
    type: "standard"; // Only standard type
    // Removed: hasAC, hasAwning, isBroken
}
```

## Configuration

### Building Constants

```typescript
LEVEL_CONFIG: {
    BUILDING_WIDTHS: [60, 80, 100, 120, 140],
    BUILDING_HEIGHTS: [40, 60, 80, 100, 120, 140, 160],
    MIN_BUILDING_GAP: 80,
    MAX_BUILDING_GAP: 150,
}
```

## Performance Benefits

### Reduced Complexity

-   **90% fewer generation methods**: Removed complex element generation
-   **Simplified rendering**: Only 3 material types vs 6+ previously
-   **Faster level creation**: Single-pass generation vs multi-pass
-   **Lower memory usage**: No complex element arrays

### Visual Consistency

-   **Predictable layouts**: Grid-based dimensions eliminate random sizing
-   **Clean alignment**: No depth offset or staggering effects
-   **Consistent spacing**: Mathematical distribution ensures proper gaps

### Maintenance Advantages

-   **Easier debugging**: Fewer variables and edge cases
-   **Clearer code**: Simplified generation logic
-   **Better testing**: Predictable outcomes for validation

## Environment Integration

The simplified building system integrates with existing environmental elements:

-   **Clouds**: Animated background elements (unchanged)
-   **Sun**: Static background element (unchanged)
-   **Street/Horizon**: Ground level delineation (unchanged)
-   **Background Buildings**: Distant city silhouettes (unchanged)

This simplified approach creates a clean, focused gameplay environment that emphasizes navigation and core game mechanics over architectural complexity.
