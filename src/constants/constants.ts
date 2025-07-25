// Color Palette Constants

// Sky, sunset, horizon, and cloud colors
export const SKY_COLORS = {
    CREAM: "#ffd89a",
    SUNSET_GOLD: "#f5ba2e",
    SUNSET_ORANGE: "#fa782d",
    SUNSET_RED: "#df4d3e",
    DEEP_RED: "#bc4241",
    DUSK_PURPLE: "#97374a",
    TWILIGHT_PURPLE: "#7c4b61",
    NIGHT_PURPLE: "#63395d",
} as const;

// Building, window, brick, and vegetation colors
export const ENVIRONMENT_COLORS = {
    DARK_PURPLE_GRAY: "#372a3b",
    OLIVE_GREEN: "#777b3c",
    DARK_OLIVE: "#545225",
    FOREST_GREEN: "#384024",
    DEEP_FOREST: "#1d2d22",
    DARK_TEAL: "#0b1f2a",
    DARK_BROWN: "#291911",
    BROWN: "#522e20",
    DARK_GRAY: "#252526",
    CHARCOAL: "#1f1f1f",
    ALMOST_BLACK: "#141414",
} as const;

// Combined palette for easy access
export const COLORS = {
    ...SKY_COLORS,
    ...ENVIRONMENT_COLORS,
} as const;

// Type definitions for better TypeScript support
export type SkyColor = keyof typeof SKY_COLORS;
export type EnvironmentColor = keyof typeof ENVIRONMENT_COLORS;
export type Color = keyof typeof COLORS;

// Level Generation Constants
export const LEVEL_CONFIG = {
    // Building dimensions (based on 700x300 game size)
    MIN_BUILDING_WIDTH: 60,
    MAX_BUILDING_WIDTH: 120,
    MIN_BUILDING_HEIGHT: 30, // 10% of 300px
    MAX_BUILDING_HEIGHT: 195, // 65% of 300px

    // Building spacing for safe navigation
    MIN_BUILDING_GAP: 80, // Minimum gap between buildings
    MAX_BUILDING_GAP: 150, // Maximum gap between buildings

    // Building variation chances (0.0 to 1.0)
    BRICK_BUILDING_CHANCE: 0.3, // 30% chance for brick texture
    TALL_BUILDING_CHANCE: 0.2, // 20% chance for double height
    CONNECTED_STRUCTURE_CHANCE: 0.25, // 25% chance for connected garage

    // Connected structure dimensions
    GARAGE_MIN_WIDTH: 40,
    GARAGE_MAX_WIDTH: 60,
    GARAGE_MIN_HEIGHT: 20,
    GARAGE_MAX_HEIGHT: 40,

    // Taxi dimensions for collision calculations
    TAXI_WIDTH: 24,
    TAXI_HEIGHT: 16,

    // Safety margins
    NAVIGATION_CLEARANCE: 20, // Extra space for taxi movement

    // Ground level
    GROUND_LEVEL: 280, // Y position of ground (20px from bottom)
    STREET_HEIGHT: 20, // Height of street area
} as const;

// Environment elements configuration
export const ENVIRONMENT_CONFIG = {
    // Sun settings
    SUN: {
        RADIUS: 25,
        X_POSITION: 600, // Position from left
        Y_POSITION: 80, // Position from top
        COLOR: "#ffd700", // Golden color
    },

    // Cloud settings
    CLOUDS: {
        COUNT: 5, // Number of clouds
        MIN_WIDTH: 40,
        MAX_WIDTH: 80,
        HEIGHT: 20, // Pill height
        MIN_ALPHA: 0.25,
        MAX_ALPHA: 0.5,
        MIN_SPEED: 0.05, // Pixels per frame (slowed by 50%)
        MAX_SPEED: 0.15, // Pixels per frame (slowed by 50%)
        Y_RANGE: { MIN: 40, MAX: 120 }, // Vertical position range
    },

    // Bird settings
    BIRDS: {
        MIN_GROUP_SIZE: 1,
        MAX_GROUP_SIZE: 20,
        SPAWN_INTERVAL: 8000, // Milliseconds between groups
        SPAWN_VARIANCE: 4000, // Random variance in spawn timing

        // Far birds (background)
        FAR: {
            SIZE: 1, // 1 pixel
            SPEED: 0.2,
            WAVER_AMPLITUDE: 0.5,
            WAVER_FREQUENCY: 0.02,
            Y_RANGE: { MIN: 20, MAX: 100 },
        },

        // Medium birds
        MEDIUM: {
            SIZE: 2, // 2 pixels
            SPEED: 0.4,
            WAVER_AMPLITUDE: 0.8,
            WAVER_FREQUENCY: 0.025,
            Y_RANGE: { MIN: 30, MAX: 110 },
        },

        // Close birds (foreground)
        CLOSE: {
            SIZE: 3, // 3 pixels
            SPEED: 0.6,
            WAVER_AMPLITUDE: 1.2,
            WAVER_FREQUENCY: 0.03,
            Y_RANGE: { MIN: 40, MAX: 120 },
        },
    },

    // Street/horizon settings
    HORIZON: {
        COLOR: "#1a1a1a", // Dark landscape color
        GRADIENT_HEIGHT: 30, // Height of gradient transition
    },
} as const;

// Brick texture patterns
export const BRICK_PATTERNS = {
    STANDARD: {
        BRICK_WIDTH: 16,
        BRICK_HEIGHT: 8,
        MORTAR_COLOR: "#2a2a2a",
        BRICK_COLORS: ["#8b4513", "#a0522d", "#cd853f", "#d2691e"],
    },
} as const;
