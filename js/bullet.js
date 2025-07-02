// js/bullet.js (Correction de la suppression auto-gérée)

// NOTE: BULLET_WIDTH et BULLET_HEIGHT doivent être définis dans gameConfig.js
// pour être utilisés comme valeurs par défaut si l'arme ne les spécifie pas.

class Bullet {
    constructor(x, y, width = BULLET_WIDTH, height = BULLET_HEIGHT, color = BULLET_COLOR, speed = BULLET_SPEED, isHoming = false) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.isHoming = isHoming; // Nouvelle propriété pour les balles guidées
    }

    update() {
        if (this.isHoming) {
            // Logique de ciblage : trouver l'ennemi le plus proche
            let closestEnemy = null;
            let minDistance = Infinity;

            enemies.forEach(enemy => { // 'enemies' est une variable globale dans game.js
                if (enemy.alive) {
                    const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            });

            if (closestEnemy) {
                // Se diriger vers l'ennemi
                const angle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
                this.x += this.speed * Math.cos(angle);
                this.y += this.speed * Math.sin(angle);
            } else {
                // Si pas d'ennemi, la balle continue de monter
                this.y -= this.speed;
            }
        } else {
            // Mouvement normal de la balle (monte)
            this.y -= this.speed;
        }
        // *****************************************************************
        // !!! CORRECTION MAJEURE ICI !!!
        // Supprimer la logique de suppression de la balle de sa propre méthode update().
        // Cette logique doit rester centralisée dans game.js après toutes les collisions.
        // *****************************************************************
        // if (this.isOffScreen()) {
        //     bullets = bullets.filter(bullet => bullet !== this);
        // }
    }

    draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Optionnel : dessiner un cercle pour les balles guidées
        if (this.isHoming) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Cette méthode est correcte et est utilisée par game.js pour décider de la suppression.
    isOffScreen() {
        return this.y + this.height < 0 || this.x + this.width < 0 || this.x > GAME_WIDTH; // Utilise GAME_WIDTH du scope global
    }
}