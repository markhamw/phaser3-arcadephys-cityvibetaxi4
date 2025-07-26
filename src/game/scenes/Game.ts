import { Scene } from "phaser";
import { halfHeight, halfWidth } from "./Pre";
import { LevelGenerator } from "../../generators/LevelGenerator";

import { Level, Cloud, Bird, Plane } from "../../types/level";
import {
    LEVEL_CONFIG,
    ENVIRONMENT_CONFIG,
    MATERIAL_PATTERNS,
    BACKGROUND_CONFIG,
    PLANE_CONFIG,
} from "../../constants/constants";

export class Game extends Scene {
    private level!: Level;
    private levelGraphics!: Phaser.GameObjects.Graphics;
    private environmentGraphics!: Phaser.GameObjects.Graphics;
    private animatedGraphics!: Phaser.GameObjects.Graphics;
    private clouds: Cloud[] = [];
    private birds: Bird[] = [];
    private planes: Plane[] = [];
    private lastBirdSpawn: number = 0;
    private nextBirdSpawn: number = 0;
    private lastPlaneSpawn: number = 0;
    private nextPlaneSpawn: number = 0;

    constructor() {
        super("Game");
    }

    preload() {}

    create() {
        // Enable physics
        this.physics.world.setBounds(0, 0, 700, 300);

        // Add background
        this.add.image(halfWidth(this), halfHeight(this), "citybg").setOrigin(0.5, 0.5);

        // Setup graphics layers first (needed for rendering)
        this.environmentGraphics = this.add.graphics(); // For static background
        this.animatedGraphics = this.add.graphics(); // For animated elements
        this.levelGraphics = this.add.graphics();

        // Generate level
        this.generateLevel();

        // Initialize bird system
        this.initializeBirds();

        // Initialize plane system
        this.initializePlanes();

        // Render static environment elements once
        this.renderStaticEnvironment();
        
        // Render animated environment elements  
        this.renderAnimatedEnvironment();

        // Render level on top
        this.renderLevel();
        
        // Add sprites for scale reference
        this.addScaleReferenceSprites();
    }

    private generateLevel(): void {
        // Generate level with width slightly larger than screen for scrolling
        const levelWidth = 700; // Start with screen width, will increase with difficulty
        const difficulty = 1; // TODO: Get from game progression system

        this.level = LevelGenerator.generateLevel(levelWidth, difficulty);
        this.clouds = [...this.level.clouds]; // Copy clouds for animation

        // Validate level is playable
        if (!LevelGenerator.validateLevel(this.level)) {
            console.warn("Generated level failed validation, regenerating...");
            this.generateLevel(); // Regenerate if invalid
        }
    }

    private renderLevel(): void {
        // Clear existing level graphics
        this.levelGraphics.clear();

        // Render buildings
        console.log(`Rendering ${this.level.buildings.length} buildings`);
        this.level.buildings.forEach((building, index) => {
            console.log(`Rendering building ${index}: x=${building.x}, y=${building.y}, w=${building.width}, h=${building.height}`);
            this.renderBuilding(building);
        });
    }

    private renderStaticEnvironment(): void {
        // Render static elements that don't change (only once)
        this.renderSun();
        this.renderBackgroundMetropolis();
        this.renderStreetHorizon();
    }

    private renderAnimatedEnvironment(): void {
        // Clear only the animated layer
        this.animatedGraphics.clear();
        
        // Render animated elements that need updating every frame
        this.renderClouds();
        this.renderBirds();
        this.renderPlanes();
    }

