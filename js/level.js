// js/level.js (mis à jour - exemple d'ajustement de obstacleCount)

const GAME_LEVELS = [
    // Niveau 1 (Facile)
    {
        level: 1,
        enemySpawnInterval: 1800,
        enemySpeedMin: 1.5,
        enemySpeedMax: 3.5,
        obstacleCount: 3,   // Moins d'obstacles au début
        scoreToNextLevel: 100
    },
    // Niveau 2 (Moyen)
    {
        level: 2,
        enemySpawnInterval: 1200,
        enemySpeedMin: 2.0,
        enemySpeedMax: 4.0,
        obstacleCount: 4,   // Augmentation modérée
        scoreToNextLevel: 300
    },
    // Niveau 3 (Difficile)
    {
        level: 3,
        enemySpawnInterval: 800,
        enemySpeedMin: 2.5,
        enemySpeedMax: 4.5,
        obstacleCount: 5,   // Toujours raisonnable
        scoreToNextLevel: 600
    },
    // Niveau 4 (Très difficile)
    {
        level: 4,
        enemySpawnInterval: 600,
        enemySpeedMin: 3.0,
        enemySpeedMax: 5.0,
        obstacleCount: 6,   // Maximum pour l'instant
        scoreToNextLevel: 1000
    }
];