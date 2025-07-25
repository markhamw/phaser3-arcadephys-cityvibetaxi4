import { Scene } from "phaser";

export const halfWidth = (scene: Scene) => {
    return scene.cameras.main.width / 2;
};

export const halfHeight = (scene: Scene) => {
    return scene.cameras.main.height / 2;
};

export class Pre extends Scene {
    constructor() {
        super("Pre");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("citybg", "citybg.png");
        this.load.image("passenger", "passenger.png");
        this.load.image("passenger2", "passenger2.png");
        this.load.image("taxi", "taxi.png");
    }

    create() {
        this.scene.start("Game");
    }
}
