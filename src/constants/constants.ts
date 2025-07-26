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
    // Standardized building dimensions for clean rendering
    BUILDING_WIDTHS: [100, 120, 140, 160, 180, 200, 220], // Standard widths (larger)
    BUILDING_HEIGHTS: [80, 100, 120, 140, 160, 180, 200, 220, 240], // Standard heights (larger)
    
    // Legacy dimensions (kept for compatibility)
    MIN_BUILDING_WIDTH: 60,
    MAX_BUILDING_WIDTH: 120,
    MIN_BUILDING_HEIGHT: 80, // Match smallest height in BUILDING_HEIGHTS
    MAX_BUILDING_HEIGHT: 240, // Match largest height in BUILDING_HEIGHTS

    // Building spacing for safe navigation
    MIN_BUILDING_GAP: 50, // Minimum gap between buildings (reduced for larger buildings)
    MAX_BUILDING_GAP: 150, // Maximum gap between buildings

    // Simplified system - most variation chances removed
    // Note: Tall building chance now handled directly in BuildingGenerator (30%)

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
        Y_POSITION: 180, // Higher in the sky
        COLOR: "#ffd700", // Golden color
    },

    // Cloud settings - Updated for clustering and alpha variance
    CLOUDS: {
        CLUSTERS: {
            COUNT: 2, // Number of cloud clusters
            MIN_CLOUDS_PER_CLUSTER: 3,
            MAX_CLOUDS_PER_CLUSTER: 6,
            CLUSTER_SPREAD: 80, // Maximum distance between clouds in a cluster
        },
        MIN_WIDTH: 30,
        MAX_WIDTH: 70,
        HEIGHT: 18, // Pill height
        MIN_ALPHA: 0.15, // Much more variance for depth
        MAX_ALPHA: 0.65,
        MIN_SPEED: 0.03, // Slower, more natural movement
        MAX_SPEED: 0.08,
        Y_RANGE: { MIN: 30, MAX: 140 }, // Vertical position range
        ALPHA_LAYERS: {
            BACKGROUND: { MIN: 0.15, MAX: 0.3 }, // Far clouds
            MIDGROUND: { MIN: 0.3, MAX: 0.5 },   // Mid clouds  
            FOREGROUND: { MIN: 0.5, MAX: 0.65 }, // Near clouds
        },
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
        Y_POSITION: 250, // Ground level for background buildings
    },
} as const;

// Material patterns and colors
export const MATERIAL_PATTERNS = {
    BRICK: {
        BRICK_WIDTH: 16,
        BRICK_HEIGHT: 8,
        MORTAR_COLOR: "#2a2a2a",
        BRICK_COLORS: ["#6B3410", "#8B4513", "#A0522D", "#5D2F0A"],
    },
    CONCRETE: {
        BASE_COLORS: ["#252526", "#1f1f1f", "#141414", "#372a3b"],
        STAIN_COLORS: ["#606060", "#555555", "#656565"],
    },
    GLASS: {
        COLORS: ["#87ceeb", "#4682b4", "#5f9ea0", "#6495ed"],
        REFLECTION_ALPHA: 0.3,
    },
    METAL: {
        COLORS: ["#c0c0c0", "#a8a8a8", "#b8b8b8", "#d3d3d3"],
        RUST_COLORS: ["#b7410e", "#a0522d", "#8b4513"],
    },
    STUCCO: {
        COLORS: ["#f5deb3", "#deb887", "#d2b48c", "#bc9a6a"],
        TEXTURE_SIZE: 2,
    },
} as const;

// Building element configurations
// Removed: BUILDING_ELEMENTS, MATERIAL_DISTRIBUTION - not used in simplified system

// Removed: STYLE_DISTRIBUTION, SHAPE_DISTRIBUTION - simplified system uses fixed values

// Removed: BILLBOARD_CONFIG - billboards completely removed from game

// 2.5D depth configuration
// Removed: DEPTH_CONFIG - simplified system uses no depth offset

// Background metropolis configuration
export const BACKGROUND_CONFIG = {
    FAR_BUILDINGS: {
        COUNT: 15,
        WIDTH_RANGE: { MIN: 30, MAX: 80 }, // Made much wider
        HEIGHT_RANGE: { MIN: 40, MAX: 120 },
        Y_BASE: 200, // Base Y position
        ALPHA: 0.3,
        COLORS: ["#2c3e50", "#34495e", "#1a252f", "#273444"],
        WINDOW_CHANCE: 0.8, // 80% chance buildings have windows
        WINDOW_SPACING: 8, // Space between windows
        WINDOW_SIZE: { WIDTH: 4, HEIGHT: 6 },
    },
    VERY_FAR_BUILDINGS: {
        COUNT: 25,
        WIDTH_RANGE: { MIN: 20, MAX: 50 }, // Made much wider
        HEIGHT_RANGE: { MIN: 20, MAX: 80 },
        Y_BASE: 220, // Base Y position (closer to horizon)
        ALPHA: 0.15,
        COLORS: ["#1a252f", "#273444", "#2c3e50"],
        WINDOW_CHANCE: 0.6, // 60% chance buildings have windows (less detailed for very far)
        WINDOW_SPACING: 6, // Smaller spacing for distant buildings
        WINDOW_SIZE: { WIDTH: 2, HEIGHT: 4 },
    },
} as const;

// Plane configuration for atmospheric aircraft
export const PLANE_CONFIG = {
    SPAWN_INTERVAL: 12000, // Milliseconds between plane spawns
    SPAWN_VARIANCE: 8000, // Random variance in spawn timing
    MAX_PLANES: 3, // Maximum planes on screen at once
    
    SMALL: {
        SIZE: 6,
        SPEED: 0.8,
        Y_RANGE: { MIN: 20, MAX: 80 },
        SPAWN_CHANCE: 0.5,
    },
    MEDIUM: {
        SIZE: 12,
        SPEED: 0.6,
        Y_RANGE: { MIN: 30, MAX: 100 },
        SPAWN_CHANCE: 0.3,
    },
    LARGE: {
        SIZE: 20,
        SPEED: 0.4,
        Y_RANGE: { MIN: 40, MAX: 120 },
        SPAWN_CHANCE: 0.2,
    },
} as const;
