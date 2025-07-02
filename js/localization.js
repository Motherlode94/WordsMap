// js/localization.js

// Objet de traduction
const translations = {
    fr: {
        gameTitle: "MON SUPER SHOOTER",
        pressEnterToStart: "Appuyez sur ENTRÉE pour commencer",
        pressOForOptions: "Appuyez sur O pour les Options",
        highScore: "Meilleur Score",
        options: "OPTIONS",
        volume: "Volume",
        useArrowsToAdjust: "Utilisez les flèches GAUCHE/DROITE pour ajuster",
        useUpDownArrowsToNavigate: "Utilisez les flèches HAUT/BAS pour naviguer",
        pressEscToReturn: "Appuyez sur ÉCHAP pour retourner au menu",
        gameOver: "GAME OVER!",
        finalScore: "Score Final",
        pressRToMenu: "Appuyez sur R pour retourner au menu principal",
        victory: "VICTOIRE !",
        congratulations: "Félicitations, vous avez terminé le jeu !",
        score: "Score",
        level: "Niveau",
        weapon: "Arme",
        health: "HP",
        shield: "Bouclier",
        speed: "Vitesse",
        language: "Langue",
        normalWeapon: "Normal",
        machineGun: "Mitrailleuse",
        doubleShot: "Double Tir",
        spreadShot: "Tir Large",
        laser: "Laser",
        flameThrower: "Lance-Flammes",
        homingGun: "Tir Guidé",
        boss: "BOSS"
    },
    en: {
        gameTitle: "MY SUPER SHOOTER",
        pressEnterToStart: "Press ENTER to Start",
        pressOForOptions: "Press O for Options",
        highScore: "High Score",
        options: "OPTIONS",
        volume: "Volume",
        useArrowsToAdjust: "Use LEFT/RIGHT arrows to adjust",
        useUpDownArrowsToNavigate: "Use UP/DOWN arrows to navigate",
        pressEscToReturn: "Press ESC to return to menu",
        gameOver: "GAME OVER!",
        finalScore: "Final Score",
        pressRToMenu: "Press R to return to main menu",
        victory: "VICTORY !",
        congratulations: "Congratulations, you completed the game!",
        score: "Score",
        level: "Level",
        weapon: "Weapon",
        health: "HP",
        shield: "Shield",
        speed: "Speed",
        language: "Language",
        normalWeapon: "Normal",
        machineGun: "Machine Gun",
        doubleShot: "Double Shot",
        spreadShot: "Spread Shot",
        laser: "Laser",
        flameThrower: "Flame Thrower",
        homingGun: "Homing Gun",
        boss: "BOSS"
    }
    // Ajoutez d'autres langues ici
};

// Fonction pour obtenir le texte traduit
function getTranslation(key) {
    const lang = gameOptions.language || 'fr'; // Utilise la langue sélectionnée, ou 'fr' par défaut
    return translations[lang][key] || `MISSING_TRANSLATION_${key}`; // Retourne le texte ou un message d'erreur
}