// game.js (Version consolidée et corrigée pour le figement aléatoire)

// Récupérer le canvas HTML et son contexte de dessin 2D
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error("Erreur : L'élément canvas avec l'ID 'gameCanvas' est introuvable.");
}
const ctx = canvas ? canvas.getContext('2d') : null;

if (!ctx) {
    console.error("Erreur : Impossible d'obtenir le contexte de rendu 2D du canvas.");
}

// --- Variables Globales du Jeu ---
let player;
let bullets = []; // Stocke balles joueur ET balles ennemies
let enemies = []; // Ennemis normaux
let obstacles = [];
let powerUps = [];
let score = 0;
let currentLevelIndex = 0;
let currentLevel; // Initialisé dans applyLevelSettings
let gameState = GAME_STATES.MENU;
let lastEnemySpawnTime = 0;
let lastPowerUpSpawnTime = 0;
const POWERUP_DROP_CHANCE = 0.2;
const POWERUP_SPAWN_INTERVAL = 10000;

// Variables pour le mini-boss
let miniBoss = null;
let miniBossSpawned = false; // Vrai si le mini-boss a déjà été généré dans le niveau actuel
const MINI_BOSS_SCORE_THRESHOLD = 50; // Score avant la fin du niveau où le mini-boss peut apparaître

// Variables pour le menu d'options et High Score
let gameOptions = {
    volume: parseFloat(localStorage.getItem('gameVolume')) || 0.7,
    language: localStorage.getItem('gameLanguage') || 'fr'
};
let highScore = parseInt(localStorage.getItem('highScore')) || 0;


// --- Gestion des Entrées Clavier ---
const keysPressed = {};
let selectedOptionIndex = 0; // Pour la navigation dans les menus (ex: Options)
const optionsList = ['volume', 'language']; // Liste des options pour le menu "Options"

document.addEventListener('keydown', (e) => {
    keysPressed[e.code] = true;

    if (gameState === GAME_STATES.MENU) {
        if (e.code === 'Enter') {
            startGame();
        } else if (e.code === 'KeyO') {
            gameState = GAME_STATES.OPTIONS;
            selectedOptionIndex = 0; // Réinitialise l'option sélectionnée au début du menu Options
        }
    } else if (gameState === GAME_STATES.OPTIONS) {
        if (e.code === 'Escape') {
            gameState = GAME_STATES.MENU;
        } else if (e.code === 'ArrowUp') {
            selectedOptionIndex = Math.max(0, selectedOptionIndex - 1);
        } else if (e.code === 'ArrowDown') {
            selectedOptionIndex = Math.min(optionsList.length - 1, selectedOptionIndex + 1);
        } else if (e.code === 'ArrowLeft') {
            if (selectedOptionIndex === 0) { // Option Volume
                gameOptions.volume = Math.max(0, gameOptions.volume - 0.1);
                localStorage.setItem('gameVolume', gameOptions.volume.toFixed(1));
            } else if (selectedOptionIndex === 1) { // Option Langue
                const languages = Object.keys(translations);
                let currentIndex = languages.indexOf(gameOptions.language);
                currentIndex = (currentIndex - 1 + languages.length) % languages.length;
                gameOptions.language = languages[currentIndex];
                localStorage.setItem('gameLanguage', gameOptions.language);
            }
        } else if (e.code === 'ArrowRight') {
            if (selectedOptionIndex === 0) { // Option Volume
                gameOptions.volume = Math.min(1, gameOptions.volume + 0.1);
                localStorage.setItem('gameVolume', gameOptions.volume.toFixed(1));
            } else if (selectedOptionIndex === 1) { // Option Langue
                const languages = Object.keys(translations);
                let currentIndex = languages.indexOf(gameOptions.language);
                currentIndex = (currentIndex + 1) % languages.length;
                gameOptions.language = languages[currentIndex];
                localStorage.setItem('gameLanguage', gameOptions.language);
            }
        }
    } else if (gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.WIN) {
        if (e.code === 'KeyR') {
            initGame(); // Réinitialise l'état du jeu pour une nouvelle partie
            gameState = GAME_STATES.MENU; // Retourne au menu principal
        }
    }
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.code] = false;
});


