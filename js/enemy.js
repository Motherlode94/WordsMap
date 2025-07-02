// js/enemy.js (mis à jour)

class Enemy {
    constructor(isMiniBoss = false) {
        this.isMiniBoss = isMiniBoss;

        // Valeurs par défaut pour les ennemis normaux
        this.width = ENEMY_WIDTH; // Utilise la constante
        this.height = ENEMY_HEIGHT; // Utilise la constante
        this.health = 50;
        this.color = ENEMY_COLOR;
        this.speed = currentLevel.enemySpeedMin + Math.random() * (currentLevel.enemySpeedMax - currentLevel.enemySpeedMin);

        // Propriétés spécifiques au Boss (écrasent les valeurs par défaut si isMiniBoss est true)
        this.bossHorizontalSpeed = 1;
        this.bossMovementDirection = 1;
        this.fireRate = 1000;
        this.bulletSpeed = 4;
        this.bulletSize = 10;
        this.bulletColor = 'orange';
        this.lastShotTime = 0;

        if (this.isMiniBoss) {
            this.width = 80;
            this.height = 80;
            this.health = 300;
            this.color = 'darkred';
            this.speed = 0.5; // Vitesse de descente initiale du boss
        }
        
        this.x = Math.random() * (GAME_WIDTH - this.width);
        this.y = -this.height;
        this.maxHealth = this.health;
        this.alive = true;
    }

    update() {
        if (!this.alive) return;

        if (this.isMiniBoss) {
            if (this.y < GAME_HEIGHT / 4) {
                this.y += this.speed;
            } else {
                this.x += this.bossHorizontalSpeed * this.bossMovementDirection;
                if (this.x <= 0 || this.x + this.width >= GAME_WIDTH) {
                    this.bossMovementDirection *= -1;
                }
                this.shoot();
            }
        } else {
            this.y += this.speed;
        }
    }

    draw() {
        if (!ctx || !this.alive) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (!this.isMiniBoss && this.health < this.maxHealth) {
            const healthBarWidth = (this.health / this.maxHealth) * this.width;
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y - 8, this.width, 4);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y - 8, healthBarWidth, 4);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }

    isOffScreen() {
        if (!this.isMiniBoss) {
            return this.y > GAME_HEIGHT;
        }
        return false; 
    }

    isHit(bullet) {
        return (
            bullet.x < this.x + this.width &&
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        );
    }

    shoot() {
        if (!this.isMiniBoss) return;

        const currentTime = Date.now();
        if (currentTime - this.lastShotTime > this.fireRate) {
            bullets.push(new Bullet(
                this.x + this.width / 2 - this.bulletSize / 2,
                this.y + this.height,
                this.bulletSize,
                this.bulletSize,
                this.bulletColor,
                this.bulletSpeed * -1 // Vitesse négative pour que la balle descende
            ));
            this.lastShotTime = currentTime;
        }
    }
}