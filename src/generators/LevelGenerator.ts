import { Level, Building, Cloud, BackgroundBuilding, BackgroundWindow, Plane, LevelGenerationConfig } from "../types/level";
import { LEVEL_CONFIG, ENVIRONMENT_CONFIG, BACKGROUND_CONFIG, PLANE_CONFIG } from "../constants/constants";
import { BuildingGenerator } from "./BuildingGenerator";

export class LevelGenerator {
    static generateLevel(levelWidth: number, difficulty: number = 1): Level {
        const buildings = this.generateBuildings(levelWidth, difficulty);
        const clouds = this.generateClouds(levelWidth);
        const backgroundBuildings = this.generateBackgroundMetropolis(levelWidth);
        const planes: Plane[] = []; // Will be populated dynamically in game scene

        const level: Level = {
            buildings,
            clouds,
            backgroundBuildings,
            planes,
            width: levelWidth,
            height: 300,
        };

        return level;
    }

    /**
     * Generates 2-3 evenly distributed buildings across the level width
     * Uses mathematical spacing to ensure consistent gaps and visual balance
     * @param levelWidth - Total width of the level
     * @param difficulty - Difficulty level affecting building height
     * @returns Array of 2-3 Building objects positioned across the level
     */
    private static generateBuildings(levelWidth: number, difficulty: number): Building[] {
        const buildings: Building[] = [];
        const buildingCount = Math.floor(Math.random() * 2) + 2; // 2-3 buildings
        
        console.log(`Generating ${buildingCount} buildings for level width ${levelWidth}`);
        
        // Calculate spacing to distribute buildings evenly across level
        const totalGapSpace = levelWidth * 0.3; // 30% of level for gaps
        const totalBuildingSpace = levelWidth - totalGapSpace;
        const averageBuildingWidth = totalBuildingSpace / buildingCount;
        const gapSize = totalGapSpace / (buildingCount + 1); // +1 for edge gaps
        
        console.log(`Debug calculations: totalGapSpace=${totalGapSpace}, totalBuildingSpace=${totalBuildingSpace}, averageBuildingWidth=${averageBuildingWidth}, gapSize=${gapSize}`);
        
        for (let i = 0; i < buildingCount; i++) {
            // Position building evenly across level
            const x = gapSize + i * (averageBuildingWidth + gapSize);
            
            // Use standardized width, but ensure it fits
            const availableWidth = Math.min(averageBuildingWidth, levelWidth - x - gapSize);
            console.log(`Building ${i}: availableWidth=${availableWidth}, averageBuildingWidth=${averageBuildingWidth}`);
            
            // Find largest width that fits, or use smallest if none fit
            const fittingWidths = LEVEL_CONFIG.BUILDING_WIDTHS.filter(w => w <= availableWidth);
            const buildingWidth = fittingWidths.length > 0 
                ? fittingWidths[fittingWidths.length - 1] // largest fitting width
                : LEVEL_CONFIG.BUILDING_WIDTHS[0]; // smallest available width as fallback
            
            console.log(`Selected buildingWidth=${buildingWidth} from options:`, LEVEL_CONFIG.BUILDING_WIDTHS);
            
            // Generate building height (increases with difficulty)
            const maxHeight = Math.min(
                LEVEL_CONFIG.MAX_BUILDING_HEIGHT,
                LEVEL_CONFIG.MIN_BUILDING_HEIGHT + difficulty * 30
            );
            console.log(`Calculated maxHeight: ${maxHeight} (MAX=${LEVEL_CONFIG.MAX_BUILDING_HEIGHT}, MIN=${LEVEL_CONFIG.MIN_BUILDING_HEIGHT}, difficulty=${difficulty})`);
            
            const building = BuildingGenerator.generateBuilding(x, buildingWidth, maxHeight);
            console.log(`Generated building: x=${building.x}, y=${building.y}, width=${building.width}, height=${building.height}`);
            buildings.push(building);
        }

        console.log(`Total buildings generated: ${buildings.length}`);
        return buildings;
    }

