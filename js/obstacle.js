// js/obstacle.js (pas de changement direct dans la classe, les constantes sont utilisées par game.js)

class Obstacle {
    constructor(x, y, width, height, speed) {
        this.width = width || (30 + Math.random() * 70);
        this.height = height || (30 + Math.random() * 70);
        this.x = x || Math.random() * (GAME_WIDTH - this.width);
        this.y = y || -this.height - Math.random() * GAME_HEIGHT;
        this.color = OBSTACLE_COLOR;
        this.speed = speed || (0.5 + Math.random() * 0.5);
        this.health = OBSTACLE_HEALTH_MIN + Math.random() * (OBSTACLE_HEALTH_MAX - OBSTACLE_HEALTH_MIN);
        this.maxHealth = this.health;
        this.alive = true;
    }

    update() {
        if (this.alive) {
            this.y += this.speed;
        }
    }

    draw() {
        if (!ctx || !this.alive) return;
        
        const healthRatio = this.health / this.maxHealth;
        const red = Math.floor(255 * (1 - healthRatio));
        const green = Math.floor(150 * healthRatio);
        ctx.fillStyle = `rgb(${red}, ${green}, 0)`;

        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkCollision(otherObject) {
        return (
            this.alive &&
            this.x < otherObject.x + otherObject.width &&
            this.x + this.width > otherObject.x &&
            this.y < otherObject.y + otherObject.height &&
            this.y + this.height > otherObject.y
        );
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }
}