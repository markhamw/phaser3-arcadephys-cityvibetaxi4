import { Scene } from 'phaser';
import { Building, Platform, Level } from '../types/level';

export class CollisionManager {
    private scene: Scene;
    private buildingBodies: Phaser.Physics.Arcade.StaticGroup;
    private platformBodies: Phaser.Physics.Arcade.StaticGroup;

    constructor(scene: Scene) {
        this.scene = scene;
        this.buildingBodies = this.scene.physics.add.staticGroup();
        this.platformBodies = this.scene.physics.add.staticGroup();
    }

    setupLevelCollisions(level: Level): void {
        this.createBuildingCollisions(level.buildings);
        this.createPlatformCollisions(level.platforms);
    }

    private createBuildingCollisions(buildings: Building[]): void {
        buildings.forEach(building => {
            // Create invisible rectangle for building collision
            const collisionRect = this.scene.add.rectangle(
                building.x + building.width / 2,
                building.y + building.height / 2,
                building.width,
                building.height,
                0x000000,
                0 // Invisible
            );

            // Add to physics as static body
            this.buildingBodies.add(collisionRect);
            const body = collisionRect.body as Phaser.Physics.Arcade.StaticBody;
            
            // Store reference in building for later use
            building.collisionBody = body;
        });
    }

    private createPlatformCollisions(platforms: Platform[]): void {
        platforms.forEach(platform => {
            // Create invisible rectangle for platform collision
            const collisionRect = this.scene.add.rectangle(
                platform.x + platform.width / 2,
                platform.y + platform.height / 2,
                platform.width,
                platform.height,
                0x000000,
                0 // Invisible
            );

            // Add to physics as static body
            this.platformBodies.add(collisionRect);
            const body = collisionRect.body as Phaser.Physics.Arcade.StaticBody;
            
            // Store reference in platform for later use
            platform.collisionBody = body;
        });
    }

    getBuildingBodies(): Phaser.Physics.Arcade.StaticGroup {
        return this.buildingBodies;
    }

    getPlatformBodies(): Phaser.Physics.Arcade.StaticGroup {
        return this.platformBodies;
    }

    setupTaxiCollisions(taxi: Phaser.Physics.Arcade.Sprite): void {
        // Collision with buildings - solid collision
        this.scene.physics.add.collider(taxi, this.buildingBodies, this.handleBuildingCollision, undefined, this.scene);
        
        // Collision with platforms - can land on top
        this.scene.physics.add.collider(taxi, this.platformBodies, this.handlePlatformCollision, undefined, this.scene);
    }

    private handleBuildingCollision(taxi: Phaser.Physics.Arcade.Sprite, building: Phaser.GameObjects.GameObject): void {
        // Handle taxi crashing into building
        console.log('Taxi hit building!');
        // TODO: Implement damage system, sound effects, etc.
    }

    private handlePlatformCollision(taxi: Phaser.Physics.Arcade.Sprite, platform: Phaser.GameObjects.GameObject): void {
        // Handle taxi landing on platform
        console.log('Taxi landed on platform!');
        // TODO: Implement landing logic, passenger pickup/dropoff, etc.
    }

    destroy(): void {
        this.buildingBodies.clear(true, true);
        this.platformBodies.clear(true, true);
    }
}