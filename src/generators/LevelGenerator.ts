import { Level, Building, Cloud, LevelGenerationConfig } from "../types/level";
import { LEVEL_CONFIG, ENVIRONMENT_CONFIG } from "../constants/constants";
import { BuildingGenerator } from "./BuildingGenerator";

export class LevelGenerator {
    static generateLevel(levelWidth: number, difficulty: number = 1): Level {
        const buildings = this.generateBuildings(levelWidth, difficulty);
        const clouds = this.generateClouds(levelWidth);

        const level: Level = {
            buildings,
            clouds,
            width: levelWidth,
            height: 300,
        };

        return level;
    }

    private static generateBuildings(levelWidth: number, difficulty: number): Building[] {
        const buildings: Building[] = [];
        let currentX = LEVEL_CONFIG.MIN_BUILDING_GAP; // Start with gap from left edge

        while (currentX < levelWidth - LEVEL_CONFIG.MIN_BUILDING_WIDTH) {
            // Random building width
            const buildingWidth =
                Math.random() * (LEVEL_CONFIG.MAX_BUILDING_WIDTH - LEVEL_CONFIG.MIN_BUILDING_WIDTH) +
                LEVEL_CONFIG.MIN_BUILDING_WIDTH;

            // Ensure building fits in level
            const actualWidth = Math.min(buildingWidth, levelWidth - currentX - LEVEL_CONFIG.MIN_BUILDING_GAP);

            if (actualWidth >= LEVEL_CONFIG.MIN_BUILDING_WIDTH) {
                // Generate building height (increases with difficulty)
                const maxHeight = Math.min(
                    LEVEL_CONFIG.MAX_BUILDING_HEIGHT,
                    LEVEL_CONFIG.MIN_BUILDING_HEIGHT + difficulty * 30
                );

                const building = BuildingGenerator.generateBuilding(currentX, actualWidth, maxHeight);
                buildings.push(building);
            }

            // Move to next building position
            const gap =
                Math.random() * (LEVEL_CONFIG.MAX_BUILDING_GAP - LEVEL_CONFIG.MIN_BUILDING_GAP) +
                LEVEL_CONFIG.MIN_BUILDING_GAP;
            currentX += actualWidth + gap;
        }

        // Ensure navigation gaps are maintained
        return BuildingGenerator.ensureNavigationGaps(buildings, levelWidth);
    }

    private static generateClouds(levelWidth: number): Cloud[] {
        const clouds: Cloud[] = [];

        for (let i = 0; i < ENVIRONMENT_CONFIG.CLOUDS.COUNT; i++) {
            clouds.push({
                x: Math.random() * levelWidth,
                y:
                    Math.random() * (ENVIRONMENT_CONFIG.CLOUDS.Y_RANGE.MAX - ENVIRONMENT_CONFIG.CLOUDS.Y_RANGE.MIN) +
                    ENVIRONMENT_CONFIG.CLOUDS.Y_RANGE.MIN,
                width:
                    Math.random() * (ENVIRONMENT_CONFIG.CLOUDS.MAX_WIDTH - ENVIRONMENT_CONFIG.CLOUDS.MIN_WIDTH) +
                    ENVIRONMENT_CONFIG.CLOUDS.MIN_WIDTH,
                height: ENVIRONMENT_CONFIG.CLOUDS.HEIGHT,
                alpha:
                    Math.random() * (ENVIRONMENT_CONFIG.CLOUDS.MAX_ALPHA - ENVIRONMENT_CONFIG.CLOUDS.MIN_ALPHA) +
                    ENVIRONMENT_CONFIG.CLOUDS.MIN_ALPHA,
                speed:
                    Math.random() * (ENVIRONMENT_CONFIG.CLOUDS.MAX_SPEED - ENVIRONMENT_CONFIG.CLOUDS.MIN_SPEED) +
                    ENVIRONMENT_CONFIG.CLOUDS.MIN_SPEED,
            });
        }

        return clouds;
    }

    static validateLevel(level: Level): boolean {
        // Ensure minimum gap between buildings for navigation
        const sortedBuildings = level.buildings.sort((a, b) => a.x - b.x);
        for (let i = 1; i < sortedBuildings.length; i++) {
            const prevBuilding = sortedBuildings[i - 1];
            const currentBuilding = sortedBuildings[i];
            const gap = currentBuilding.x - (prevBuilding.x + prevBuilding.width);

            if (gap < LEVEL_CONFIG.MIN_BUILDING_GAP) {
                return false;
            }
        }

        return true;
    }
}
