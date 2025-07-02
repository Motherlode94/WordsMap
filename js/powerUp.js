// js/powerUp.js (mis à jour)

class PowerUp {
    constructor(x, y) {
        this.width = 25;
        this.height = 25;
        this.x = x;
        this.y = y;
        this.speed = 1;
        this.active = true;

        // Choisit un power-up aléatoire de la collection
        const randomPowerUpData = POWERUP_COLLECTION[Math.floor(Math.random() * POWERUP_COLLECTION.length)];
        this.type = randomPowerUpData.type; // Le type de bonus (WEAPON, BARRIER, SPEED_UP)
        this.weaponType = randomPowerUpData.weapon; // L'arme spécifique si c'est un bonus d'arme
        this.color = randomPowerUpData.type.color || 'yellow'; // Couleur spécifique au type de power-up ou jaune par défaut
    }

    update() {
        if (this.active) {
            this.y += this.speed;
        }
    }

    draw() {
        if (!ctx || !this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        // Affiche la première lettre du nom du power-up (ex: A pour Arme, B pour Bouclier, V pour Vitesse)
        ctx.fillText(this.type.name[0], this.x + this.width / 2, this.y + this.height / 2 + 4);
        ctx.textAlign = 'left';
    }

    checkCollision(otherObject) {
        return (
            this.active &&
            this.x < otherObject.x + otherObject.width &&
            this.x + this.width > otherObject.x &&
            this.y < otherObject.y + otherObject.height &&
            this.y + this.height > otherObject.y
        );
    }
}