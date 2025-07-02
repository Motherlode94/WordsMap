// js/weaponTypes.js (mis à jour)

// Définition des différents types d'armes et de leurs propriétés
const WEAPON_TYPES = {
    // Arme par défaut (tir simple)
    DEFAULT: {
        name: "normalWeapon", // Clé de traduction
        bulletSpeed: BULLET_SPEED,
        bulletWidth: BULLET_WIDTH,
        bulletHeight: BULLET_HEIGHT,
        bulletColor: BULLET_COLOR,
        fireRate: 200,
        projectilesPerShot: 1,
        isLaser: false
    },
    // Mitrailleuse (tir rapide)
    MACHINE_GUN: {
        name: "machineGun", // Clé de traduction
        bulletSpeed: BULLET_SPEED + 2,
        bulletWidth: 4,
        bulletHeight: 12,
        bulletColor: 'orange',
        fireRate: 100,
        projectilesPerShot: 1,
        isLaser: false
    },
    // Double Tir (deux balles côte à côte)
    DOUBLE_SHOT: {
        name: "doubleShot", // Clé de traduction
        bulletSpeed: BULLET_SPEED,
        bulletWidth: BULLET_WIDTH,
        bulletHeight: BULLET_HEIGHT,
        bulletColor: 'lightblue',
        fireRate: 250,
        projectilesPerShot: 2,
        spread: 15,
        isLaser: false
    },
    // Tir large (trois balles en éventail)
    SPREAD_SHOT: {
        name: "spreadShot", // Clé de traduction
        bulletSpeed: BULLET_SPEED - 1,
        bulletWidth: BULLET_WIDTH,
        bulletHeight: BULLET_HEIGHT,
        bulletColor: 'gold',
        fireRate: 300,
        projectilesPerShot: 3,
        spread: 25,
        isLaser: false
    },
    // NOUVELLES ARMES BASÉES SUR VOTRE LISTE
    LASER: {
        name: "laser", // Clé de traduction
        bulletSpeed: BULLET_SPEED + 5,
        bulletWidth: 10,
        bulletHeight: 40,
        bulletColor: 'red',
        fireRate: 150,
        projectilesPerShot: 1,
        isLaser: true
    },
    FLAME_THROWER: {
        name: "flameThrower", // Clé de traduction
        bulletSpeed: BULLET_SPEED / 2,
        bulletWidth: 20,
        bulletHeight: 20,
        bulletColor: 'darkorange',
        fireRate: 70,
        projectilesPerShot: 1,
        isFlame: true
    },
    HOMING_GUN: {
        name: "homingGun", // Clé de traduction
        bulletSpeed: BULLET_SPEED - 1,
        bulletWidth: 8,
        bulletHeight: 8,
        bulletColor: 'purple',
        fireRate: 400,
        projectilesPerShot: 1,
        isHoming: true
    }
};

// Définition des différents types de BONUS (power-ups)
const POWERUP_TYPES = {
    WEAPON: {
        name: "Arme", // Cette clé sera utilisée pour le texte sur la caisse, pas pour le nom de l'arme
        effect: "changeWeapon"
    },
    BARRIER: {
        name: "Bouclier",
        effect: "activateBarrier",
        duration: 5000,
        color: 'white'
    },
    SPEED_UP: {
        name: "Vitesse",
        effect: "increaseSpeed",
        duration: 7000,
        speedBoost: 2
    }
};


// Une liste des power-ups disponibles que les ennemis peuvent lâcher ou qui peuvent apparaître
const POWERUP_COLLECTION = [
    { type: POWERUP_TYPES.WEAPON, weapon: WEAPON_TYPES.MACHINE_GUN },
    { type: POWERUP_TYPES.WEAPON, weapon: WEAPON_TYPES.DOUBLE_SHOT },
    { type: POWERUP_TYPES.WEAPON, weapon: WEAPON_TYPES.SPREAD_SHOT },
    { type: POWERUP_TYPES.WEAPON, weapon: WEAPON_TYPES.LASER },
    { type: POWERUP_TYPES.WEAPON, weapon: WEAPON_TYPES.HOMING_GUN },
    { type: POWERUP_TYPES.WEAPON, weapon: WEAPON_TYPES.FLAME_THROWER },
    { type: POWERUP_TYPES.BARRIER },
    { type: POWERUP_TYPES.SPEED_UP }
];