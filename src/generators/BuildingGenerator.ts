import { Building, Window, Garage } from "../types/level";
import { LEVEL_CONFIG, ENVIRONMENT_COLORS, EnvironmentColor, BRICK_PATTERNS } from "../constants/constants";

export class BuildingGenerator {
    private static idCounter = 0;

    static generateBuilding(x: number, width: number, maxHeight: number): Building {
        const id = `building_${++this.idCounter}`;

        // Determine building variations
        const isBrick = Math.random() < LEVEL_CONFIG.BRICK_BUILDING_CHANCE;
        const isTall = Math.random() < LEVEL_CONFIG.TALL_BUILDING_CHANCE;
        const hasGarage = Math.random() < LEVEL_CONFIG.CONNECTED_STRUCTURE_CHANCE;

        // Calculate height (double if tall)
        let baseHeight =
            Math.random() * (maxHeight - LEVEL_CONFIG.MIN_BUILDING_HEIGHT) + LEVEL_CONFIG.MIN_BUILDING_HEIGHT;
        if (isTall) {
            baseHeight = Math.min(baseHeight * 2, 280); // Cap at near game height
        }

        // Adjust width if garage is needed
        let actualWidth = width;
        if (hasGarage) {
            const garageWidth =
                Math.random() * (LEVEL_CONFIG.GARAGE_MAX_WIDTH - LEVEL_CONFIG.GARAGE_MIN_WIDTH) +
                LEVEL_CONFIG.GARAGE_MIN_WIDTH;
            actualWidth = Math.max(width, width + garageWidth * 0.5); // Expand if needed
        }

        const y = LEVEL_CONFIG.GROUND_LEVEL - baseHeight;

        const building: Building = {
            id,
            x,
            y,
            width: actualWidth,
            height: baseHeight,
            windows: [],
            color: this.selectRandomBuildingColor(),
            isBrick,
            isTall,
        };

        // Generate garage if needed
        if (hasGarage) {
            building.garage = this.generateGarage(building);
        }

        // Add windows for visual detail
        building.windows = this.generateWindows(building);

        return building;
    }

    private static generateWindows(building: Building): Window[] {
        const windows: Window[] = [];
        const windowWidth = 12;
        const windowHeight = 16;
        const horizontalSpacing = 8;
        const verticalSpacing = 6;
        const floorHeight = 25;
        const marginFromEdge = 8;

        // Calculate how many windows can fit horizontally
        const availableWidth = building.width - 2 * marginFromEdge;
        const windowsPerRow = Math.floor(availableWidth / (windowWidth + horizontalSpacing));
        const totalWindowWidth = windowsPerRow * windowWidth + (windowsPerRow - 1) * horizontalSpacing;
        const startX = building.x + marginFromEdge + (availableWidth - totalWindowWidth) / 2;

        // Calculate number of floors
        const floors = Math.floor((building.height - 10) / floorHeight); // Leave margin at top

        for (let floor = 0; floor < floors; floor++) {
            for (let windowIndex = 0; windowIndex < windowsPerRow; windowIndex++) {
                const windowX = startX + windowIndex * (windowWidth + horizontalSpacing);
                const windowY = building.y + 8 + floor * floorHeight; // Margin from top

                windows.push({
                    x: windowX,
                    y: windowY,
                    width: windowWidth,
                    height: windowHeight,
                    isLit: Math.random() > 0.5, // 50% chance of being lit
                });
            }
        }

        return windows;
    }

    private static generateGarage(building: Building): Garage {
        const garageWidth =
            Math.random() * (LEVEL_CONFIG.GARAGE_MAX_WIDTH - LEVEL_CONFIG.GARAGE_MIN_WIDTH) +
            LEVEL_CONFIG.GARAGE_MIN_WIDTH;
        const garageHeight =
            Math.random() * (LEVEL_CONFIG.GARAGE_MAX_HEIGHT - LEVEL_CONFIG.GARAGE_MIN_HEIGHT) +
            LEVEL_CONFIG.GARAGE_MIN_HEIGHT;

        // Position garage adjacent to main building
        const isOnRight = Math.random() > 0.5;
        const garageX = isOnRight ? building.x + building.width : building.x - garageWidth;
        const garageY = LEVEL_CONFIG.GROUND_LEVEL - garageHeight;

        return {
            x: garageX,
            y: garageY,
            width: garageWidth,
            height: garageHeight,
            color: this.selectRandomBuildingColor(),
            isBrick: Math.random() < LEVEL_CONFIG.BRICK_BUILDING_CHANCE,
        };
    }

    private static selectRandomBuildingColor(): string {
        const colorKeys = Object.keys(ENVIRONMENT_COLORS) as EnvironmentColor[];
        const randomKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        return ENVIRONMENT_COLORS[randomKey];
    }

    private static selectRandomBrickColor(): string {
        const brickColors = BRICK_PATTERNS.STANDARD.BRICK_COLORS;
        return brickColors[Math.floor(Math.random() * brickColors.length)];
    }

    static ensureNavigationGaps(buildings: Building[], levelWidth: number): Building[] {
        // Sort buildings by x position
        buildings.sort((a, b) => a.x - b.x);

        // Adjust building positions to ensure minimum gaps
        for (let i = 1; i < buildings.length; i++) {
            const prevBuilding = buildings[i - 1];
            const currentBuilding = buildings[i];
            const requiredX = prevBuilding.x + prevBuilding.width + LEVEL_CONFIG.MIN_BUILDING_GAP;

            if (currentBuilding.x < requiredX) {
                currentBuilding.x = requiredX;
            }
        }

        // Remove buildings that would extend beyond level width
        return buildings.filter((building) => building.x + building.width <= levelWidth);
    }
}