// --- Fonction d'Initialisation du Jeu ---
// Prépare toutes les variables et objets pour une nouvelle partie ou un nouveau niveau
function initGame() {
    player = new Player();
    player.currentWeapon = WEAPON_TYPES.DEFAULT;
    player.lastShotTime = 0; 
    
    player.hasBarrier = false;
    player.barrierDuration = 0;
    player.speed = PLAYER_SPEED;
    player.speedBoostDuration = 0;
    player.originalSpeed = PLAYER_SPEED;

    bullets = []; // Vide le tableau de balles (joueur et ennemi)
    enemies = []; // Vide le tableau d'ennemis normaux
    obstacles = []; // Sera rempli dans startGame() ou au changement de niveau
    powerUps = []; // Vide le tableau de power-ups
    score = 0;
    lastEnemySpawnTime = 0;
    lastPowerUpSpawnTime = 0;
    currentLevelIndex = 0; // Commence toujours au premier niveau
    miniBoss = null; // S'assure qu'il n'y a pas de mini-boss résiduel
    miniBossSpawned = false; // Réinitialise le drapeau de spawn du mini-boss
    applyLevelSettings(currentLevelIndex); // Applique les paramètres du premier niveau

    console.log(`Jeu réinitialisé. Actuellement en état: ${gameState}`);
}

// --- Fonction pour lancer une nouvelle partie (appelée depuis le menu) ---
function startGame() {
    initGame(); // Réinitialise toutes les variables du jeu
    gameState = GAME_STATES.PLAYING; // Change l'état pour commencer à jouer
    
    // Crée les obstacles initiaux pour le premier niveau
    obstacles = []; // S'assure que le tableau est vide avant de le remplir
    for (let i = 0; i < currentLevel.obstacleCount; i++) {
        obstacles.push(new Obstacle(
            Math.random() * (GAME_WIDTH - 70), // Position X aléatoire
            -Math.random() * GAME_HEIGHT - (i * GAME_HEIGHT / currentLevel.obstacleCount), // Position Y décalée pour l'espacement
            null, null, // Largeur et hauteur aléatoires par défaut
            0.5 + Math.random() * 0.5 // Vitesse aléatoire
        ));
    }
    console.log("Partie démarrée !");
}


// --- Fonction pour appliquer les paramètres du niveau ---
function applyLevelSettings(levelIndex) {
    // Si l'index de niveau dépasse le nombre de niveaux définis, c'est une victoire finale du jeu
    if (levelIndex >= GAME_LEVELS.length) {
        console.log("Tous les niveaux terminés !"); // Le WIN state sera géré après la défaite du boss final.
        // Ne pas mettre gameState = GAME_STATES.WIN ici directement, cela se fait après le dernier boss.
        return;
    }
    currentLevel = GAME_LEVELS[levelIndex]; // Met à jour l'objet du niveau actuel
    miniBoss = null; // Réinitialise le mini-boss pour le nouveau niveau
    miniBossSpawned = false; // Réinitialise le drapeau de spawn du mini-boss pour le nouveau niveau
    console.log(`Chargement du Niveau ${currentLevel.level}`);
}

