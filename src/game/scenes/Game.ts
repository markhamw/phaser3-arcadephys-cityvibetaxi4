import { Scene } from "phaser";
import { halfHeight, halfWidth } from "./Pre";
import { LevelGenerator } from "../../generators/LevelGenerator";

import { Level, Cloud, Bird } from "../../types/level";
import { LEVEL_CONFIG, ENVIRONMENT_CONFIG, BRICK_PATTERNS } from "../../constants/constants";

export class Game extends Scene {
    private level!: Level;
    private levelGraphics!: Phaser.GameObjects.Graphics;
    private environmentGraphics!: Phaser.GameObjects.Graphics;
    private clouds: Cloud[] = [];
    private birds: Bird[] = [];
    private lastBirdSpawn: number = 0;
    private nextBirdSpawn: number = 0;

    constructor() {
        super("Game");
    }

    preload() {}

    create() {
        // Enable physics
        this.physics.world.setBounds(0, 0, 700, 300);

        // Add background
        this.add.image(halfWidth(this), halfHeight(this), "citybg").setOrigin(0.5, 0.5);

        // Generate level
        this.generateLevel();

        // Setup graphics layers
        this.environmentGraphics = this.add.graphics();

        // Initialize bird system
        this.initializeBirds();

        // Render environment first
        this.renderEnvironment();

        // Render level on top
        this.renderLevel();
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
        // Create graphics object for drawing level
        this.levelGraphics = this.add.graphics();

        // Render buildings
        this.level.buildings.forEach((building) => {
            this.renderBuilding(building);
        });
    }

    private renderEnvironment(): void {
        // Render street/horizon
        this.renderStreetHorizon();

        // Render sun
        this.renderSun();

        // Render clouds
        this.renderClouds();

        // Render birds
        this.renderBirds();
    }

    private renderStreetHorizon(): void {
        const streetY = LEVEL_CONFIG.GROUND_LEVEL;
        const gameHeight = 300;

        // Dark street area
        this.environmentGraphics.fillStyle(parseInt(ENVIRONMENT_CONFIG.HORIZON.COLOR.replace("#", "0x")));
        this.environmentGraphics.fillRect(0, streetY, 700, LEVEL_CONFIG.STREET_HEIGHT);

        // Horizon gradient
        for (let i = 0; i < ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT; i++) {
            const alpha = i / ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.HexStringToColor(ENVIRONMENT_CONFIG.HORIZON.COLOR),
                Phaser.Display.Color.HexStringToColor("#2a2a2a"),
                ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT,
                i
            );

            this.environmentGraphics.fillStyle(Phaser.Display.Color.GetColor32(color.r, color.g, color.b, 255));
            this.environmentGraphics.fillRect(0, streetY - ENVIRONMENT_CONFIG.HORIZON.GRADIENT_HEIGHT + i, 700, 1);
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
            this.environmentGraphics.fillStyle(0xffffff);
            this.environmentGraphics.alpha = cloud.alpha;

            // Draw pill-shaped cloud (rounded rectangle)
            this.environmentGraphics.fillRoundedRect(cloud.x, cloud.y, cloud.width, cloud.height, cloud.height / 2);

            // Reset alpha
            this.environmentGraphics.alpha = 1;
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

            this.environmentGraphics.alpha = alpha;
            this.environmentGraphics.fillStyle(0x000000); // Black silhouettes

            if (bird.size === 1) {
                // Single pixel for far birds
                this.environmentGraphics.fillRect(Math.round(bird.x), Math.round(bird.y), 1, 1);
            } else {
                // Simple bird shape for closer birds (small cross or diamond)
                const x = Math.round(bird.x);
                const y = Math.round(bird.y);

                if (bird.size === 2) {
                    // 2-pixel bird (small plus shape)
                    this.environmentGraphics.fillRect(x, y, 1, 1);
                    this.environmentGraphics.fillRect(x - 1, y, 1, 1);
                    this.environmentGraphics.fillRect(x + 1, y, 1, 1);
                } else {
                    // 3-pixel bird (larger plus shape)
                    this.environmentGraphics.fillRect(x, y, 1, 1);
                    this.environmentGraphics.fillRect(x - 1, y, 1, 1);
                    this.environmentGraphics.fillRect(x + 1, y, 1, 1);
                    this.environmentGraphics.fillRect(x, y - 1, 1, 1);
                }
            }

            // Reset alpha
            this.environmentGraphics.alpha = 1;
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
            building.isBrick
        );

        // Render garage if present
        if (building.garage) {
            this.renderBuildingStructure(
                building.garage,
                building.garage.x,
                building.garage.y,
                building.garage.width,
                building.garage.height,
                building.garage.isBrick
            );
        }

