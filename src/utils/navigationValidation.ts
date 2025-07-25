import { Level, Platform, Building } from '../types/level';
import { LEVEL_CONFIG } from '../constants/constants';

export interface NavigationPath {
    from: Platform;
    to: Platform;
    isReachable: boolean;
    obstacles: Building[];
}

export class NavigationValidator {
    static validateLevelNavigation(level: Level): boolean {
        const spawnPlatform = level.spawnPlatform;
        const pickupPlatforms = level.platforms.filter(p => p.type === 'passenger_pickup');
        const dropoffPlatforms = level.platforms.filter(p => p.type === 'passenger_dropoff');

        // Check if spawn can reach all pickup platforms
        for (const pickup of pickupPlatforms) {
            if (!this.canReachPlatform(spawnPlatform, pickup, level.buildings)) {
                return false;
            }
        }

        // Check if all pickup platforms can reach dropoff platforms
        for (const pickup of pickupPlatforms) {
            let canReachAnyDropoff = false;
            for (const dropoff of dropoffPlatforms) {
                if (this.canReachPlatform(pickup, dropoff, level.buildings)) {
                    canReachAnyDropoff = true;
                    break;
                }
            }
            if (!canReachAnyDropoff) {
                return false;
            }
        }

        return true;
    }

    static canReachPlatform(from: Platform, to: Platform, buildings: Building[]): boolean {
        // Simple line-of-sight check with building obstacles
        const path = this.getNavigationPath(from, to, buildings);
        return path.isReachable;
    }

    static getNavigationPath(from: Platform, to: Platform, buildings: Building[]): NavigationPath {
        const obstacles: Building[] = [];
        
        // Get center points of platforms for navigation calculation
        const fromCenter = {
            x: from.x + from.width / 2,
            y: from.y
        };
        const toCenter = {
            x: to.x + to.width / 2,
            y: to.y
        };

        // Check if any buildings block the direct path
        const isReachable = this.hasClearPath(fromCenter, toCenter, buildings, obstacles);

        return {
            from,
            to,
            isReachable,
            obstacles
        };
    }

    private static hasClearPath(
        start: { x: number; y: number },
        end: { x: number; y: number },
        buildings: Building[],
        obstacles: Building[]
    ): boolean {
        // Calculate minimum clearance needed for taxi movement
        const clearanceBuffer = LEVEL_CONFIG.NAVIGATION_CLEARANCE;
        
        for (const building of buildings) {
            // Expand building bounds by clearance buffer
            const expandedBounds = {
                left: building.x - clearanceBuffer,
                right: building.x + building.width + clearanceBuffer,
                top: building.y - clearanceBuffer,
                bottom: building.y + building.height + clearanceBuffer
            };

            // Check if the direct flight path intersects with expanded building
            if (this.lineIntersectsRectangle(start, end, expandedBounds)) {
                obstacles.push(building);
            }
        }

        // Path is clear if no obstacles found
        return obstacles.length === 0;
    }

    private static lineIntersectsRectangle(
        start: { x: number; y: number },
        end: { x: number; y: number },
        rect: { left: number; right: number; top: number; bottom: number }
    ): boolean {
        // Use line-rectangle intersection algorithm
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        // Check intersection with each edge of the rectangle
        const t1 = (rect.left - start.x) / dx;
        const t2 = (rect.right - start.x) / dx;
        const t3 = (rect.top - start.y) / dy;
        const t4 = (rect.bottom - start.y) / dy;

        const tMin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
        const tMax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

        // Line intersects rectangle if tMax >= 0 and tMin <= tMax and tMin <= 1
        return tMax >= 0 && tMin <= tMax && tMin <= 1;
    }

    static getSafeLandingApproaches(platform: Platform, buildings: Building[]): Array<{ x: number; y: number }> {
        const approaches: Array<{ x: number; y: number }> = [];
        const platformCenter = {
            x: platform.x + platform.width / 2,
            y: platform.y
        };

        // Check approach from multiple angles
        const approachAngles = [
            { angle: -45, distance: LEVEL_CONFIG.SAFE_LANDING_CLEARANCE * 2 }, // From upper left
            { angle: 0, distance: LEVEL_CONFIG.SAFE_LANDING_CLEARANCE * 2 },   // From above
            { angle: 45, distance: LEVEL_CONFIG.SAFE_LANDING_CLEARANCE * 2 },  // From upper right
        ];

        for (const approach of approachAngles) {
            const radians = (approach.angle * Math.PI) / 180;
            const approachPoint = {
                x: platformCenter.x + Math.cos(radians) * approach.distance,
                y: platformCenter.y - Math.sin(radians) * approach.distance
            };

            // Check if this approach path is clear
            if (this.hasClearPath(approachPoint, platformCenter, buildings, [])) {
                approaches.push(approachPoint);
            }
        }

        return approaches;
    }

    static findAlternatePaths(from: Platform, to: Platform, buildings: Building[]): NavigationPath[] {
        const alternatePaths: NavigationPath[] = [];
        
        // Try waypoint navigation through gaps between buildings
        const buildingGaps = this.findBuildingGaps(buildings);
        
        for (const gap of buildingGaps) {
            const waypoint = {
                x: gap.x + gap.width / 2,
                y: Math.min(from.y, to.y) - LEVEL_CONFIG.SAFE_LANDING_CLEARANCE
            };

            // Check if we can reach waypoint from start and target from waypoint
            const fromCenter = { x: from.x + from.width / 2, y: from.y };
            const toCenter = { x: to.x + to.width / 2, y: to.y };

            const pathToWaypoint = this.hasClearPath(fromCenter, waypoint, buildings, []);
            const pathFromWaypoint = this.hasClearPath(waypoint, toCenter, buildings, []);

            if (pathToWaypoint && pathFromWaypoint) {
                alternatePaths.push({
                    from,
                    to,
                    isReachable: true,
                    obstacles: []
                });
            }
        }

        return alternatePaths;
    }

    private static findBuildingGaps(buildings: Building[]): Array<{ x: number; width: number }> {
        const gaps: Array<{ x: number; width: number }> = [];
        const sortedBuildings = buildings.slice().sort((a, b) => a.x - b.x);

        for (let i = 1; i < sortedBuildings.length; i++) {
            const prevBuilding = sortedBuildings[i - 1];
            const currentBuilding = sortedBuildings[i];
            
            const gapStart = prevBuilding.x + prevBuilding.width;
            const gapEnd = currentBuilding.x;
            const gapWidth = gapEnd - gapStart;

            if (gapWidth >= LEVEL_CONFIG.MIN_BUILDING_GAP) {
                gaps.push({
                    x: gapStart,
                    width: gapWidth
                });
            }
        }

        return gaps;
    }
}