    /**
     * Generates clouds in clusters with alpha variance for depth perception
     * @param levelWidth - Width of the level for positioning clusters
     * @returns Array of Cloud objects arranged in clusters
     */
    private static generateClouds(levelWidth: number): Cloud[] {
        const clouds: Cloud[] = [];
        const cloudConfig = ENVIRONMENT_CONFIG.CLOUDS;
        const layers: ("background" | "midground" | "foreground")[] = ["background", "midground", "foreground"];

        // Generate cloud clusters
        for (let clusterId = 0; clusterId < cloudConfig.CLUSTERS.COUNT; clusterId++) {
            // Determine cluster center position
            const clusterCenterX = Math.random() * levelWidth;
            const clusterCenterY = 
                Math.random() * (cloudConfig.Y_RANGE.MAX - cloudConfig.Y_RANGE.MIN) +
                cloudConfig.Y_RANGE.MIN;

            // Number of clouds in this cluster
            const cloudsInCluster = 
                Math.floor(Math.random() * 
                    (cloudConfig.CLUSTERS.MAX_CLOUDS_PER_CLUSTER - cloudConfig.CLUSTERS.MIN_CLOUDS_PER_CLUSTER + 1)) +
                cloudConfig.CLUSTERS.MIN_CLOUDS_PER_CLUSTER;

            // Generate clouds for this cluster
            for (let i = 0; i < cloudsInCluster; i++) {
                // Position relative to cluster center
                const offsetX = (Math.random() - 0.5) * cloudConfig.CLUSTERS.CLUSTER_SPREAD;
                const offsetY = (Math.random() - 0.5) * (cloudConfig.CLUSTERS.CLUSTER_SPREAD * 0.6); // Less vertical spread
                
                const x = Math.max(0, Math.min(levelWidth, clusterCenterX + offsetX));
                const y = Math.max(cloudConfig.Y_RANGE.MIN, 
                    Math.min(cloudConfig.Y_RANGE.MAX, clusterCenterY + offsetY));

                // Assign random layer for alpha variance
                const layer = layers[Math.floor(Math.random() * layers.length)];
                const alphaRange = cloudConfig.ALPHA_LAYERS[layer.toUpperCase() as keyof typeof cloudConfig.ALPHA_LAYERS];
                
                clouds.push({
                    x,
                    y,
                    width: Math.random() * (cloudConfig.MAX_WIDTH - cloudConfig.MIN_WIDTH) + cloudConfig.MIN_WIDTH,
                    height: cloudConfig.HEIGHT,
                    alpha: Math.random() * (alphaRange.MAX - alphaRange.MIN) + alphaRange.MIN,
                    speed: Math.random() * (cloudConfig.MAX_SPEED - cloudConfig.MIN_SPEED) + cloudConfig.MIN_SPEED,
                    clusterId,
                    layer,
                });
            }
        }

        return clouds;
    }