        // Draw windows
        building.windows.forEach((window: any) => {
            // Window frame (darker)
            this.levelGraphics.fillStyle(0x222222);
            this.levelGraphics.fillRect(window.x, window.y, window.width, window.height);

            // Window glass (inner area)
            const glassMargin = 1;
            const glassWidth = window.width - glassMargin * 2;
            const glassHeight = window.height - glassMargin * 2;

            if (glassWidth > 0 && glassHeight > 0) {
                const windowColor = window.isLit ? 0xffeb3b : 0x2c3e50; // Warm yellow or blue-gray
                this.levelGraphics.fillStyle(windowColor);
                this.levelGraphics.fillRect(window.x + glassMargin, window.y + glassMargin, glassWidth, glassHeight);

                // Add window cross divider for realism
                if (window.width >= 8 && window.height >= 8) {
                    this.levelGraphics.fillStyle(0x222222);
                    // Vertical divider
                    this.levelGraphics.fillRect(
                        window.x + Math.floor(window.width / 2) - 0.5,
                        window.y + glassMargin,
                        1,
                        glassHeight
                    );
                    // Horizontal divider
                    this.levelGraphics.fillRect(
                        window.x + glassMargin,
                        window.y + Math.floor(window.height / 2) - 0.5,
                        glassWidth,
                        1
                    );
                }
            }
        });
    }

    private renderBuildingStructure(
        structure: any,
        x: number,
        y: number,
        width: number,
        height: number,
        isBrick: boolean
    ): void {
        if (isBrick) {
            this.renderBrickTexture(x, y, width, height);
        } else {
            // Draw solid color building
            this.levelGraphics.fillStyle(parseInt(structure.color.replace("#", "0x")));
            this.levelGraphics.fillRect(x, y, width, height);
        }

        // Draw outline
        this.levelGraphics.lineStyle(1, 0x000000);
        this.levelGraphics.strokeRect(x, y, width, height);
    }

    private renderBrickTexture(x: number, y: number, width: number, height: number): void {
        const brickWidth = BRICK_PATTERNS.STANDARD.BRICK_WIDTH;
        const brickHeight = BRICK_PATTERNS.STANDARD.BRICK_HEIGHT;
        const mortarColor = parseInt(BRICK_PATTERNS.STANDARD.MORTAR_COLOR.replace("#", "0x"));
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
                const colorIndex = (row * 100) % BRICK_PATTERNS.STANDARD.BRICK_COLORS.length;
                const brickColorHex = BRICK_PATTERNS.STANDARD.BRICK_COLORS[colorIndex];
                this.levelGraphics.fillStyle(parseInt(brickColorHex.replace("#", "0x")));
                this.levelGraphics.fillRect(currentX, brickY, halfBrickWidth - 1, brickHeight - 1);
                currentX += halfBrickWidth;

                // Full bricks
                let brickCount = 1;
                while (currentX + brickWidth <= x + width) {
                    const colorIndex2 = (row * 100 + brickCount) % BRICK_PATTERNS.STANDARD.BRICK_COLORS.length;
                    const brickColorHex2 = BRICK_PATTERNS.STANDARD.BRICK_COLORS[colorIndex2];
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
                        const colorIndex3 = (row * 100 + brickCount) % BRICK_PATTERNS.STANDARD.BRICK_COLORS.length;
                        const brickColorHex3 = BRICK_PATTERNS.STANDARD.BRICK_COLORS[colorIndex3];
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
                    const colorIndex = (row * 100 + brickCount) % BRICK_PATTERNS.STANDARD.BRICK_COLORS.length;
                    const brickColorHex = BRICK_PATTERNS.STANDARD.BRICK_COLORS[colorIndex];
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
                        const colorIndex2 = (row * 100 + brickCount) % BRICK_PATTERNS.STANDARD.BRICK_COLORS.length;
                        const brickColorHex2 = BRICK_PATTERNS.STANDARD.BRICK_COLORS[colorIndex2];
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
                const colorIndex = (numRows * 100) % BRICK_PATTERNS.STANDARD.BRICK_COLORS.length;
                const brickColorHex = BRICK_PATTERNS.STANDARD.BRICK_COLORS[colorIndex];
                this.levelGraphics.fillStyle(parseInt(brickColorHex.replace("#", "0x")));
                this.levelGraphics.fillRect(currentX, brickY, halfBrickWidth - 1, remainingHeight - 1);
                currentX += halfBrickWidth;
            }

            // Continue with full/partial bricks for remainder of row
            let brickCount = isStaggered ? 1 : 0;
            while (currentX < x + width) {
                const widthToDraw = Math.min(brickWidth, x + width - currentX);
                if (widthToDraw >= 3) {
                    const colorIndex = (numRows * 100 + brickCount) % BRICK_PATTERNS.STANDARD.BRICK_COLORS.length;
                    const brickColorHex = BRICK_PATTERNS.STANDARD.BRICK_COLORS[colorIndex];
                    this.levelGraphics.fillStyle(parseInt(brickColorHex.replace("#", "0x")));
                    this.levelGraphics.fillRect(currentX, brickY, widthToDraw - 1, remainingHeight - 1);
                }
                currentX += brickWidth;
                brickCount++;
            }
        }
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

        // Re-render environment with new positions
        this.environmentGraphics.clear();
        this.renderEnvironment();
        // Game update loop - will be expanded for taxi physics, passengers, etc.
    }

    shutdown(): void {
        // Cleanup when scene shuts down
        if (this.levelGraphics) {
            this.levelGraphics.destroy();
        }
        if (this.environmentGraphics) {
            this.environmentGraphics.destroy();
        }
    }
}
