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
