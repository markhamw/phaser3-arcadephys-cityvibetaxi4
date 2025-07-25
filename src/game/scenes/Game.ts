import { Scene } from "phaser";
import { halfHeight, halfWidth } from "./Pre";

export class Game extends Scene {
    constructor() {
        super("Game");
    }

    preload() {}

    create() {
        this.add.image(halfWidth(this), halfHeight(this), "citybg").setOrigin(0.5, 0.5);
    }
}
