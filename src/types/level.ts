export interface Window {
    x: number;
    y: number;
    width: number;
    height: number;
    isLit: boolean;
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

export interface Garage {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    isBrick: boolean;
}

export interface Building {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    windows: Window[];
    color: string;
    isBrick: boolean;
    isTall: boolean;
    garage?: Garage;
    collisionBody?: Phaser.Physics.Arcade.Body;
}

export interface Cloud {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha: number;
    speed: number;
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

export interface Level {
    buildings: Building[];
    clouds: Cloud[];
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
