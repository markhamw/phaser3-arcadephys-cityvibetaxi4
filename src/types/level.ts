export interface Window {
    x: number;
    y: number;
    width: number;
    height: number;
    isLit: boolean;
    type: "standard"; // Simplified to only standard windows
    hasAC: boolean; // Always false in simplified system
    hasAwning: boolean; // Always false in simplified system
    isBroken: boolean; // Always false in simplified system
}

export interface Platform {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: "taxi_spawn" | "passenger_pickup" | "passenger_dropoff" | "neutral";
    buildingId?: string;
    isLandable: boolean;
    collisionBody?: Phaser.Physics.Arcade.Body;
}

export interface RooftopElement {
    x: number;
    y: number;
    width: number;
    height: number;
    type: "chimney" | "ac_unit" | "antenna" | "water_tower" | "stairwell_exit" | "satellite";
}

export interface FireEscape {
    x: number;
    startY: number;
    endY: number;
    side: "left" | "right";
}

export interface Entrance {
    x: number;
    y: number;
    width: number;
    height: number;
    type: "door" | "storefront" | "lobby" | "double_door";
    hasAwning: boolean;
    hasSteps: boolean;
}

export interface Balcony {
    x: number;
    y: number;
    width: number;
    height: number;
    floor: number;
}

export interface BuildingSign {
    x: number;
    y: number;
    width: number;
    height: number;
    type: "neon" | "banner" | "building_number" | "company_name";
    isLit: boolean;
}

export interface Garage {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    isBrick: boolean;
    material: MaterialType;
    depthOffset: number; // 2.5D depth positioning offset
}

export type MaterialType = "solid" | "brick" | "concrete"; // Simplified to 3 materials
export type ArchitecturalStyle = "modern" | "art_deco" | "classical" | "industrial" | "residential";
export type BuildingShape = "rectangle" | "l_shape" | "stepped" | "setback";

export interface Building {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    windows: Window[];
    color: string;
    material: MaterialType; // Only solid, brick, concrete
    style: ArchitecturalStyle; // Always 'modern' in simplified system
    shape: BuildingShape; // Always 'rectangle' in simplified system
    isTall: boolean; // 30% chance for 1.5x height
    depthOffset: number; // Always 0 in simplified system
    garage?: Garage; // Always undefined in simplified system
    rooftopElements: RooftopElement[]; // Always empty in simplified system
    fireEscape?: FireEscape; // Always undefined in simplified system
    entrances: Entrance[]; // Always empty in simplified system
    balconies: Balcony[]; // Always empty in simplified system
    signs: BuildingSign[]; // Always empty in simplified system
    hasWeathering: boolean; // Always false in simplified system
    hasDamage: boolean; // Always false in simplified system
    collisionBody?: Phaser.Physics.Arcade.Body;
}

export interface Cloud {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha: number;
    speed: number;
    clusterId: number; // Which cluster this cloud belongs to
    layer: "background" | "midground" | "foreground"; // Depth layer for alpha variance
}

export interface Bird {
    x: number;
    y: number;
    baseY: number; // Original Y position for wavering calculation
    size: number;
    speed: number;
    waverAmplitude: number;
    waverFrequency: number;
    time: number; // For wavering animation
    distance: "far" | "medium" | "close"; // Distance layer
}


export interface BackgroundBuilding {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    distance: "far" | "very_far";
    windows?: BackgroundWindow[];
}

export interface BackgroundWindow {
    x: number;
    y: number;
    width: number;
    height: number;
    isLit: boolean;
}

export interface Plane {
    x: number;
    y: number;
    size: number;
    speed: number;
    type: "small" | "medium" | "large";
    direction: number; // -1 for left, 1 for right
}

export interface Level {
    buildings: Building[];
    clouds: Cloud[];
    backgroundBuildings: BackgroundBuilding[];
    planes: Plane[];
    width: number;
    height: number;
}

export interface LevelGenerationConfig {
    levelWidth: number;
    levelHeight: number;
    minBuildingGap: number;
    maxBuildingGap: number;
    minBuildingWidth: number;
    maxBuildingWidth: number;
    minBuildingHeight: number;
    maxBuildingHeight: number;
    platformsPerBuilding: { min: number; max: number };
    platformWidth: number;
    platformHeight: number;
    taxiWidth: number;
    taxiHeight: number;
}
