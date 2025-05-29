export const GRID_SIZE = 7;
export const screens = {
    start: document.getElementById("start-screen"),
    playerCount: document.getElementById("player-count-screen"),
    heroSelection: document.getElementById("hero-selection-screen"),
    instructions: document.getElementById("instructions-screen"),
    game: document.getElementById("game-screen"),
    end: document.getElementById("end-screen"),
};
export const HEROES = {
    chevalier: {
        name: "Chevalier",
        health: 120,
        maxCharge: 100,
        chargePerTurn: 10,
        moveRange: 1,
        attackRange: 1,
        attackDamage: {
            quick: 15,
            heavy: 25,
        },
        attackCost: {
            quick: 0,
            heavy: 30,
        },
        specialPower: {
            name: "Cri de guerre",
            description: "Augmente les dégâts d'attaque de 50% pour 2 tours",
            cooldown: 3,
            cost: 50,
        },
        icon: "assets/chevalier_icon.png",
        frameColor: "#e63946",
        badgeColor: "#f9c80e",
        role: "Défenseur",
        description: "Le Chevalier est un guerrier puissant et résistant. Sa force au corps à corps et sa capacité à encaisser les coups en font un adversaire redoutable.",
        attack: 250,
        fusionAttack: 500,
        hp: 1200,
        fusionHp: 2400,
        stars: 3,
        // Added image paths
        images: {
            front: "assets/chevalier_front.png",
            back: "assets/chevalier_back.png"
        }
    },
    ninja: {
        name: "Ninja",
        health: 80,
        maxCharge: 100,
        chargePerTurn: 10,
        moveRange: 2,
        attackRange: 1,
        attackDamage: {
            quick: 10,
            heavy: 20,
        },
        attackCost: {
            quick: 0,
            heavy: 25,
        },
        specialPower: {
            name: "Double attaque",
            description: "Effectue deux attaques consécutives",
            cooldown: 3,
            cost: 40,
        },
        icon: "assets/ninja_icon.png",
        frameColor: "#2a9d8f",
        badgeColor: "#f9c80e",
        role: "Assassin",
        description: "Le Ninja est un combattant agile et mortel. Sa vitesse exceptionnelle lui permet de se déplacer rapidement sur le champ de bataille.",
        attack: 200,
        fusionAttack: 400,
        hp: 800,
        fusionHp: 1600,
        stars: 4,
        // Added image paths
        images: {
            front: "assets/ninja_front.png",
            back: "assets/ninja_back.png"
        }
    },
    sorciere: {
        name: "Sorciere",
        health: 70,
        maxCharge: 100,
        chargePerTurn: 10,
        moveRange: 1,
        attackRange: 3,
        attackDamage: {
            quick: 12,
            heavy: 22,
        },
        attackCost: {
            quick: 0,
            heavy: 35,
        },
        specialPower: {
            name: "Tempête magique",
            description: "Attaque tous les ennemis dans un rayon de 2 cases",
            cooldown: 3,
            cost: 60,
        },
        icon: "assets/sorciere_icon.png",
        frameColor: "#4361ee",
        badgeColor: "#f9c80e",
        role: "Mage",
        description: "Le Sorcier maîtrise les arts mystiques et peut attaquer à distance. Bien que fragile en défense, sa magie dévastatrice peut toucher plusieurs ennemis à la fois.",
        attack: 300,
        fusionAttack: 600,
        hp: 700,
        fusionHp: 1400,
        stars: 5,
        // Added image paths
        images: {
            front: "assets/sorciere_front.png",
            back: "assets/sorciere_back.png"
        }
    },
    gardien: {
        name: "Gardien",
        health: 125,
        maxCharge: 100,
        chargePerTurn: 10,
        moveRange: 1,
        attackRange: 1,
        attackDamage: {
            quick: 15,
            heavy: 25,
        },
        attackCost: {
            quick: 0,
            heavy: 30,
        },
        specialPower: {
            name: "Poignée de fer",
            description: "Augmente les dégâts de 50% pendant 2 tours",
            cooldown: 3,
            cost: 50,
        },
        icon: "assets/gardien_icon.png",
        frameColor: "#4a4e69",
        badgeColor: "#f9c80e",
        role: "Tank",
        description: "Le Gardien se dresse tel un mur sur le champ de bataille. Grâce à sa Poignée de fer, il assène une frappe puissante du poing, concentrée pour infliger de lourds dégâts",
        attack: 250,
        fusionAttack: 500,
        hp: 1250,
        fusionHp: 2500,
        stars: 3,
        images: {
            front: "assets/gardien_front.png",
            back: "assets/gardien_back.png"
        }
    }

};
export const STARTING_POSITIONS = {
    2: [
        { x: 0, y: 0 },
        { x: 6, y: 6 },
    ],
    3: [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 3, y: 6 },
    ],
    4: [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 0, y: 6 },
        { x: 6, y: 6 },
    ],
};

// Defense constants
export const DEFENSE_REDUCTION = 0.5; // 50% damage reduction when defending