// --- Fonction de Mise à Jour (Logique du Jeu) ---
function update(deltaTime) {
    if (gameState !== GAME_STATES.PLAYING) {
        return; // N'exécute la logique de jeu que si l'état est PLAYING
    }

    // --- Mouvement du joueur ---
    let dx = 0;
    let dy = 0;

    if (keysPressed['ArrowLeft'] || keysPressed['KeyA']) {
        dx = -player.speed;
    }
    if (keysPressed['ArrowRight'] || keysPressed['KeyD']) {
        dx = player.speed;
    }
    if (keysPressed['ArrowUp'] || keysPressed['KeyW']) {
        dy = -player.speed;
    }
    if (keysPressed['ArrowDown'] || keysPressed['KeyS']) {
        dy = player.speed;
    }
    player.move(dx, dy);

    // --- Gestion du Tir du joueur ---
    if (keysPressed['Space']) {
        player.shoot();
    }

    // --- Mettre à jour les effets des bonus et l'invincibilité du joueur ---
    player.updateEffects(deltaTime);

    // --- Vérifier si le joueur est mort ---
    if (player.health <= 0) {
        gameState = GAME_STATES.GAME_OVER;
        return; // Arrête l'update car le joueur est mort
    }


    // --- Mettre à jour et filtrer les balles (joueur et ennemies) ---
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        // Supprime les balles si elles sont hors de l'écran par n'importe quel côté
        if (bullets[i].y + bullets[i].height < 0 || bullets[i].y > GAME_HEIGHT || bullets[i].x < -bullets[i].width || bullets[i].x > GAME_WIDTH) {
            bullets.splice(i, 1);
        }
    }

    // --- Génération d'ennemis normaux ---
    const currentTime = Date.now();
    // Les ennemis normaux apparaissent si le mini-boss n'est pas encore là ou s'il est vaincu
    if (!miniBossSpawned || (miniBoss && !miniBoss.alive)) {
        if (currentTime - lastEnemySpawnTime > currentLevel.enemySpawnInterval && enemies.length < 10) { // Limite d'ennemis normaux à l'écran
            enemies.push(new Enemy());
            lastEnemySpawnTime = currentTime;
        }
    }
    
    // --- Gestion du Mini-Boss ---
    // Le mini-boss apparaît une fois par niveau à un certain score seuil, ou comme boss final
    const isFinalBossLevel = (currentLevelIndex === GAME_LEVELS.length - 1);
    
    if (!miniBossSpawned && 
        ((!isFinalBossLevel && score >= currentLevel.scoreToNextLevel - MINI_BOSS_SCORE_THRESHOLD) || 
         (isFinalBossLevel && enemies.length === 0 && score >= currentLevel.scoreToNextLevel / 2)) // Conditions pour le boss final (tous les ennemis normaux sont éliminés et score suffisant)
       ) {
        if (!miniBoss) { // S'assure qu'il n'y a pas déjà un mini-boss
            miniBoss = new Enemy(true); // Crée un mini-boss (paramètre 'true')
            miniBossSpawned = true;
            console.log("Mini-Boss apparu !");
        }
    }


    // --- Mettre à jour et filtrer les ennemis (normaux) ---
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        // Supprime l'ennemi s'il n'est plus en vie ou s'il est hors écran (pour les ennemis normaux)
        if (!enemies[i].alive || enemies[i].isOffScreen()) {
            enemies.splice(i, 1);
        }
    }

    // --- Mise à jour du Mini-Boss ---
    if (miniBoss && miniBoss.alive) {
        miniBoss.update();
        // Si le boss est vaincu (sa santé <= 0), le marquer comme non vivant et gérer la victoire/le passage de niveau
        if (miniBoss.health <= 0) {
            miniBoss.alive = false; // Marquer comme non vivant pour qu'il soit retiré du jeu logiquement
            score += 500; // Grand bonus pour la défaite du boss

            if (currentLevelIndex === GAME_LEVELS.length - 1) { // Si c'est le boss du dernier niveau
                gameState = GAME_STATES.WIN; // Passe à l'état de victoire finale
                console.log("Boss final vaincu ! Vous avez gagné !");
                miniBoss = null; // Supprimer l'instance du boss
                return; // Arrête l'update car le jeu est gagné
            } else {
                console.log("Mini-Boss vaincu ! Préparation du niveau suivant.");
                miniBoss = null; // Supprimer l'instance du boss
                miniBossSpawned = false; // Réinitialiser le drapeau pour permettre un nouveau boss au prochain niveau
                // Le passage au niveau suivant sera géré par la condition de score et de boss vaincu/absent plus bas.
            }
        }
    }


    // --- Mettre à jour les obstacles et gérer leur réapparition ---
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        // Retire l'obstacle s'il n'est plus en vie ou s'il est hors écran
        if (!obstacles[i].alive || obstacles[i].y > GAME_HEIGHT) {
            obstacles.splice(i, 1);
            if (obstacles.length < currentLevel.obstacleCount) { // S'il faut maintenir le nombre d'obstacles
                obstacles.push(new Obstacle(
                    Math.random() * (GAME_WIDTH - 70),
                    -70 - Math.random() * 100,
                    null, null,
                    0.5 + Math.random() * 0.5
                ));
            }
        }
    }

    // --- Mettre à jour les PowerUps et gérer leur apparition/disparition ---
    if (currentTime - lastPowerUpSpawnTime > POWERUP_SPAWN_INTERVAL && powerUps.length < 2) {
        powerUps.push(new PowerUp(
            Math.random() * (GAME_WIDTH - 25),
            -25
        ));
        lastPowerUpSpawnTime = currentTime;
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update();
        if (powerUps[i].y > GAME_HEIGHT) {
            powerUps.splice(i, 1);
        }
    }

    // --- Détection des Collisions ---
    // Utilisation de tableaux temporaires pour marquer les objets à supprimer afin d'éviter les problèmes d'index
    let bulletsToRemove = [];
    
    // 1. Collisions des balles du joueur avec les cibles (Mini-Boss en premier, puis ennemis normaux, puis obstacles)
    
    // Vérification: Balles du joueur contre Mini-Boss
    if (miniBoss && miniBoss.alive) {
        for (let i = 0; i < bullets.length; i++) {
            if (bulletsToRemove.includes(i)) continue; // Si la balle est déjà marquée pour suppression
            // S'assurer que c'est une balle du joueur (speed > 0)
            if (bullets[i].speed > 0 && miniBoss.isHit(bullets[i])) {
                miniBoss.takeDamage(BULLET_DAMAGE); // Le mini-boss prend des dégâts
                bulletsToRemove.push(i); // Marquer la balle pour suppression
            }
        }
    }

    // Vérification: Balles du joueur contre Ennemis normaux
    for (let i = 0; i < bullets.length; i++) {
        if (bulletsToRemove.includes(i)) continue; // Si la balle est déjà marquée pour suppression
        // S'assurer que c'est une balle du joueur (speed > 0)
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].speed > 0 && enemies[j].alive && enemies[j].isHit(bullets[i])) {
                const enemyDied = enemies[j].takeDamage(BULLET_DAMAGE);
                bulletsToRemove.push(i); // Marquer la balle pour suppression
                if (enemyDied) { // Si l'ennemi est mort suite à ce coup
                    if (Math.random() < POWERUP_DROP_CHANCE) {
                        powerUps.push(new PowerUp(enemies[j].x + enemies[j].width / 2 - 12.5, enemies[j].y + enemies[j].height / 2 - 12.5));
                    }
                    score += 10;
                }
                break; // Une balle ne touche qu'un seul ennemi normal
            }
        }
    }

    // Vérification: Balles du joueur contre Obstacles
    for (let i = 0; i < bullets.length; i++) {
        if (bulletsToRemove.includes(i)) continue; // Si la balle est déjà marquée pour suppression
        // S'assurer que c'est une balle du joueur (speed > 0)
        for (let j = obstacles.length - 1; j >= 0; j--) {
            if (bullets[i].speed > 0 && obstacles[j].alive && obstacles[j].checkCollision(bullets[i])) {
                bulletsToRemove.push(i);
                if (obstacles[j].takeDamage(BULLET_DAMAGE)) {
                    score += 5;
                }
                break;
            }
        }
    }

    // Appliquer les suppressions de balles du joueur
    bullets = bullets.filter((_, index) => !bulletsToRemove.includes(index));


    // 2. Collisions des projectiles ennemis avec le joueur
    for (let i = bullets.length - 1; i >= 0; i--) { // Parcourir les balles restantes
        // Vérifiez si c'est une balle ennemie (speed < 0) ET qu'elle est en collision avec le joueur
        if (bullets[i].speed < 0 && 
            player.x < bullets[i].x + bullets[i].width &&
            player.x + player.width > bullets[i].x &&
            player.y < bullets[i].y + bullets[i].height &&
            player.y + player.height > bullets[i].y)
        {
            player.takeDamage(ENEMY_DAMAGE); // Le joueur prend des dégâts. La méthode gère le bouclier et l'invincibilité.
            bullets.splice(i, 1); // La balle ennemie est détruite
        }
    }


    // 3. Collisions du joueur avec les ennemis et obstacles (contact direct)
    let playerHitThisFrame = false; // Flag pour s'assurer que le joueur ne subit pas de dégâts multiples en une frame

    // Collision : Ennemis normaux contre Joueur
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (
            enemies[i].alive &&
            !playerHitThisFrame && // S'assurer que le joueur n'a pas déjà été touché cette frame
            player.x < enemies[i].x + enemies[i].width &&
            player.x + player.width > enemies[i].x &&
            player.y < enemies[i].y + enemies[i].height &&
            player.y + player.height > enemies[i].y
        ) {
            player.takeDamage(ENEMY_DAMAGE); // Appelle takeDamage. Si bouclier actif, les dégâts sont absorbés.
            enemies[i].hit(); // L'ennemi est détruit au contact du joueur.
            playerHitThisFrame = true; // Marque le joueur comme ayant été touché
        }
    }

    // Collision : Mini-Boss contre Joueur
    if (miniBoss && miniBoss.alive && !playerHitThisFrame) {
        if (
            player.x < miniBoss.x + miniBoss.width &&
            player.x + player.width > miniBoss.x &&
            player.y < miniBoss.y + miniBoss.height &&
            player.y + player.height > miniBoss.y
        ) {
            player.takeDamage(ENEMY_DAMAGE * 2); // Le mini-boss fait plus de dégâts
            playerHitThisFrame = true; // Marque le joueur comme ayant été touché
        }
    }

    // Collision : Joueur contre Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (
            obstacles[i].alive &&
            !playerHitThisFrame && // S'assurer que le joueur n'a pas déjà été touché cette frame
            obstacles[i].checkCollision(player)
        ) {
            player.takeDamage(ENEMY_DAMAGE); // Le joueur prend des dégâts
            obstacles[i].takeDamage(PLAYER_MAX_HEALTH); // L'obstacle est détruit si le joueur le touche
            playerHitThisFrame = true; // Marque le joueur comme ayant été touché
        }
    }


    // 4. Collisions des ennemis avec les obstacles
    // Ennemis normaux contre Obstacles
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = obstacles.length - 1; j >= 0; j--) {
            if (enemies[i].alive && obstacles[j].alive && obstacles[j].checkCollision(enemies[i])) {
                enemies[i].hit(); // L'ennemi est détruit
                obstacles[j].takeDamage(ENEMY_DAMAGE); // L'obstacle prend des dégâts de l'ennemi
                break;
            }
        }
    }

    // Mini-Boss contre Obstacles
    if (miniBoss && miniBoss.alive) {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (obstacles[i].alive && obstacles[i].checkCollision(miniBoss)) {
                obstacles[i].takeDamage(ENEMY_DAMAGE * 0.5); // L'obstacle prend moins de dégâts
            }
        }
    }

    // 5. Collision : PowerUps contre Joueur (logique inchangée)
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (powerUps[i].checkCollision(player)) {
            if (powerUps[i].type.effect === "changeWeapon") {
                player.changeWeapon(powerUps[i].weaponType);
            } else if (powerUps[i].type.effect === "activateBarrier") {
                player.activateBarrier(powerUps[i].type.duration, powerUps[i].type.color);
            } else if (powerUps[i].type.effect === "increaseSpeed") {
                player.increaseSpeed(powerUps[i].type.speedBoost, powerUps[i].type.duration);
            }
            powerUps.splice(i, 1);
            break;
        }
    }


    // --- Vérifier le passage au niveau suivant ---
    // Le passage au niveau suivant dépend du score ET de la défaite du mini-boss (s'il est apparu)
    const isBossDefeatedOrAbsent = (!miniBossSpawned || (miniBoss && !miniBoss.alive));

    // Si ce n'est pas le dernier niveau ET les conditions sont remplies
    if (currentLevelIndex < GAME_LEVELS.length - 1) {
        if (score >= currentLevel.scoreToNextLevel && isBossDefeatedOrAbsent) {
            currentLevelIndex++;
            applyLevelSettings(currentLevelIndex); // Applique les paramètres du nouveau niveau

            enemies = [];
            bullets = [];
            powerUps = [];
            player.currentWeapon = WEAPON_TYPES.DEFAULT;
            player.hasBarrier = false;
            player.barrierDuration = 0;
            player.speed = PLAYER_SPEED;
            player.speedBoostDuration = 0;
            miniBoss = null;
            miniBossSpawned = false; // Réinitialiser pour le nouveau niveau
            
            obstacles = [];
            for (let i = 0; i < currentLevel.obstacleCount; i++) {
                obstacles.push(new Obstacle(
                    Math.random() * (GAME_WIDTH - 70),
                    -Math.random() * GAME_HEIGHT - (i * GAME_HEIGHT / currentLevel.obstacleCount),
                    null, null,
                    0.5 + Math.random() * 0.5
                ));
            }
            lastEnemySpawnTime = Date.now();
            lastPowerUpSpawnTime = Date.now();
            console.log(`Félicitations ! Vous êtes au Niveau ${currentLevel.level} !`);
        }
    } 
    // La victoire totale (dernier niveau) est gérée directement dans miniBoss.update() quand le boss final est vaincu.

    // Mettre à jour le meilleur score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}


