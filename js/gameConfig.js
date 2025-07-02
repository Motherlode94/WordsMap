// Dimensions du jeu (doivent correspondre au canvas HTML)
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Vitesses des différents éléments
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_SPEED_MIN = 1.5; // Vitesse minimale des ennemis
const ENEMY_SPEED_MAX = 3.5; // Vitesse maximale des ennemis

// Paramètres de génération
const ENEMY_SPAWN_INTERVAL = 1500; // Nouvelle ennemi toutes les 1.5 secondes (en ms)
const OBSTACLE_COUNT = 5; // Nombre initial d'obstacles
const OBSTACLE_SPAWN_INTERVAL = 3000; // Nouvelle obstacle toutes les 3 secondes (en ms)
// Nombre maximum d'ennemis à l'écran
const MAX_ENEMIES = 10; // Nombre maximum d'ennemis à l'écran   
// Nombre maximum d'obstacles à l'écran
const MAX_OBSTACLES = 5; // Nombre maximum d'obstacles à l'écran
// Taille du joueur
const PLAYER_WIDTH = 50;    
const PLAYER_HEIGHT = 50;
// Taille des ennemis
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 30;

// Couleurs (facile à changer ici)
const PLAYER_COLOR = 'cyan';
const BULLET_COLOR = 'lime';
const ENEMY_COLOR = 'magenta';
const OBSTACLE_COLOR = 'darkgray';
const TEXT_COLOR = 'white';
const GAME_OVER_COLOR = 'red';
// Couleurs des power-ups
const POWER_UP_COLOR = 'gold';
const POWER_UP_SIZE = 20;   
// Taille des power-ups 
const POWER_UP_DURATION = 5000; // Durée de l'effet du power-up en ms
// Couleurs des armes   
const WEAPON_COLOR = {
    pistol: 'blue',
    shotgun: 'green',
    rifle: 'red',
    laser: 'purple',
    homing: 'orange' // Couleur pour les balles guidées
};

// Dimensions des balles (globales si non spécifiées par l'arme)
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 10;

// Vie et dégâts
const PLAYER_MAX_HEALTH = 100;
const PLAYER_INVINCIBILITY_DURATION = 1500; // Assurez-vous que c'est une valeur > 0
const ENEMY_DAMAGE = 10;
const BULLET_DAMAGE = 20;
const OBSTACLE_HEALTH_MIN = 40;
const OBSTACLE_HEALTH_MAX = 100;

// États possibles du jeu
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    OPTIONS: 'options',
    GAME_OVER: 'gameOver',
    WIN: 'win' // Ajoutons un état de victoire
};

