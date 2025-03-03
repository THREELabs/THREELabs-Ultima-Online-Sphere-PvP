import { WorldManager } from '../world/WorldManager.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { UIManager } from '../ui/UIManager.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init() {
        this.GAME_WIDTH = this.game.config.width;
        this.GAME_HEIGHT = this.game.config.height;
        this.PLAYER_SIZE = 20;
        this.PLAYER_SPEED = 180;
        this.lastCastTime = 0;
        this.selectedTarget = null;
        this.spells = [];
        this.isMoving = false;
    }

    preload() {
        console.log('MainScene preload started');
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
    }

    create() {
        console.log('MainScene create started');

        try {
            // Initialize world
            console.log('Creating world...');
            this.worldManager = new WorldManager(this);
            this.worldManager.createWorld();

            // Initialize player and enemy
            console.log('Creating entities...');
            this.player = new Player(this, 50, 50);
            this.enemy = new Enemy(this, 700, 500);

            // Initialize UI
            console.log('Creating UI...');
            this.uiManager = new UIManager(this);

            // Setup collisions
            console.log('Setting up collisions...');
            this.physics.add.collider(this.player.sprite, this.worldManager.walls);
            this.physics.add.collider(this.player.sprite, this.worldManager.houses);
            this.physics.add.collider(this.enemy.sprite, this.worldManager.walls);
            this.physics.add.collider(this.enemy.sprite, this.worldManager.houses);

            // Setup input handlers
            console.log('Setting up input...');
            this.setupInput();

            console.log('MainScene create completed successfully');
        } catch (error) {
            console.error('Error in MainScene create:', error);
        }
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            const distance = Phaser.Math.Distance.Between(
                pointer.x, pointer.y,
                this.enemy.sprite.x, this.enemy.sprite.y
            );

            if (distance < this.PLAYER_SIZE) {
                this.selectedTarget = this.selectedTarget === this.enemy.sprite ? null : this.enemy.sprite;
            }
            this.isMoving = true;
        });

        this.input.on('pointerup', () => {
            this.isMoving = false;
        });

        this.input.on('pointermove', (pointer) => {
            this.pointer = pointer;
        });

        // Keyboard input for spells
        this.input.keyboard.on('keydown-R', () => this.player.castSpell('magic_arrow', this.selectedTarget));
        this.input.keyboard.on('keydown-T', () => this.player.castSpell('lightning', this.selectedTarget));
        this.input.keyboard.on('keydown-F', () => this.player.castSpell('flame_strike', this.selectedTarget));
    }

    hasLineOfSight(source, target) {
        const line = new Phaser.Geom.Line(source.x, source.y, target.x, target.y);
        const walls = this.worldManager.walls.getChildren();
        const houses = this.worldManager.houses.getChildren();

        for (let wall of walls) {
            if (Phaser.Geom.Intersects.LineToRectangle(line, wall.getBounds())) {
                return false;
            }
        }
        for (let house of houses) {
            if (Phaser.Geom.Intersects.LineToRectangle(line, house.getBounds())) {
                return false;
            }
        }
        return true;
    }

    update() {
        // Update player
        this.player.update(this.isMoving, this.pointer);

        // Update enemy
        this.enemy.update(this.player);

        // Update UI
        this.uiManager.update();

        // Update targeting indicator if target is selected
        if (this.selectedTarget) {
            this.uiManager.updateTargetingIndicator(this.selectedTarget);
        }
    }
}