// --- Fonction de Dessin (Rendu Visuel) ---
function draw() {
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Dessin en fonction de l'état du jeu
    switch (gameState) {
        case GAME_STATES.MENU:
            drawMainMenu();
            break;
        case GAME_STATES.OPTIONS:
            drawOptionsMenu();
            break;
        case GAME_STATES.PLAYING:
            drawGameElements();
            break;
        case GAME_STATES.GAME_OVER:
            drawGameElements();
            drawGameOverScreen();
            break;
        case GAME_STATES.WIN:
            drawGameElements();
            drawWinScreen();
            break;
    }
}

// Fonction pour dessiner les éléments du jeu (quand PLAYING, GAME_OVER, WIN)
function drawGameElements() {
    obstacles.filter(obstacle => obstacle.alive).forEach(obstacle => obstacle.draw());
    player.draw();
    bullets.forEach(bullet => bullet.draw()); // Dessinera les balles du joueur et des ennemis
    enemies.filter(enemy => enemy.alive).forEach(enemy => enemy.draw());

    if (miniBoss && miniBoss.alive) {
        miniBoss.draw();
        const bossHealthBarWidth = (miniBoss.health / miniBoss.maxHealth) * 100;
        ctx.fillStyle = 'darkred';
        ctx.fillRect(GAME_WIDTH / 2 - 50, 50, 100, 10);
        ctx.fillStyle = 'red';
        ctx.fillRect(GAME_WIDTH / 2 - 50, 50, bossHealthBarWidth, 10);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(GAME_WIDTH / 2 - 50, 50, 100, 10);
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.fillText(getTranslation('boss'), GAME_WIDTH / 2, 40);
        ctx.textAlign = 'left';
    }

    powerUps.forEach(powerUp => powerUp.draw());

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${getTranslation('score')}: ${score}`, 10, 30);
    ctx.fillText(`${getTranslation('highScore')}: ${highScore}`, 10, 60);
    ctx.fillText(`${getTranslation('level')}: ${currentLevel.level}`, 10, 90);
    ctx.fillText(`${getTranslation('weapon')}: ${getTranslation(player.currentWeapon.name)}`, 10, 120);

    ctx.fillStyle = 'gray';
    ctx.fillRect(10, GAME_HEIGHT - 30, 100, 20);
    const healthBarWidth = (player.health / player.maxHealth) * 100;
    ctx.fillStyle = 'red';
    ctx.fillRect(10, GAME_HEIGHT - 30, healthBarWidth, 20);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, GAME_HEIGHT - 30, 100, 20);
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(`${getTranslation('health')}: ${player.health}/${player.maxHealth}`, 120, GAME_HEIGHT - 10);

    if (player.hasBarrier) {
        const remainingTime = Math.ceil(player.barrierDuration / 1000);
        ctx.fillText(`${getTranslation('shield')}: ${remainingTime}s`, 10, 150);
    }
    if (player.speedBoostDuration > 0) {
        const remainingTime = Math.ceil(player.speedBoostDuration / 1000);
        ctx.fillText(`Vitesse: ${remainingTime}s`, 10, 180);
    }
}

// Fonctions de dessin des menus
function drawMainMenu() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'lime';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getTranslation('gameTitle'), GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '30px Arial';
    ctx.fillText(getTranslation('pressEnterToStart'), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    ctx.fillText(getTranslation('pressOForOptions'), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
    ctx.font = '20px Arial';
    ctx.fillText(`${getTranslation('highScore')}: ${highScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150);
}