    private renderStreetHorizon(): void {
        const streetY = LEVEL_CONFIG.GROUND_LEVEL;
        const gameHeight = 300;

        // Dark street area
        this.environmentGraphics.fillStyle(parseInt(ENVIRONMENT_CONFIG.HORIZON.COLOR.replace("#", "0x")));
        this.environmentGraphics.fillRect(0, streetY, 700, LEVEL_CONFIG.STREET_HEIGHT);

        // Horizon gradient with pixel-level variance
        for (let i = 0; i < ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT; i++) {
            const alpha = i / ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.HexStringToColor(ENVIRONMENT_CONFIG.HORIZON.COLOR),
                Phaser.Display.Color.HexStringToColor("#2a2a2a"),
                ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT,
                i
            );

            // Add pixel-level variance to the background landscape
            this.renderTexturedHorizonLine(0, streetY - ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT + i, 700, color);
        }
    }

    private renderTexturedHorizonLine(x: number, y: number, width: number, baseColor: any): void {
        // Define variance range for subtle texture (keeping it dark)
        const varianceRange = 15; // Small variance to keep colors dark
        
        // Render pixel by pixel with subtle color variance
        for (let px = x; px < x + width; px++) {
            // Add random variance while keeping colors dark
            const variance = Math.floor(Math.random() * varianceRange) - (varianceRange / 2);
            
            // Apply variance to RGB components but clamp to keep dark
            const variedR = Math.max(0, Math.min(255, baseColor.r + variance));
            const variedG = Math.max(0, Math.min(255, baseColor.g + variance));
            const variedB = Math.max(0, Math.min(255, baseColor.b + variance));
            
            // Ensure colors stay dark by capping at reasonable maximums
            const maxDarkness = 60; // Keep colors below this threshold
            const finalR = Math.min(variedR, maxDarkness);
            const finalG = Math.min(variedG, maxDarkness);
            const finalB = Math.min(variedB, maxDarkness);
            
            const pixelColor = Phaser.Display.Color.GetColor32(finalR, finalG, finalB, 255);
            this.environmentGraphics.fillStyle(pixelColor);
            this.environmentGraphics.fillRect(px, y, 1, 1);
        }
    }

    private renderSun(): void {
        this.environmentGraphics.fillStyle(parseInt(ENVIRONMENT_CONFIG.SUN.COLOR.replace("#", "0x")));
        this.environmentGraphics.fillCircle(
            ENVIRONMENT_CONFIG.SUN.X_POSITION,
            ENVIRONMENT_CONFIG.SUN.Y_POSITION,
            ENVIRONMENT_CONFIG.SUN.RADIUS
        );
    }

    private renderClouds(): void {
        this.clouds.forEach((cloud) => {
            // Set alpha for translucent clouds
            this.animatedGraphics.fillStyle(0xffffff);
            this.animatedGraphics.alpha = cloud.alpha;

            // Draw pill-shaped cloud (rounded rectangle)
            this.animatedGraphics.fillRoundedRect(cloud.x, cloud.y, cloud.width, cloud.height, cloud.height / 2);

            // Reset alpha
            this.animatedGraphics.alpha = 1;
        });
    }

    private initializeBirds(): void {
        this.birds = [];
        this.lastBirdSpawn = this.time.now;
        this.nextBirdSpawn =
            this.time.now +
            ENVIRONMENT_CONFIG.BIRDS.SPAWN_INTERVAL +
            Math.random() * ENVIRONMENT_CONFIG.BIRDS.SPAWN_VARIANCE;
    }

    private spawnBirdGroup(): void {
        const groupSize =
            Math.floor(
                Math.random() * (ENVIRONMENT_CONFIG.BIRDS.MAX_GROUP_SIZE - ENVIRONMENT_CONFIG.BIRDS.MIN_GROUP_SIZE + 1)
            ) + ENVIRONMENT_CONFIG.BIRDS.MIN_GROUP_SIZE;

        // Randomly choose distance layer (bias toward far birds)
        const rand = Math.random();
        let distance: "far" | "medium" | "close";
        let config;

        if (rand < 0.6) {
            distance = "far";
            config = ENVIRONMENT_CONFIG.BIRDS.FAR;
        } else if (rand < 0.85) {
            distance = "medium";
            config = ENVIRONMENT_CONFIG.BIRDS.MEDIUM;
        } else {
            distance = "close";
            config = ENVIRONMENT_CONFIG.BIRDS.CLOSE;
        }

        // Choose spawn side (left or right)
        const spawnFromLeft = Math.random() > 0.5;
        const startX = spawnFromLeft ? -50 : 750;

        // Base Y position for the group
        const groupY = Math.random() * (config.Y_RANGE.MAX - config.Y_RANGE.MIN) + config.Y_RANGE.MIN;

        // Create birds in loose formation
        for (let i = 0; i < groupSize; i++) {
            const offsetX = (Math.random() - 0.5) * 40; // Spread in formation
            const offsetY = (Math.random() - 0.5) * 20;

            this.birds.push({
                x: startX + offsetX,
                y: groupY + offsetY,
                baseY: groupY + offsetY,
                size: config.SIZE,
                speed: config.SPEED * (spawnFromLeft ? 1 : -1), // Direction based on spawn side
                waverAmplitude: config.WAVER_AMPLITUDE,
                waverFrequency: config.WAVER_FREQUENCY,
                time: Math.random() * Math.PI * 2, // Random start phase
                distance: distance,
            });
        }

        // Schedule next spawn
        this.nextBirdSpawn =
            this.time.now +
            ENVIRONMENT_CONFIG.BIRDS.SPAWN_INTERVAL +
            Math.random() * ENVIRONMENT_CONFIG.BIRDS.SPAWN_VARIANCE;
    }

    private updateBirds(): void {
        // Spawn new bird groups
        if (this.time.now >= this.nextBirdSpawn) {
            this.spawnBirdGroup();
        }

        // Update existing birds
        for (let i = this.birds.length - 1; i >= 0; i--) {
            const bird = this.birds[i];

            // Update position
            bird.x += bird.speed;
            bird.time += bird.waverFrequency;

            // Apply lazy wavering motion
            bird.y = bird.baseY + Math.sin(bird.time) * bird.waverAmplitude;

            // Remove birds that have flown off screen
            if (bird.speed > 0 && bird.x > 750) {
                this.birds.splice(i, 1);
            } else if (bird.speed < 0 && bird.x < -50) {
                this.birds.splice(i, 1);
            }
        }
    }

    private renderBirds(): void {
        // Sort birds by distance (far to close) for proper layering
        const sortedBirds = [...this.birds].sort((a, b) => {
            const order = { far: 0, medium: 1, close: 2 };
            return order[a.distance] - order[b.distance];
        });

        sortedBirds.forEach((bird) => {
            // Set alpha based on distance for atmospheric perspective
            let alpha = 1;
            if (bird.distance === "far") alpha = 0.6;
            else if (bird.distance === "medium") alpha = 0.8;

            this.animatedGraphics.alpha = alpha;
            this.animatedGraphics.fillStyle(0x000000); // Black silhouettes

            if (bird.size === 1) {
                // Single pixel for far birds
                this.animatedGraphics.fillRect(Math.round(bird.x), Math.round(bird.y), 1, 1);
            } else {
                // Simple bird shape for closer birds (small cross or diamond)
                const x = Math.round(bird.x);
                const y = Math.round(bird.y);

                if (bird.size === 2) {
                    // 2-pixel bird (small plus shape)
                    this.animatedGraphics.fillRect(x, y, 1, 1);
                    this.animatedGraphics.fillRect(x - 1, y, 1, 1);
                    this.animatedGraphics.fillRect(x + 1, y, 1, 1);
                } else {
                    // 3-pixel bird (larger plus shape)
                    this.animatedGraphics.fillRect(x, y, 1, 1);
                    this.animatedGraphics.fillRect(x - 1, y, 1, 1);
                    this.animatedGraphics.fillRect(x + 1, y, 1, 1);
                    this.animatedGraphics.fillRect(x, y - 1, 1, 1);
                }
            }

            // Reset alpha
            this.animatedGraphics.alpha = 1;
        });
    }

    private initializePlanes(): void {
        this.planes = [];
        this.lastPlaneSpawn = this.time.now;
        this.nextPlaneSpawn =
            this.time.now +
            PLANE_CONFIG.SPAWN_INTERVAL +
            Math.random() * PLANE_CONFIG.SPAWN_VARIANCE;
    }

    private spawnPlane(): void {
        // Don't spawn if we have too many planes
        if (this.planes.length >= PLANE_CONFIG.MAX_PLANES) {
            return;
        }

        // Randomly choose plane type based on spawn chances
        const rand = Math.random();
        let planeType: "small" | "medium" | "large";
        let config;

        if (rand < PLANE_CONFIG.SMALL.SPAWN_CHANCE) {
            planeType = "small";
            config = PLANE_CONFIG.SMALL;
        } else if (rand < PLANE_CONFIG.SMALL.SPAWN_CHANCE + PLANE_CONFIG.MEDIUM.SPAWN_CHANCE) {
            planeType = "medium";
            config = PLANE_CONFIG.MEDIUM;
        } else {
            planeType = "large";
            config = PLANE_CONFIG.LARGE;
        }

        // Choose spawn side and direction
        const spawnFromLeft = Math.random() > 0.5;
        const startX = spawnFromLeft ? -config.SIZE * 2 : 700 + config.SIZE * 2;
        const direction = spawnFromLeft ? 1 : -1;

        // Random Y position based on plane type
        const y = Math.random() * (config.Y_RANGE.MAX - config.Y_RANGE.MIN) + config.Y_RANGE.MIN;

        this.planes.push({
            x: startX,
            y: y,
            size: config.SIZE,
            speed: config.SPEED * direction,
            type: planeType,
            direction: direction,
        });

        // Schedule next spawn
        this.nextPlaneSpawn =
            this.time.now +
            PLANE_CONFIG.SPAWN_INTERVAL +
            Math.random() * PLANE_CONFIG.SPAWN_VARIANCE;
    }

    private updatePlanes(): void {
        // Spawn new planes
        if (this.time.now >= this.nextPlaneSpawn) {
            this.spawnPlane();
        }

        // Update existing planes
        for (let i = this.planes.length - 1; i >= 0; i--) {
            const plane = this.planes[i];

            // Update position
            plane.x += plane.speed;

            // Remove planes that have flown off screen
            if (plane.direction > 0 && plane.x > 700 + plane.size * 2) {
                this.planes.splice(i, 1);
            } else if (plane.direction < 0 && plane.x < -plane.size * 2) {
                this.planes.splice(i, 1);
            }
        }
    }

    private renderPlanes(): void {
        this.planes.forEach((plane) => {
            // Draw plane as simplified aircraft shape
            this.animatedGraphics.fillStyle(0x444444); // Dark gray for aircraft

            const x = Math.round(plane.x);
            const y = Math.round(plane.y);

            switch (plane.type) {
                case "small":
                    // Simple small aircraft (cross shape)
                    this.animatedGraphics.fillRect(x - 3, y, 6, 1); // Wings
                    this.animatedGraphics.fillRect(x, y - 1, 1, 3); // Fuselage
                    break;

                case "medium":
                    // Medium aircraft (more detailed)
                    this.animatedGraphics.fillRect(x - 6, y, 12, 2); // Wings
                    this.animatedGraphics.fillRect(x - 1, y - 2, 2, 5); // Fuselage
                    this.animatedGraphics.fillRect(x - 2, y + 3, 4, 1); // Tail
                    break;

                case "large":
                    // Large passenger plane (detailed)
                    this.animatedGraphics.fillRect(x - 10, y, 20, 3); // Wings
                    this.animatedGraphics.fillRect(x - 2, y - 3, 4, 7); // Fuselage
                    this.animatedGraphics.fillRect(x - 3, y + 4, 6, 2); // Tail wing
                    this.animatedGraphics.fillRect(x - 1, y + 6, 2, 2); // Vertical tail
                    
                    // Add engines on wings
                    this.animatedGraphics.fillStyle(0x666666);
                    this.animatedGraphics.fillRect(x - 7, y + 1, 2, 1);
                    this.animatedGraphics.fillRect(x + 5, y + 1, 2, 1);
                    break;
            }
        });
    }

    private renderBuilding(building: any): void {
        // Render main building
        this.renderBuildingStructure(
            building,
            building.x,
            building.y,
            building.width,
            building.height,
            building.material
        );

        // No complex elements - just buildings and windows

        // Draw windows
        building.windows.forEach((window: any) => {
            this.renderWindow(window, building);
        });
    }

    private renderBuildingStructure(
        structure: any,
        x: number,
        y: number,
        width: number,
        height: number,
        material: string
    ): void {
        // Simplified material rendering - only solid, brick, concrete
        switch (material) {
            case "brick":
                this.renderBrickTexture(x, y, width, height);
                break;
            case "concrete":
                this.renderSimpleConcreteTexture(x, y, width, height);
                break;
            default: // "solid" or any other material
                this.levelGraphics.fillStyle(parseInt(structure.color.replace("#", "0x")));
                this.levelGraphics.fillRect(x, y, width, height);
        }

        // Simple outline
        this.levelGraphics.lineStyle(1, 0x000000);
        this.levelGraphics.strokeRect(x, y, width, height);
    }

    private renderBrickTexture(x: number, y: number, width: number, height: number): void {
        const brickWidth = MATERIAL_PATTERNS.BRICK.BRICK_WIDTH;
        const brickHeight = MATERIAL_PATTERNS.BRICK.BRICK_HEIGHT;
        const mortarColor = parseInt(MATERIAL_PATTERNS.BRICK.MORTAR_COLOR.replace("#", "0x"));
        const halfBrickWidth = brickWidth / 2;

        // Fill with mortar color first
        this.levelGraphics.fillStyle(mortarColor);
        this.levelGraphics.fillRect(x, y, width, height);

        // Calculate number of full rows
        const numRows = Math.floor(height / brickHeight);

        // Draw brick rows with consistent staggering
        for (let row = 0; row < numRows; row++) {
            const brickY = y + row * brickHeight;
            const isStaggered = row % 2 === 1;

            if (isStaggered) {
                // Staggered row: start with half brick offset
                let currentX = x;

                // First half brick
                const colorIndex = (row * 100) % MATERIAL_PATTERNS.BRICK.BRICK_COLORS.length;
                const brickColorHex = MATERIAL_PATTERNS.BRICK.BRICK_COLORS[colorIndex];
                this.levelGraphics.fillStyle(parseInt(brickColorHex.replace("#", "0x")));
                this.levelGraphics.fillRect(currentX, brickY, halfBrickWidth - 1, brickHeight - 1);
                currentX += halfBrickWidth;

                // Full bricks
                let brickCount = 1;
                while (currentX + brickWidth <= x + width) {
                    const colorIndex2 = (row * 100 + brickCount) % MATERIAL_PATTERNS.BRICK.BRICK_COLORS.length;
                    const brickColorHex2 = MATERIAL_PATTERNS.BRICK.BRICK_COLORS[colorIndex2];
                    this.levelGraphics.fillStyle(parseInt(brickColorHex2.replace("#", "0x")));
                    this.levelGraphics.fillRect(currentX, brickY, brickWidth - 1, brickHeight - 1);
                    currentX += brickWidth;
                    brickCount++;
                }

                // Final partial brick if space remains
                if (currentX < x + width) {
                    const remainingWidth = x + width - currentX;
                    if (remainingWidth >= 3) {
                        // Only if meaningful width
                        const colorIndex3 = (row * 100 + brickCount) % MATERIAL_PATTERNS.BRICK.BRICK_COLORS.length;
                        const brickColorHex3 = MATERIAL_PATTERNS.BRICK.BRICK_COLORS[colorIndex3];
                        this.levelGraphics.fillStyle(parseInt(brickColorHex3.replace("#", "0x")));
                        this.levelGraphics.fillRect(currentX, brickY, remainingWidth - 1, brickHeight - 1);
                    }
                }
            } else {
                // Regular row: start aligned with building edge
                let currentX = x;
                let brickCount = 0;

                // Full bricks
                while (currentX + brickWidth <= x + width) {
                    const colorIndex = (row * 100 + brickCount) % MATERIAL_PATTERNS.BRICK.BRICK_COLORS.length;
                    const brickColorHex = MATERIAL_PATTERNS.BRICK.BRICK_COLORS[colorIndex];
                    this.levelGraphics.fillStyle(parseInt(brickColorHex.replace("#", "0x")));
                    this.levelGraphics.fillRect(currentX, brickY, brickWidth - 1, brickHeight - 1);
                    currentX += brickWidth;
                    brickCount++;
                }

                // Final partial brick if space remains
                if (currentX < x + width) {
                    const remainingWidth = x + width - currentX;
                    if (remainingWidth >= 3) {
                        // Only if meaningful width
                        const colorIndex2 = (row * 100 + brickCount) % MATERIAL_PATTERNS.BRICK.BRICK_COLORS.length;
                        const brickColorHex2 = MATERIAL_PATTERNS.BRICK.BRICK_COLORS[colorIndex2];
                        this.levelGraphics.fillStyle(parseInt(brickColorHex2.replace("#", "0x")));
                        this.levelGraphics.fillRect(currentX, brickY, remainingWidth - 1, brickHeight - 1);
                    }
                }
            }
        }

        // Handle partial bottom row if needed
        const remainingHeight = height - numRows * brickHeight;
        if (remainingHeight >= 3) {
            const brickY = y + numRows * brickHeight;
            const isStaggered = numRows % 2 === 1;
            let currentX = x;

            if (isStaggered) {
                // Half brick start
                const colorIndex = (numRows * 100) % MATERIAL_PATTERNS.BRICK.BRICK_COLORS.length;
                const brickColorHex = MATERIAL_PATTERNS.BRICK.BRICK_COLORS[colorIndex];
                this.levelGraphics.fillStyle(parseInt(brickColorHex.replace("#", "0x")));
                this.levelGraphics.fillRect(currentX, brickY, halfBrickWidth - 1, remainingHeight - 1);
                currentX += halfBrickWidth;
            }

            // Continue with full/partial bricks for remainder of row
            let brickCount = isStaggered ? 1 : 0;
            while (currentX < x + width) {
                const widthToDraw = Math.min(brickWidth, x + width - currentX);
                if (widthToDraw >= 3) {
                    const colorIndex = (numRows * 100 + brickCount) % MATERIAL_PATTERNS.BRICK.BRICK_COLORS.length;
                    const brickColorHex = MATERIAL_PATTERNS.BRICK.BRICK_COLORS[colorIndex];
                    this.levelGraphics.fillStyle(parseInt(brickColorHex.replace("#", "0x")));
                    this.levelGraphics.fillRect(currentX, brickY, widthToDraw - 1, remainingHeight - 1);
                }
                currentX += brickWidth;
                brickCount++;
            }
        }
    }

    // Simplified concrete texture
    private renderSimpleConcreteTexture(x: number, y: number, width: number, height: number): void {
        this.levelGraphics.fillStyle(0x808080); // Simple gray concrete
        this.levelGraphics.fillRect(x, y, width, height);
    }

    // Legacy method (kept for compatibility)
    private renderConcreteTexture(x: number, y: number, width: number, height: number, structure: any): void {
        const baseColor =
            MATERIAL_PATTERNS.CONCRETE.BASE_COLORS[
                Math.floor(Math.random() * MATERIAL_PATTERNS.CONCRETE.BASE_COLORS.length)
            ];
        this.levelGraphics.fillStyle(parseInt(baseColor.replace("#", "0x")));
        this.levelGraphics.fillRect(x, y, width, height);

        // Add subtle texture lines
        this.levelGraphics.lineStyle(1, parseInt(MATERIAL_PATTERNS.CONCRETE.STAIN_COLORS[0].replace("#", "0x")));
        for (let i = 0; i < height; i += 8) {
            if (Math.random() > 0.7) {
                this.levelGraphics.moveTo(x, y + i);
                this.levelGraphics.lineTo(x + width, y + i);
            }
        }
    }

    private renderGlassTexture(x: number, y: number, width: number, height: number): void {
        const glassColor =
            MATERIAL_PATTERNS.GLASS.COLORS[Math.floor(Math.random() * MATERIAL_PATTERNS.GLASS.COLORS.length)];
        this.levelGraphics.fillStyle(parseInt(glassColor.replace("#", "0x")));
        this.levelGraphics.alpha = 0.7; // Transparent glass
        this.levelGraphics.fillRect(x, y, width, height);
        this.levelGraphics.alpha = 1;

        // Add reflection strips
        this.levelGraphics.fillStyle(0xffffff);
        this.levelGraphics.alpha = MATERIAL_PATTERNS.GLASS.REFLECTION_ALPHA;
        for (let i = 0; i < width; i += 12) {
            this.levelGraphics.fillRect(x + i, y, 2, height);
        }
        this.levelGraphics.alpha = 1;
    }

    private renderMetalTexture(x: number, y: number, width: number, height: number, structure: any): void {
        const metalColor =
            MATERIAL_PATTERNS.METAL.COLORS[Math.floor(Math.random() * MATERIAL_PATTERNS.METAL.COLORS.length)];
        this.levelGraphics.fillStyle(parseInt(metalColor.replace("#", "0x")));
        this.levelGraphics.fillRect(x, y, width, height);

        // Add rust patches if weathered
        if (structure.hasWeathering && Math.random() > 0.5) {
            const rustColor =
                MATERIAL_PATTERNS.METAL.RUST_COLORS[
                    Math.floor(Math.random() * MATERIAL_PATTERNS.METAL.RUST_COLORS.length)
                ];
            this.levelGraphics.fillStyle(parseInt(rustColor.replace("#", "0x")));
            const patchWidth = 4 + Math.random() * 8;
            const patchHeight = 4 + Math.random() * 8;
            this.levelGraphics.fillRect(
                x + Math.random() * (width - patchWidth),
                y + Math.random() * (height - patchHeight),
                patchWidth,
                patchHeight
            );
        }
    }

    private renderStuccoTexture(x: number, y: number, width: number, height: number): void {
        const stuccoColor =
            MATERIAL_PATTERNS.STUCCO.COLORS[Math.floor(Math.random() * MATERIAL_PATTERNS.STUCCO.COLORS.length)];
        this.levelGraphics.fillStyle(parseInt(stuccoColor.replace("#", "0x")));
        this.levelGraphics.fillRect(x, y, width, height);

        // Add rough texture dots
        this.levelGraphics.fillStyle(parseInt(stuccoColor.replace("#", "0x")) - 0x101010);
        for (let i = 0; i < (width * height) / 20; i++) {
            const dotX = x + Math.random() * width;
            const dotY = y + Math.random() * height;
            this.levelGraphics.fillRect(
                dotX,
                dotY,
                MATERIAL_PATTERNS.STUCCO.TEXTURE_SIZE,
                MATERIAL_PATTERNS.STUCCO.TEXTURE_SIZE
            );
        }
    }

    private renderWeatheringEffects(x: number, y: number, width: number, height: number): void {
        // Water stains
        this.levelGraphics.fillStyle(0x404040);
        this.levelGraphics.alpha = 0.3;
        for (let i = 0; i < 3; i++) {
            const stainX = x + Math.random() * width;
            const stainY = y + Math.random() * height * 0.5; // Upper half
            const stainWidth = 2 + Math.random() * 6;
            const stainHeight = height * 0.3 + Math.random() * height * 0.4;
            this.levelGraphics.fillRect(stainX, stainY, stainWidth, stainHeight);
        }
        this.levelGraphics.alpha = 1;
    }

    private renderDamageEffects(x: number, y: number, width: number, height: number): void {
        // Cracks
        this.levelGraphics.lineStyle(1, 0x303030);
        for (let i = 0; i < 2; i++) {
            const startX = x + Math.random() * width;
            const startY = y + Math.random() * height;
            const endX = startX + (Math.random() - 0.5) * 20;
            const endY = startY + Math.random() * 30;
            this.levelGraphics.moveTo(startX, startY);
            this.levelGraphics.lineTo(endX, endY);
        }
    }

    private renderWindow(window: any, building?: any): void {
        let actualWidth = window.width;
        let actualHeight = window.height;

        // Adjust size based on window type
        switch (window.type) {
            case "bay":
                actualWidth += 4;
                break;
            case "floor_ceiling":
                actualHeight += 8;
                break;
            case "small":
                actualWidth = Math.max(6, actualWidth - 4);
                actualHeight = Math.max(6, actualHeight - 4);
                break;
        }

        // Window frame (darker)
        this.levelGraphics.fillStyle(0x222222);
        this.levelGraphics.fillRect(window.x, window.y, actualWidth, actualHeight);

        // Window glass (inner area)
        const glassMargin = 1;
        const glassWidth = actualWidth - glassMargin * 2;
        const glassHeight = actualHeight - glassMargin * 2;

        if (glassWidth > 0 && glassHeight > 0) {
            let windowColor = window.isLit ? 0xffeb3b : 0x2c3e50;

            // Different colors for broken windows
            if (window.isBroken) {
                windowColor = 0x000000;
            }

            this.levelGraphics.fillStyle(windowColor);
            this.levelGraphics.fillRect(window.x + glassMargin, window.y + glassMargin, glassWidth, glassHeight);

            // Add window dividers for larger windows
            if (actualWidth >= 8 && actualHeight >= 8 && !window.isBroken) {
                this.levelGraphics.fillStyle(0x222222);
                // Vertical divider
                this.levelGraphics.fillRect(
                    window.x + Math.floor(actualWidth / 2) - 0.5,
                    window.y + glassMargin,
                    1,
                    glassHeight
                );
                // Horizontal divider
                this.levelGraphics.fillRect(
                    window.x + glassMargin,
                    window.y + Math.floor(actualHeight / 2) - 0.5,
                    glassWidth,
                    1
                );
            }
        }

        // Add AC unit if present
        if (window.hasAC && actualWidth >= 8 && actualHeight >= 6) {
            this.levelGraphics.fillStyle(0x808080);
            // Position AC unit in bottom-right corner of window, within bounds
            const acWidth = Math.min(6, actualWidth - 2);
            const acHeight = Math.min(4, actualHeight - 2);
            this.levelGraphics.fillRect(
                window.x + actualWidth - acWidth - 1,
                window.y + actualHeight - acHeight - 1,
                acWidth,
                acHeight
            );
        }

        // Add awning if present
        if (window.hasAwning) {
            this.levelGraphics.fillStyle(0x8b4513);
            this.levelGraphics.fillRect(window.x - 2, window.y - 4, actualWidth + 4, 3);
        }
    }

    private renderEntrance(entrance: any): void {
        // Entrance door/opening
        switch (entrance.type) {
            case "storefront":
                this.levelGraphics.fillStyle(0x333333);
                this.levelGraphics.fillRect(entrance.x, entrance.y, entrance.width, entrance.height);
                // Glass storefront
                this.levelGraphics.fillStyle(0x4682b4);
                this.levelGraphics.alpha = 0.6;
                this.levelGraphics.fillRect(entrance.x + 2, entrance.y + 2, entrance.width - 4, entrance.height - 4);
                this.levelGraphics.alpha = 1;
                break;
            case "double_door":
                this.levelGraphics.fillStyle(0x8b4513);
                this.levelGraphics.fillRect(entrance.x, entrance.y, entrance.width / 2 - 1, entrance.height);
                this.levelGraphics.fillRect(
                    entrance.x + entrance.width / 2 + 1,
                    entrance.y,
                    entrance.width / 2 - 1,
                    entrance.height
                );
                break;
            default:
                this.levelGraphics.fillStyle(0x8b4513);
                this.levelGraphics.fillRect(entrance.x, entrance.y, entrance.width, entrance.height);
        }

        // Steps if present
        if (entrance.hasSteps) {
            this.levelGraphics.fillStyle(0x696969);
            this.levelGraphics.fillRect(entrance.x - 2, entrance.y + entrance.height, entrance.width + 4, 2);
            this.levelGraphics.fillRect(entrance.x - 4, entrance.y + entrance.height + 2, entrance.width + 8, 2);
        }

        // Awning if present
        if (entrance.hasAwning) {
            this.levelGraphics.fillStyle(0x8b0000);
            this.levelGraphics.fillRect(entrance.x - 4, entrance.y - 6, entrance.width + 8, 4);
        }
    }

    private renderFireEscape(fireEscape: any): void {
        this.levelGraphics.lineStyle(2, 0x444444);

        // Main vertical structure
        this.levelGraphics.moveTo(fireEscape.x, fireEscape.startY);
        this.levelGraphics.lineTo(fireEscape.x, fireEscape.endY);

        // Platforms every 25 pixels
        const platformSpacing = 25;
        for (let y = fireEscape.startY; y < fireEscape.endY; y += platformSpacing) {
            // Platform
            this.levelGraphics.moveTo(fireEscape.x - 8, y);
            this.levelGraphics.lineTo(fireEscape.x + 8, y);
            // Railing
            this.levelGraphics.moveTo(fireEscape.x - 8, y - 6);
            this.levelGraphics.lineTo(fireEscape.x + 8, y - 6);
        }
    }

    private renderBalcony(balcony: any): void {
        // Balcony platform
        this.levelGraphics.fillStyle(0x696969);
        this.levelGraphics.fillRect(balcony.x, balcony.y, balcony.width, balcony.height);

        // Railing
        this.levelGraphics.lineStyle(1, 0x444444);
        this.levelGraphics.moveTo(balcony.x, balcony.y);
        this.levelGraphics.lineTo(balcony.x + balcony.width, balcony.y);
        this.levelGraphics.moveTo(balcony.x, balcony.y);
        this.levelGraphics.lineTo(balcony.x, balcony.y - 8);
        this.levelGraphics.moveTo(balcony.x + balcony.width, balcony.y);
        this.levelGraphics.lineTo(balcony.x + balcony.width, balcony.y - 8);
    }

    private renderRooftopElement(element: any): void {
        switch (element.type) {
            case "chimney":
                this.levelGraphics.fillStyle(0x8b4513);
                this.levelGraphics.fillRect(element.x, element.y, element.width, element.height);
                // Chimney cap
                this.levelGraphics.fillStyle(0x696969);
                this.levelGraphics.fillRect(element.x - 1, element.y, element.width + 2, 2);
                break;
            case "ac_unit":
                this.levelGraphics.fillStyle(0xc0c0c0);
                this.levelGraphics.fillRect(element.x, element.y, element.width, element.height);
                // Vent lines
                this.levelGraphics.lineStyle(1, 0x808080);
                for (let i = 1; i < element.width - 1; i += 2) {
                    this.levelGraphics.moveTo(element.x + i, element.y);
                    this.levelGraphics.lineTo(element.x + i, element.y + element.height);
                }
                break;
            case "antenna":
                this.levelGraphics.lineStyle(2, 0x444444);
                this.levelGraphics.moveTo(element.x, element.y + element.height);
                this.levelGraphics.lineTo(element.x, element.y);
                // Cross beams
                this.levelGraphics.moveTo(element.x - 3, element.y + 4);
                this.levelGraphics.lineTo(element.x + 3, element.y + 4);
                break;
            case "water_tower":
                this.levelGraphics.fillStyle(0x696969);
                this.levelGraphics.fillRect(element.x, element.y, element.width, element.height);
                // Cylindrical appearance
                this.levelGraphics.lineStyle(1, 0x555555);
                for (let i = 0; i < element.height; i += 4) {
                    this.levelGraphics.moveTo(element.x, element.y + i);
                    this.levelGraphics.lineTo(element.x + element.width, element.y + i);
                }
                break;
            case "stairwell_exit":
                this.levelGraphics.fillStyle(0x8b4513);
                this.levelGraphics.fillRect(element.x, element.y, element.width, element.height);
                // Door
                this.levelGraphics.fillStyle(0x654321);
                this.levelGraphics.fillRect(element.x + 2, element.y + 2, 4, element.height - 2);
                break;
            case "satellite":
                this.levelGraphics.fillStyle(0xdcdcdc);
                this.levelGraphics.fillCircle(
                    element.x + element.width / 2,
                    element.y + element.height / 2,
                    element.width / 2
                );
                break;
        }
    }

    private renderSign(sign: any): void {
        switch (sign.type) {
            case "neon":
                this.levelGraphics.fillStyle(sign.isLit ? 0xff00ff : 0x800080);
                this.levelGraphics.fillRect(sign.x, sign.y, sign.width, sign.height);
                if (sign.isLit) {
                    // Glow effect
                    this.levelGraphics.alpha = 0.3;
                    this.levelGraphics.fillRect(sign.x - 1, sign.y - 1, sign.width + 2, sign.height + 2);
                    this.levelGraphics.alpha = 1;
                }
                break;
            case "banner":
                this.levelGraphics.fillStyle(0xff4500);
                this.levelGraphics.fillRect(sign.x, sign.y, sign.width, sign.height);
                break;
            case "building_number":
                this.levelGraphics.fillStyle(0xffffff);
                this.levelGraphics.fillRect(sign.x, sign.y, sign.width, sign.height);
                this.levelGraphics.fillStyle(0x000000);
                this.levelGraphics.fillRect(sign.x + 1, sign.y + 1, sign.width - 2, sign.height - 2);
                break;
            case "company_name":
                this.levelGraphics.fillStyle(0x000080);
                this.levelGraphics.fillRect(sign.x, sign.y, sign.width, sign.height);
                this.levelGraphics.fillStyle(0xffffff);
                this.levelGraphics.fillRect(sign.x + 1, sign.y + 1, sign.width - 2, sign.height - 2);
                break;
        }
    }

    private renderBackgroundMetropolis(): void {
        // Sort by distance - very far first, then far
        const sortedBuildings = [...this.level.backgroundBuildings].sort((a, b) => {
            const order = { very_far: 0, far: 1 };
            return order[a.distance] - order[b.distance];
        });

        sortedBuildings.forEach((building) => {
            const alpha =
                building.distance === "very_far"
                    ? BACKGROUND_CONFIG.VERY_FAR_BUILDINGS.ALPHA
                    : BACKGROUND_CONFIG.FAR_BUILDINGS.ALPHA;

            this.environmentGraphics.alpha = alpha;
            this.environmentGraphics.fillStyle(parseInt(building.color.replace("#", "0x")));
            this.environmentGraphics.fillRect(building.x, building.y, building.width, building.height);
            
            // Render windows if they exist
            if (building.windows) {
                building.windows.forEach((window) => {
                    const windowColor = window.isLit ? 0xffff88 : 0x333333; // Lit or dark
                    this.environmentGraphics.fillStyle(windowColor);
                    this.environmentGraphics.fillRect(window.x, window.y, window.width, window.height);
                });
            }
            
            this.environmentGraphics.alpha = 1;
        });
    }


    update(): void {
        // Animate clouds
        this.clouds.forEach((cloud) => {
            cloud.x += cloud.speed;

            // Wrap clouds around screen
            if (cloud.x > 700 + cloud.width) {
                cloud.x = -cloud.width;
            }
        });

        // Update birds
        this.updateBirds();

        // Update planes
        this.updatePlanes();

        // Only update animated elements (static background rendered once)
        this.renderAnimatedEnvironment();
        // Game update loop - will be expanded for taxi physics, passengers, etc.
    }

    private addScaleReferenceSprites(): void {
        // Add passenger sprite on the ground for scale reference
        const passengerX = 200;
        const passengerY = LEVEL_CONFIG.GROUND_LEVEL - 16; // Place on ground
        const passenger = this.add.image(passengerX, passengerY, "passenger").setOrigin(0.5, 1);
        console.log(`Passenger sprite added at: x=${passengerX}, y=${passengerY}`);
        
        // Place taxi on street level between buildings if available
        if (this.level.buildings.length >= 2) {
            const firstBuilding = this.level.buildings[0];
            const secondBuilding = this.level.buildings[1];
            const taxiX = firstBuilding.x + firstBuilding.width + (secondBuilding.x - (firstBuilding.x + firstBuilding.width)) / 2;
            const taxiY = LEVEL_CONFIG.GROUND_LEVEL;
            const taxi = this.add.image(taxiX, taxiY, "taxi").setOrigin(0.5, 1);
            console.log(`Taxi sprite added on street between buildings at: x=${taxiX}, y=${taxiY}`);
        } else if (this.level.buildings.length > 0) {
            // Fallback: place taxi next to first building if only one building exists
            const firstBuilding = this.level.buildings[0];
            const taxiX = firstBuilding.x + firstBuilding.width + 50;
            const taxiY = LEVEL_CONFIG.GROUND_LEVEL;
            const taxi = this.add.image(taxiX, taxiY, "taxi").setOrigin(0.5, 1);
            console.log(`Taxi sprite added on street next to building at: x=${taxiX}, y=${taxiY}`);
        }
        
        // Place second passenger on second building if available
        if (this.level.buildings.length > 1) {
            const secondBuilding = this.level.buildings[1];
            const passenger2OnBuildingX = secondBuilding.x + secondBuilding.width / 2;
            const passenger2OnBuildingY = secondBuilding.y;
            const passenger2 = this.add.image(passenger2OnBuildingX, passenger2OnBuildingY, "passenger2").setOrigin(0.5, 1);
            console.log(`Passenger2 sprite added on second building at: x=${passenger2OnBuildingX}, y=${passenger2OnBuildingY}`);
        }
    }

    shutdown(): void {
        // Cleanup when scene shuts down
        if (this.levelGraphics) {
            this.levelGraphics.destroy();
        }
        if (this.environmentGraphics) {
            this.environmentGraphics.destroy();
        }
        if (this.animatedGraphics) {
            this.animatedGraphics.destroy();
        }
    }
}
