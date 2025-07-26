import {
    Building,
    Window,
    MaterialType,
} from "../types/level";
import {
    LEVEL_CONFIG,
    ENVIRONMENT_COLORS,
    EnvironmentColor,
} from "../constants/constants";

/**
 * Simplified Building Generator
 * 
 * Creates standardized buildings with clean, grid-based dimensions.
 * Removed complex elements (garages, signs, balconies, etc.) for cleaner rendering.
 */
export class BuildingGenerator {
    private static idCounter = 0;

    /**
     * Generates a single building with simplified properties
     * @param x - X position of the building
     * @param width - Width from standardized BUILDING_WIDTHS array
     * @param maxHeight - Maximum height allowed (based on difficulty)
     * @returns Building object with basic structure and windows
     */
    static generateBuilding(x: number, width: number, maxHeight: number): Building {
        console.log(`BuildingGenerator.generateBuilding called with: x=${x}, width=${width}, maxHeight=${maxHeight}`);
        
        const id = `building_${++this.idCounter}`;

        // Simplified building - only basic material variation
        const material = this.selectSimpleMaterial();
        const isTall = Math.random() < 0.3; // 30% chance for taller buildings

        // Use standardized height from predefined options
        const heightOptions = LEVEL_CONFIG.BUILDING_HEIGHTS.filter(h => h <= maxHeight);
        console.log(`Height options for maxHeight ${maxHeight}:`, heightOptions);
        
        if (heightOptions.length === 0) {
            console.warn(`No height options available for maxHeight ${maxHeight}, using minimum height`);
            heightOptions.push(LEVEL_CONFIG.BUILDING_HEIGHTS[0]);
        }
        
        let baseHeight = heightOptions[Math.floor(Math.random() * heightOptions.length)];
        console.log(`Selected baseHeight: ${baseHeight}`);
        
        // Apply tall modifier by selecting from taller options
        if (isTall && heightOptions.length > 1) {
            const tallerOptions = heightOptions.slice(Math.floor(heightOptions.length / 2));
            baseHeight = tallerOptions[Math.floor(Math.random() * tallerOptions.length)];
            baseHeight = Math.min(baseHeight * 1.5, 280); // Moderate increase instead of doubling
        }

        // Use standardized width (garages will be positioned adjacent, not expand main building)
        const actualWidth = width;

        const y = LEVEL_CONFIG.GROUND_LEVEL - baseHeight;

        // Disable depth offset for cleaner aligned rendering
        const depthOffset = 0;

        const building: Building = {
            id,
            x,
            y,
            width: actualWidth,
            height: baseHeight,
            windows: [],
            color: this.selectRandomBuildingColor(),
            material,
            style: 'modern', // Simple default style
            shape: 'rectangle', // Simple default shape
            isTall,
            depthOffset: depthOffset,
            rooftopElements: [], // No rooftop elements
            entrances: [], // No entrances
            balconies: [], // No balconies
            signs: [], // No signs
            hasWeathering: false, // No weathering
            hasDamage: false, // No damage
        };

        // Generate only basic windows
        building.windows = this.generateSimpleWindows(building);

        return building;
    }

    /**
     * Generates basic window grid for a building
     * Windows are arranged in a clean grid pattern with consistent spacing
     * @param building - Building to add windows to
     * @returns Array of Window objects with standard properties
     */
    private static generateSimpleWindows(building: Building): Window[] {
        const windows: Window[] = [];
        const windowWidth = 12;
        const windowHeight = 16;
        const horizontalSpacing = 8;
        const floorHeight = 25;
        const marginFromEdge = 8;

        // Calculate how many windows can fit horizontally
        const availableWidth = building.width - 2 * marginFromEdge;
        const windowsPerRow = Math.floor(availableWidth / (windowWidth + horizontalSpacing));
        const totalWindowWidth = windowsPerRow * windowWidth + (windowsPerRow - 1) * horizontalSpacing;
        const startX = building.x + marginFromEdge + (availableWidth - totalWindowWidth) / 2;

        // Calculate number of floors
        const floors = Math.floor((building.height - 10) / floorHeight);

        for (let floor = 0; floor < floors; floor++) {
            for (let windowIndex = 0; windowIndex < windowsPerRow; windowIndex++) {
                const windowX = startX + windowIndex * (windowWidth + horizontalSpacing);
                const windowY = building.y + 8 + floor * floorHeight;

                // Simple bounds check
                if (windowX >= building.x && 
                    windowX + windowWidth <= building.x + building.width &&
                    windowY >= building.y && 
                    windowY + windowHeight <= building.y + building.height) {
                    
                    windows.push({
                        x: windowX,
                        y: windowY,
                        width: windowWidth,
                        height: windowHeight,
                        isLit: Math.random() > 0.5,
                        type: 'standard', // Only standard windows
                        hasAC: false, // No accessories
                        hasAwning: false, // No accessories
                        isBroken: false, // No damage
                    });
                }
            }
        }

        return windows;
    }

    /**
     * Selects material from simplified set (brick, stucco only)
     * Equal probability for each material type
     * @returns MaterialType - either 'brick' or 'stucco' (using 'concrete' as stucco)
     */
    private static selectSimpleMaterial(): MaterialType {
        const materials: MaterialType[] = ['brick', 'concrete']; // concrete renders as stucco
        return materials[Math.floor(Math.random() * materials.length)];
    }

    private static selectRandomBuildingColor(): string {
        const colorKeys = Object.keys(ENVIRONMENT_COLORS) as EnvironmentColor[];
        const randomKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        return ENVIRONMENT_COLORS[randomKey];
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