function drawOptionsMenu() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'lime';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getTranslation('options'), GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '25px Arial';
    // Option Volume
    if (selectedOptionIndex === 0) {
        ctx.fillStyle = 'yellow';
    } else {
        ctx.fillStyle = TEXT_COLOR;
    }
    ctx.fillText(`${getTranslation('volume')}: ${Math.round(gameOptions.volume * 100)}%`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

    // Option Langue
    if (selectedOptionIndex === 1) { // L'index de l'option langue
        ctx.fillStyle = 'yellow';
    } else {
        ctx.fillStyle = TEXT_COLOR;
    }
    ctx.fillText(`${getTranslation('language')}: ${gameOptions.language.toUpperCase()}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '20px Arial';
    ctx.fillText(getTranslation('useArrowsToAdjust'), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    ctx.fillText(getTranslation('useUpDownArrowsToNavigate'), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
    ctx.fillText(getTranslation('pressEscToReturn'), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = GAME_OVER_COLOR;
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getTranslation('gameOver'), GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '20px Arial';
    ctx.fillText(`${getTranslation('finalScore')}: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
    ctx.fillText(`${getTranslation('highScore')}: ${highScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    ctx.fillText(getTranslation('pressRToMenu'), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
}

function drawWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'gold';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getTranslation('victory'), GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '20px Arial';
    ctx.fillText(getTranslation('congratulations'), GAME_WIDTH / 2, GAME_HEIGHT / 2);
    ctx.fillText(`${getTranslation('finalScore')}: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
    ctx.fillText(`${getTranslation('highScore')}: ${highScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
    ctx.fillText(getTranslation('pressRToMenu'), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90);
}


// --- La Boucle Principale du Jeu (Game Loop) ---
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

// --- Gestion du Redémarrage du Jeu (modifiée pour revenir au menu) ---
document.addEventListener('keydown', (e) => {
    if ((gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.WIN) && e.code === 'KeyR') {
        initGame();
        gameState = GAME_STATES.MENU;
    }
});

// --- Lancer le Jeu ---
initGame();
requestAnimationFrame(gameLoop);