    private static generateBackgroundMetropolis(levelWidth: number): BackgroundBuilding[] {
        const backgroundBuildings: BackgroundBuilding[] = [];

        // Generate far buildings
        for (let i = 0; i < BACKGROUND_CONFIG.FAR_BUILDINGS.COUNT; i++) {
            const width =
                Math.random() *
                    (BACKGROUND_CONFIG.FAR_BUILDINGS.WIDTH_RANGE.MAX -
                        BACKGROUND_CONFIG.FAR_BUILDINGS.WIDTH_RANGE.MIN) +
                BACKGROUND_CONFIG.FAR_BUILDINGS.WIDTH_RANGE.MIN;
            const height =
                Math.random() *
                    (BACKGROUND_CONFIG.FAR_BUILDINGS.HEIGHT_RANGE.MAX -
                        BACKGROUND_CONFIG.FAR_BUILDINGS.HEIGHT_RANGE.MIN) +
                BACKGROUND_CONFIG.FAR_BUILDINGS.HEIGHT_RANGE.MIN;
            const x = Math.random() * (levelWidth + 200) - 100; // Can extend beyond screen
            const y = ENVIRONMENT_CONFIG.HORIZON.Y_POSITION - height; // Align with horizon
            const color =
                BACKGROUND_CONFIG.FAR_BUILDINGS.COLORS[
                    Math.floor(Math.random() * BACKGROUND_CONFIG.FAR_BUILDINGS.COLORS.length)
                ];

            const building: BackgroundBuilding = {
                x,
                y,
                width,
                height,
                color,
                distance: "far",
            };

            // Add windows if chance succeeds
            if (Math.random() < BACKGROUND_CONFIG.FAR_BUILDINGS.WINDOW_CHANCE) {
                building.windows = this.generateBackgroundWindows(
                    building,
                    BACKGROUND_CONFIG.FAR_BUILDINGS.WINDOW_SPACING,
                    BACKGROUND_CONFIG.FAR_BUILDINGS.WINDOW_SIZE
                );
            }

            backgroundBuildings.push(building);
        }

        // Generate very far buildings
        for (let i = 0; i < BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.COUNT; i++) {
            const width =
                Math.random() *
                    (BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.WIDTH_RANGE.MAX -
                        BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.WIDTH_RANGE.MIN) +
                BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.WIDTH_RANGE.MIN;
            const height =
                Math.random() *
                    (BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.HEIGHT_RANGE.MAX -
                        BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.HEIGHT_RANGE.MIN) +
                BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.HEIGHT_RANGE.MIN;
            const x = Math.random() * (levelWidth + 400) - 200; // Can extend well beyond screen
            const y = ENVIRONMENT_CONFIG.HORIZON.Y_POSITION - height; // Align with horizon
            const color =
                BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.COLORS[
                    Math.floor(Math.random() * BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.COLORS.length)
                ];

            const building: BackgroundBuilding = {
                x,
                y,
                width,
                height,
                color,
                distance: "very_far",
            };

            // Add windows if chance succeeds
            if (Math.random() < BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.WINDOW_CHANCE) {
                building.windows = this.generateBackgroundWindows(
                    building,
                    BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.WINDOW_SPACING,
                    BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.WINDOW_SIZE
                );
            }

            backgroundBuildings.push(building);
        }

        return backgroundBuildings;
    }

    private static generateBackgroundWindows(
        building: BackgroundBuilding,
        spacing: number,
        windowSize: { WIDTH: number; HEIGHT: number }
    ): BackgroundWindow[] {
        const windows: BackgroundWindow[] = [];
        const margin = 2; // Margin from building edge

        // Calculate how many windows can fit horizontally
        const availableWidth = building.width - 2 * margin;
        const windowsPerRow = Math.floor(availableWidth / (windowSize.WIDTH + spacing));
        
        if (windowsPerRow <= 0) return windows;

        const totalWindowWidth = windowsPerRow * windowSize.WIDTH + (windowsPerRow - 1) * spacing;
        const startX = building.x + margin + (availableWidth - totalWindowWidth) / 2;

        // Calculate number of floors
        const floorHeight = windowSize.HEIGHT + spacing + 2; // Window + spacing + floor structure
        const floors = Math.floor((building.height - margin * 2) / floorHeight);

        for (let floor = 0; floor < floors; floor++) {
            for (let windowIndex = 0; windowIndex < windowsPerRow; windowIndex++) {
                const windowX = startX + windowIndex * (windowSize.WIDTH + spacing);
                const windowY = building.y + margin + floor * floorHeight;

                windows.push({
                    x: windowX,
                    y: windowY,
                    width: windowSize.WIDTH,
                    height: windowSize.HEIGHT,
                    isLit: Math.random() > 0.6, // 40% chance of being lit
                });
            }
        }

        return windows;
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
