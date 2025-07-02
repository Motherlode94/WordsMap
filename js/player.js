// js/player.js (mis à jour)

class Player {
    constructor() {
        this.width = PLAYER_WIDTH; // Utilise la constante
        this.height = PLAYER_HEIGHT; // Utilise la constante
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - this.height - 10;
        this.color = PLAYER_COLOR;
        this.speed = PLAYER_SPEED;
        this.currentWeapon = WEAPON_TYPES.DEFAULT;
        this.lastShotTime = 0;

        this.health = PLAYER_MAX_HEALTH;
        this.maxHealth = PLAYER_MAX_HEALTH;
        this.isInvincible = false;
        this.invincibilityTimer = 0;

        this.hasBarrier = false;
        this.barrierDuration = 0;
        this.barrierColor = 'rgba(255, 255, 0, 0.5)';

        this.originalSpeed = PLAYER_SPEED;
        this.speedBoostDuration = 0;
    }

    draw() {
        if (!ctx) return;
        
        if (this.isInvincible && Math.floor(Date.now() / 100) % 2) {
            return;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.hasBarrier) {
            ctx.strokeStyle = this.barrierColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;

        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > GAME_WIDTH) {
            this.x = GAME_WIDTH - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y + this.height > GAME_HEIGHT) {
            this.y = GAME_HEIGHT - this.height;
        }
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime > this.currentWeapon.fireRate) {
            for (let i = 0; i < this.currentWeapon.projectilesPerShot; i++) {
                let bulletX = this.x + this.width / 2 - this.currentWeapon.bulletWidth / 2;
                let bulletY = this.y;

                if (this.currentWeapon.projectilesPerShot > 1) {
                    const totalSpread = this.currentWeapon.spread * (this.currentWeapon.projectilesPerShot - 1);
                    const startX = bulletX - totalSpread / 2;
                    bulletX = startX + i * this.currentWeapon.spread;
                }
                
                bullets.push(new Bullet(
                    bulletX,
                    bulletY,
                    this.currentWeapon.bulletWidth,
                    this.currentWeapon.bulletHeight,
                    this.currentWeapon.bulletColor,
                    this.currentWeapon.bulletSpeed,
                    this.currentWeapon.isHoming || false
                ));
            }
            this.lastShotTime = currentTime;
            return true;
        }
        return false;
    }

    changeWeapon(newWeaponType) {
        this.currentWeapon = newWeaponType;
        console.log(`Arme changée en: ${getTranslation(newWeaponType.name)}`);
    }

    activateBarrier(duration, color) {
        this.hasBarrier = true;
        this.barrierDuration = duration;
        this.barrierColor = color || 'rgba(255, 255, 0, 0.5)';
        console.log(`${getTranslation('shield')} activé pour ${duration / 1000} secondes !`);
    }

    increaseSpeed(boostAmount, duration) {
        this.speed = this.originalSpeed + boostAmount;
        this.speedBoostDuration = duration;
        console.log(`${getTranslation('speed')} augmentée à ${this.speed} pour ${duration / 1000} secondes !`);
    }

    takeDamage(amount) {
        if (this.hasBarrier) {
            this.hasBarrier = false;
            this.barrierDuration = 0;
            console.log("Bouclier a absorbé l'impact !");
            return false;
        }
        if (this.isInvincible) {
            return false;
        }

        this.health -= amount;
        this.isInvincible = true;
        this.invincibilityTimer = PLAYER_INVINCIBILITY_DURATION;
        console.log(`Joueur touché ! Santé: ${this.health}`);
        return true;
    }

    updateEffects(deltaTime) {
        if (this.hasBarrier) {
            this.barrierDuration -= deltaTime;
            if (this.barrierDuration <= 0) {
                this.hasBarrier = false;
                console.log("Bouclier désactivé.");
            }
        }
        if (this.speedBoostDuration > 0) {
            this.speedBoostDuration -= deltaTime;
            if (this.speedBoostDuration <= 0) {
                this.speed = this.originalSpeed;
                console.log("Vitesse revenue à la normale.");
            }
        }
        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                console.log("Fin de l'invincibilité.");
            }
        }
    }
}