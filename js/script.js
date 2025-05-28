const GRID_SIZE = 7;
const screens = {
    start: document.getElementById("start-screen"),
    playerCount: document.getElementById("player-count-screen"),
    heroSelection: document.getElementById("hero-selection-screen"),
    instructions: document.getElementById("instructions-screen"),
    game: document.getElementById("game-screen"),
    end: document.getElementById("end-screen"),
};
const HEROES = {
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
let gameState = {
    currentScreen: "start",
    playerCount: 2,
    currentPlayerSelection: 0,
    selectedHeroes: [],
    players: [],
    currentPlayer: 0,
    turn: 1,
    gameMode: "movement", // 'movement', 'attack', 'special', 'defend'
    gameLog: [],
    stats: {
        totalTurns: 0,
        totalAttacks: 0,
        totalDamage: 0,
        totalCrits: 0,
    },
    playerNames :[],
};
const STARTING_POSITIONS = {
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
const DEFENSE_REDUCTION = 0.5; // 50% damage reduction when defending

function changeScreen(screenName) {
    Object.keys(screens).forEach((key) => {
        screens[key].classList.remove("active");
    });
    screens[screenName].classList.add("active");
    gameState.currentScreen = screenName;
}
function initGame(){
    createBackgroundElements();
    document.getElementById("start-game").addEventListener("click", () => {
        changeScreen("playerCount");
    });
    document.getElementById("show-instructions").addEventListener("click", () => {
        changeScreen("instructions");
    });
    document.getElementById("back-to-start").addEventListener("click", () => {
        changeScreen("start");
    });
    document.getElementById("close-instructions").addEventListener("click", () => {
        // Retourner à l'écran précédent
        if (gameState.currentScreen === "instructions") {
            changeScreen("start");
        }
    });

    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabBtns.forEach((b) => b.classList.remove("active"));
            tabContents.forEach((c) => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });
    initGameCards();
// Écouteurs d'événements pour l'écran de sélection du nombre de joueurs
    const countOptions = document.querySelectorAll(".count-option");
    const playerNameFields = document.querySelectorAll(".player-name-field");

    countOptions.forEach((option) => {
        option.addEventListener("click", () => {
            countOptions.forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");

            const count = Number.parseInt(option.dataset.count);
            gameState.playerCount = count;

            // Show only the number of name fields based on selected count
            playerNameFields.forEach((field, index) => {
                field.classList.toggle("visible", index < count);
            });
        });
    });

    document.getElementById("confirm-player-count").addEventListener("click", () => {
        // Réinitialiser la sélection des héros
        gameState.selectedHeroes = [];
        gameState.currentPlayerSelection = 0;


        // Récupérer les noms des joueurs
        gameState.playerNames = [];
        for (let i = 1; i <= gameState.playerCount; i++) {
            const nameInput = document.getElementById(`player${i}-name`);
            const name = nameInput.value.trim();
            gameState.playerNames.push(name || `Joueur ${i}`); // Nom par défaut si vide
        }
        // Créer les cartes de héros pour la sélection
        createHeroSelectionCards();

        updateHeroSelectionScreen();
        changeScreen("heroSelection");
    });
    document.getElementById("start-battle").addEventListener("click", () => {
        setupGame();
        changeScreen("game");
    });
    document.getElementById("move-btn").addEventListener("click", () => {
        setGameMode("movement");
        highlightMoveRange();
    });

    document.getElementById("attack-btn").addEventListener("click", () => {
        // Check if there are valid targets before allowing attack
        if (hasValidAttackTargets()) {
            setGameMode("attack");
            highlightAttackRange();
        } else {
            addLogEntry("Aucune cible à portée d'attaque !", "system");
        }
    });

    document.getElementById("special-btn").addEventListener("click", () => {
        useSpecialPower();
    });

    document.getElementById("defend-btn").addEventListener("click", () => {
        defend();
    });
    const attackOptionBtns = document.querySelectorAll(".attack-option-btn");
    attackOptionBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const attackType = btn.dataset.attack;
            const currentPlayerObj = gameState.players[gameState.currentPlayer];
            const heroData = HEROES[currentPlayerObj.hero];
            const cost = heroData.attackCost[attackType];

            // Check if player has enough charge
            if (currentPlayerObj.charge < cost) {
                addLogEntry(`Pas assez de charge pour cette attaque ! (${cost} requis, ${currentPlayerObj.charge} disponible)`, "system");
                return;
            }

            attackEnemy(attackType);
            hideAttackControls();
            endTurn();
        });
    });
    // Écouteurs d'événements pour l'écran de fin
    document.getElementById("play-again").addEventListener("click", () => {
        resetGame();
        changeScreen("playerCount");
    });

    document.getElementById("return-home").addEventListener("click", () => {
        resetGame();
        changeScreen("start");
    });
}
/* Initialiser les cartes de jeu */
function initGameCards() {
    // Créer des cartes de héros pour le conteneur de cartes
    displayCardImage('card-container', HEROES.chevalier);
    displayCardImage('card-container', HEROES.ninja);
    displayCardImage('card-container', HEROES.sorciere);
    displayCardImage('card-container', HEROES.gardien);
}
function displayCardImage(containerClass, hero) {
    // Extract data from hero object
    const data = {
        frontImage: hero.images?.front || 'sorciere_front.png',
        backImage: hero.images?.back || 'sorciere_front.png',
        name: hero.name || 'Character',
        role: hero.role || 'Unknown'
    };

    // Get the container element
    const container = document.getElementById(containerClass);
    // Create a unique ID for this card's styles
    const cardId = `card_${Math.random().toString(36).substr(2, 9)}`;

    // Create and add minimal styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .${cardId}-container {
            width: 280px;
            height: 420px;
            perspective: 1000px;
            margin: 10px;
        }

        .${cardId} {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s;
            transform-style: preserve-3d;
            cursor: pointer;
        }

        .${cardId}.flipped {
            transform: rotateY(180deg);
        }

        .${cardId} .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        }

        .${cardId} .card-back {
            transform: rotateY(180deg);
        }

        .${cardId} .card-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .${cardId} .flip-hint {
        position: absolute;
        top: 15px;
        right: 15px;
        color: white;
        background-color: rgba(0, 0, 0, 0.6);
        padding: 8px;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
    }
    
    .${cardId} .flip-hint i {
        font-size: 16px;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    `;
    document.head.appendChild(styleElement);

    // Create the card container
    const cardContainer = document.createElement('div');
    cardContainer.className = `${cardId}-container`;

    // Create the card element
    const cardElement = document.createElement('div');
    cardElement.className = cardId;

    // Create the front of the card
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.innerHTML = `
        <img src="${data.frontImage}" alt="${data.name}" class="card-image">
        <div class="flip-hint"><i class="fas fa-sync-alt"></i></div>
    `;

    // Create the back of the card
    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    cardBack.innerHTML = `
        <img src="${data.backImage}" alt="${data.name} (back)" class="card-image">
        <div class="flip-hint"><i class="fas fa-sync-alt"></i></div>
    `;

    // Add front and back to the card
    cardElement.appendChild(cardFront);
    cardElement.appendChild(cardBack);

    // Add the card to the container
    cardContainer.appendChild(cardElement);

    // Add the container to the main container
    container.appendChild(cardContainer);

    // Add click event to flip the card
    cardElement.addEventListener('click', () => {
        cardElement.classList.toggle('flipped');
    });

    // Return the card element in case further manipulation is needed
    return cardElement;
}


// Créer les éléments de fond animés
function createBackgroundElements() {
    const backgroundElements = document.getElementById("background-elements");
    backgroundElements.innerHTML = "";
    for (let i = 0; i < 20; i++) {
        const element = document.createElement("div");
        element.classList.add("bg-element");

        // Taille aléatoire
        const size = Math.random() * 200 + 50;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;

        // Position aléatoire
        element.style.top = `${Math.random() * 100}%`;
        element.style.left = `${Math.random() * 100}%`;

        // Animation aléatoire
        element.style.animationDuration = `${Math.random() * 20 + 10}s`;
        element.style.animationDelay = `${Math.random() * 5}s`;

        backgroundElements.appendChild(element);
    }
}

// Créer les cartes de héros pour la sélection
function createHeroSelectionCards() {
    const heroSelectionContainer = document.getElementById("hero-selection-cards");
    heroSelectionContainer.innerHTML = "";

    // Créer une carte pour chaque type de héros
    Object.keys(HEROES).forEach(heroType => {
        const heroData = HEROES[heroType];
        const cardElement = displayCardImage('hero-selection-cards', heroData);

        // Ajouter la classe pour rendre la carte sélectionnable
        cardElement.classList.add('selectable-card');
        cardElement.dataset.heroType = heroType;

        // Ajouter un effet de lueur spécifique au héros
        const glowElement = document.createElement('div');
        glowElement.classList.add('card-glow', `${heroType}-glow`);
        cardElement.appendChild(glowElement);

        // Ajouter un écouteur d'événements pour la sélection
        cardElement.addEventListener('click', () => {
            if (gameState.currentPlayerSelection < gameState.playerCount) {
                // Vérifier si ce héros est déjà sélectionné
                if (gameState.selectedHeroes.some((hero) => hero.type === heroType)) {
                    alert("Ce héros est déjà sélectionné par un autre joueur.");
                    return;
                }

                // Récupérer l'index du joueur actuel avant de l'incrémenter
                const playerIndex = gameState.currentPlayerSelection;

                // Ajouter le héros sélectionné
                gameState.selectedHeroes.push({
                    player: playerIndex,
                    type: heroType,
                });

                // Marquer la carte comme sélectionnée
                cardElement.classList.add('selected');

                // Ajouter le badge du joueur
                const badge = document.createElement("div");
                badge.textContent = gameState.playerNames[playerIndex] || `Joueur ${playerIndex + 1}`;
                badge.style.position = "absolute";
                badge.style.top = "10px";
                badge.style.left = "10px";
                badge.style.backgroundColor = "#f9c80e";
                badge.style.color = "#1e1e3c";
                badge.style.padding = "5px 10px";
                badge.style.borderRadius = "20px";
                badge.style.fontWeight = "bold";
                badge.style.zIndex = "20";
                badge.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
                badge.style.fontSize = "0.85rem";
                cardElement.appendChild(badge);

                // Passer au joueur suivant
                gameState.currentPlayerSelection++;

                // Mettre à jour l'affichage
                updateHeroSelectionScreen();

                // Activer le bouton de démarrage si tous les joueurs ont choisi leur héros
                if (gameState.currentPlayerSelection >= gameState.playerCount) {
                    document.getElementById("start-battle").disabled = false;
                }
            }
        });

    });
}

// Mise à jour de l'écran de sélection des héros
function updateHeroSelectionScreen() {
    // Mettre à jour le texte du joueur actuel
    const currentPlayerSelectionText = document.getElementById("current-player-selection");
    if (gameState.currentPlayerSelection < gameState.playerCount) {
        currentPlayerSelectionText.textContent = `${gameState.playerNames[gameState.currentPlayerSelection]}, choisissez votre héros`;
    } else {
        currentPlayerSelectionText.textContent = "Tous les joueurs ont choisi leur héros";
    }
}

function setupGame() {
    // Initialiser les joueurs
    gameState.players = [];

    for (let i = 0; i < gameState.playerCount; i++) {
        const heroType = gameState.selectedHeroes.find((hero) => hero.player === i).type;
        const heroData = HEROES[heroType];
        const position = STARTING_POSITIONS[gameState.playerCount][i];

        gameState.players.push({
            name:gameState.playerNames[i],
            hero: heroType,
            position: { ...position },
            health: heroData.health,
            charge: heroData.maxCharge, // Initialize with full charge
            powerCooldown: 0,
            effects: [],
            isDefending: false, // Add a flag to track if player is defending
            defendingTurnsLeft: 0 // Track how many turns defense lasts
        });
    }

    // Réinitialiser les statistiques
    gameState.stats = {
        totalTurns: 0,
        totalAttacks: 0,
        totalDamage: 0,
        totalCrits: 0,
    };

    // Réinitialiser le tour et le joueur actuel
    gameState.turn = 1;
    gameState.currentPlayer = 0;

    // Mettre à jour l'affichage
    updateGameDisplay();

    // Créer la grille de l'arène
    createArena();

    // Vider le journal de combat
    const logEntries = document.getElementById("log-entries");
    logEntries.innerHTML = "";

    // Add game start messages
    addLogEntry("La bataille commence !", "system");
    addLogEntry("Utilisez la défense pour réduire les dégâts de 50% jusqu'à votre prochain tour.", "system");
}

// Création de la grille de l'arène
function createArena() {
    const arena = document.getElementById("arena");
    arena.innerHTML = "";

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Vérifier si un joueur est sur cette case
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].position.x === x && gameState.players[i].position.y === y) {
                    const heroToken = document.createElement("div");
                    heroToken.classList.add("hero-token", gameState.players[i].hero);

                    // Add a visual indicator if player is defending
                    if (gameState.players[i].isDefending) {
                        heroToken.classList.add("defending");

                        // Add shield icon overlay
                        const shieldOverlay = document.createElement("div");
                        shieldOverlay.className = "shield-overlay";
                        shieldOverlay.innerHTML = '<i class="fas fa-shield-alt"></i>';
                        heroToken.appendChild(shieldOverlay);
                    }

                    const heroIcon = document.createElement("img");
                    heroIcon.src = HEROES[gameState.players[i].hero].icon;
                    heroIcon.alt = gameState.players[i].hero + " icon";
                    heroIcon.classList.add("hero-icon");


                    heroToken.appendChild(heroIcon);
                    cell.appendChild(heroToken);
                }
            }

            // Ajouter un écouteur d'événements pour les actions sur les cases
            cell.addEventListener("click", () => {
                handleCellClick(x, y);
            });

            arena.appendChild(cell);
        }
    }
}

// Check if the current player has valid attack targets
function hasValidAttackTargets() {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const attackRange = HEROES[currentPlayerObj.hero].attackRange;
    const playerX = currentPlayerObj.position.x;
    const playerY = currentPlayerObj.position.y;

    for (let i = 0; i < gameState.players.length; i++) {
        if (i !== gameState.currentPlayer) {
            const distance = Math.abs(gameState.players[i].position.x - playerX) +
                Math.abs(gameState.players[i].position.y - playerY);

            let isValidTarget = distance <= attackRange;

            // For Sorciere, check if target is in a straight line
            if (currentPlayerObj.hero === "sorciere") {
                const isInLine = gameState.players[i].position.x === playerX ||
                    gameState.players[i].position.y === playerY;
                isValidTarget = isValidTarget && isInLine;
            }

            if (isValidTarget) {
                return true;
            }
        }
    }

    return false;
}

function updateGameDisplay() {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const heroData = HEROES[currentPlayerObj.hero];

    // Mettre à jour les informations du tour
    document.getElementById("turn-counter").textContent = gameState.turn;
    document.getElementById("current-player").textContent = gameState.currentPlayer + 1;

    // Mettre à jour les informations du héros
    document.getElementById("hero-name").textContent = heroData.name;
    const healthPercent = (currentPlayerObj.health / heroData.health) * 100;
    document.getElementById("health-fill").style.width = healthPercent + "%";
    document.getElementById("health-value").textContent = currentPlayerObj.health + "/" + heroData.health;

    // Mettre à jour la charge
    const chargePercent = (currentPlayerObj.charge / heroData.maxCharge) * 100;
    document.getElementById("charge-fill").style.width = chargePercent + "%";
    document.getElementById("charge-value").textContent = currentPlayerObj.charge + "/" + heroData.maxCharge;

    // Mettre à jour la couleur de la barre de santé en fonction du pourcentage
    const healthFill = document.getElementById("health-fill");
    if (healthPercent > 60) {
        healthFill.style.background = "linear-gradient(to right, #2ecc71, #27ae60)";
    } else if (healthPercent > 30) {
        healthFill.style.background = "linear-gradient(to right, #f39c12, #e67e22)";
    } else {
        healthFill.style.background = "linear-gradient(to right, #e74c3c, #c0392b)";
    }

    // Mettre à jour l'état du bouton de pouvoir spécial
    const specialBtn = document.getElementById("special-btn");
    const specialCost = heroData.specialPower.cost;
    if (currentPlayerObj.powerCooldown > 0) {
        specialBtn.disabled = true;
        specialBtn.innerHTML = `<i class="fas fa-bolt"></i><span>${heroData.specialPower.name} (${currentPlayerObj.powerCooldown})</span>`;
    } else if (currentPlayerObj.charge < specialCost) {
        specialBtn.disabled = true;
        specialBtn.innerHTML = `<i class="fas fa-bolt"></i><span>${heroData.specialPower.name} (${specialCost} charge)</span>`;
    } else {
        specialBtn.disabled = false;
        specialBtn.innerHTML = `<i class="fas fa-bolt"></i><span>${heroData.specialPower.name}</span>`;
    }

    // Update attack buttons to show charge costs
    const attackOptionBtns = document.querySelectorAll(".attack-option-btn");
    attackOptionBtns.forEach((btn) => {
        const attackType = btn.dataset.attack;
        const cost = heroData.attackCost[attackType];
        const span = btn.querySelector('span');

        if (attackType === 'quick') {
            span.textContent = 'Attaque rapide';
        } else if (attackType === 'heavy') {
            span.textContent = `Attaque lourde (${cost} charge)`;
            btn.disabled = currentPlayerObj.charge < cost;
        }
    });

    // Enable/disable attack button based on valid targets
    const attackBtn = document.getElementById("attack-btn");
    const hasTargets = hasValidAttackTargets();
    attackBtn.disabled = !hasTargets;
    if (!hasTargets) {
        attackBtn.title = "Aucune cible à portée d'attaque";
    } else {
        attackBtn.title = "";
    }

    // Mettre à jour la grille
    createArena();
}
function setGameMode(mode) {
    gameState.gameMode = mode;

    // Réinitialiser les contrôles
    //hideMovementControls();
    //hideAttackControls();

    // Mettre à jour l'affichage en fonction du mode
    if (mode === "movement") {
        //showMovementControls();
    } else if (mode === "attack") {
        showAttackControls();
    }
}

// Afficher les contrôles d'attaque
function showAttackControls() {
    document.getElementById("attack-controls").classList.remove("hidden");
    //document.getElementById("movement-controls").classList.add("hidden");

    // Mettre en évidence les cases où le joueur peut attaquer
    highlightAttackRange();
}

// Cacher les contrôles d'attaque
function hideAttackControls() {
    document.getElementById("attack-controls").classList.add("hidden");
    console.log("here");

    // Supprimer les mises en évidence
    //clearHighlights();
}

// Mettre en évidence la portée de mouvement
function highlightMoveRange() {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const moveRange = HEROES[currentPlayerObj.hero].moveRange;
    const playerX = currentPlayerObj.position.x;
    const playerY = currentPlayerObj.position.y;

    clearHighlights();

    // Mettre en évidence les cases dans la portée de mouvement
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const distance = Math.abs(x - playerX) + Math.abs(y - playerY);
            if (distance <= moveRange && distance > 0) {
                // Vérifier si la case est vide
                let isEmpty = true;
                for (let i = 0; i < gameState.players.length; i++) {
                    if (gameState.players[i].position.x === x && gameState.players[i].position.y === y) {
                        isEmpty = false;
                        break;
                    }
                }

                if (isEmpty) {
                    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                    if (cell) {
                        cell.classList.add("highlight");
                    }
                }
            }
        }
    }
}

// Mettre en évidence la portée d'attaque
function highlightAttackRange() {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const attackRange = HEROES[currentPlayerObj.hero].attackRange;
    const playerX = currentPlayerObj.position.x;
    const playerY = currentPlayerObj.position.y;

    clearHighlights();

    // Mettre en évidence les cases dans la portée d'attaque
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            // Pour le Sorcier, vérifier si la case est en ligne droite
            if (currentPlayerObj.hero === "sorciere") {
                const isInLine = x === playerX || y === playerY;
                const distance = Math.abs(x - playerX) + Math.abs(y - playerY);

                if (isInLine && distance <= attackRange && distance > 0) {
                    // Vérifier si la case contient un ennemi
                    for (let i = 0; i < gameState.players.length; i++) {
                        if (
                            i !== gameState.currentPlayer &&
                            gameState.players[i].position.x === x &&
                            gameState.players[i].position.y === y
                        ) {
                            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                            if (cell) {
                                cell.classList.add("attack-range");
                            }
                        }
                    }
                }
            } else {
                // Pour les autres héros, vérifier la distance Manhattan
                const distance = Math.abs(x - playerX) + Math.abs(y - playerY);
                if (distance <= attackRange && distance > 0) {
                    // Vérifier si la case contient un ennemi
                    for (let i = 0; i < gameState.players.length; i++) {
                        if (
                            i !== gameState.currentPlayer &&
                            gameState.players[i].position.x === x &&
                            gameState.players[i].position.y === y
                        ) {
                            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                            if (cell) {
                                cell.classList.add("attack-range");
                            }
                        }
                    }
                }
            }
        }
    }
}

// Supprimer toutes les mises en évidence
function clearHighlights() {
    const highlightedCells = document.querySelectorAll(".cell.highlight, .cell.attack-range");
    highlightedCells.forEach((cell) => {
        cell.classList.remove("highlight", "attack-range");
    });
}

// Déplacer le joueur
function movePlayer(direction) {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const moveRange = HEROES[currentPlayerObj.hero].moveRange;
    let newX = currentPlayerObj.position.x;
    let newY = currentPlayerObj.position.y;

    // Calculer la nouvelle position en fonction de la direction
    switch (direction) {
        case "up":
            newY = Math.max(0, newY - 1);
            break;
        case "down":
            newY = Math.min(GRID_SIZE - 1, newY + 1);
            break;
        case "left":
            newX = Math.max(0, newX - 1);
            break;
        case "right":
            newX = Math.min(GRID_SIZE - 1, newX + 1);
            break;
    }

    // Vérifier si le déplacement est valide
    const distance = Math.abs(newX - currentPlayerObj.position.x) + Math.abs(newY - currentPlayerObj.position.y);
    if (distance > moveRange) {
        addLogEntry("Déplacement trop loin !", "system");
        return;
    }

    // Vérifier si la case est vide
    for (let i = 0; i < gameState.players.length; i++) {
        if (gameState.players[i].position.x === newX && gameState.players[i].position.y === newY) {
            addLogEntry("Case déjà occupée !", "system");
            return;
        }
    }

    // Effectuer le déplacement
    currentPlayerObj.position.x = newX;
    currentPlayerObj.position.y = newY;

    addLogEntry(
        `Joueur ${gameState.currentPlayer + 1} se déplace en (${newX}, ${newY})`,
        `player${gameState.currentPlayer + 1}`,
    );

    // Mettre à jour l'affichage
    updateGameDisplay();
    hideMovementControls();
}

// Attaquer un ennemi
function attackEnemy(attackType) {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const heroData = HEROES[currentPlayerObj.hero];
    const attackRange = heroData.attackRange;
    const cost = heroData.attackCost[attackType];

    // Check if player has enough charge
    if (currentPlayerObj.charge < cost) {
        addLogEntry(`Pas assez de charge pour cette attaque ! (${cost} requis, ${currentPlayerObj.charge} disponible)`, "system");
        return;
    }

    // Trouver une cible valide
    let targetIndex = -1;
    let minDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < gameState.players.length; i++) {
        if (i !== gameState.currentPlayer) {
            const distance =
                Math.abs(gameState.players[i].position.x - currentPlayerObj.position.x) +
                Math.abs(gameState.players[i].position.y - currentPlayerObj.position.y);

            let isValidTarget = distance <= attackRange;

            // Pour le Sorcier, vérifier si la cible est en ligne droite
            if (currentPlayerObj.hero === "sorciere") {
                const isInLine =
                    gameState.players[i].position.x === currentPlayerObj.position.x ||
                    gameState.players[i].position.y === currentPlayerObj.position.y;
                isValidTarget = isValidTarget && isInLine;
            }

            if (isValidTarget && distance < minDistance) {
                targetIndex = i;
                minDistance = distance;
            }
        }
    }

    if (targetIndex === -1) {
        addLogEntry("Aucune cible valide !", "system");
        return;
    }

    // Consume charge
    currentPlayerObj.charge -= cost;

    const targetPlayerObj = gameState.players[targetIndex];

    // Lancer le dé pour déterminer si l'attaque réussit
    const diceResult = rollDice();

    if (diceResult <= 2) {
        // Échec
        addLogEntry(
            `${gameState.playerNames[gameState.currentPlayer]} rate son attaque contre ${gameState.playerNames[targetIndex]} !`,
            `player${gameState.currentPlayer + 1}`,
        );
    } else {
        // Réussite
        let damage = heroData.attackDamage[attackType];

        // Appliquer les effets actifs
        currentPlayerObj.effects.forEach((effect) => {
            if (effect.type === "damage_boost") {
                damage *= effect.value;
            }
        });

        // Vérifier si c'est un coup critique
        if (diceResult === 6) {
            damage *= 2;
            addLogEntry(
                `Coup critique ! ${gameState.playerNames[gameState.currentPlayer]} inflige ${damage} dégâts à ${gameState.playerNames[targetIndex]} !`,
                `player${gameState.currentPlayer + 1}`,
            );
            gameState.stats.totalCrits++;
        } else {
            addLogEntry(
                `${gameState.playerNames[gameState.currentPlayer]} inflige ${damage} dégâts à ${gameState.playerNames[targetIndex]} !`,
                `player${gameState.currentPlayer + 1}`,
            );
        }

        // Check if target is defending
        if (targetPlayerObj.isDefending) {
            const originalDamage = damage;
            damage *= (1 - DEFENSE_REDUCTION);
            addLogEntry(
                `${gameState.playerNames[targetIndex]} est en position défensive et réduit les dégâts de ${Math.round(originalDamage - damage)} !`,
                `player${targetIndex + 1}`,
            );
        }

        // Appliquer les dégâts
        targetPlayerObj.health = Math.max(0, targetPlayerObj.health - Math.floor(damage));

        // Mettre à jour les statistiques
        gameState.stats.totalAttacks++;
        gameState.stats.totalDamage += Math.floor(damage);

        // Vérifier si la cible est vaincue
        if (targetPlayerObj.health <= 0) {
            addLogEntry(`${gameState.playerNames[targetIndex]} est vaincu !`, "system");

            // Supprimer le joueur vaincu
            gameState.players.splice(targetIndex, 1);

            // Ajuster l'index du joueur actuel si nécessaire
            if (targetIndex < gameState.currentPlayer) {
                gameState.currentPlayer--;
            }

            // Vérifier s'il ne reste qu'un seul joueur
            if (gameState.players.length === 1) {
                endGame(0); // Le dernier joueur restant est le vainqueur
                return;
            }
        }
    }

    // Mettre à jour l'affichage
    hideAttackControls();
    updateGameDisplay();
}

// Utiliser le pouvoir spécial
function useSpecialPower() {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const heroData = HEROES[currentPlayerObj.hero];
    const cost = heroData.specialPower.cost;

    // Vérifier si le pouvoir est disponible
    if (currentPlayerObj.powerCooldown > 0) {
        addLogEntry("Pouvoir spécial en recharge !", "system");
        return;
    }

    // Check if player has enough charge
    if (currentPlayerObj.charge < cost) {
        addLogEntry(`Pas assez de charge pour le pouvoir spécial ! (${cost} requis, ${currentPlayerObj.charge} disponible)`, "system");
        return;
    }

    // Check if there are valid targets for special powers that need them
    if ((currentPlayerObj.hero === "ninja" || currentPlayerObj.hero === "sorciere") && !hasValidAttackTargets()) {
        addLogEntry("Aucune cible à portée pour ce pouvoir spécial !", "system");
        return;
    }

    // Consume charge
    currentPlayerObj.charge -= cost;

    // Appliquer l'effet du pouvoir spécial en fonction du héros
    switch (currentPlayerObj.hero) {
        case "chevalier":
            // Cri de guerre : augmente les dégâts d'attaque
            currentPlayerObj.effects.push({
                type: "damage_boost",
                duration: 2,
                value: 1.5,
            });
            addLogEntry(
                `${gameState.playerNames[gameState.currentPlayer]} utilise Cri de guerre ! Dégâts augmentés de 50% pour 2 tours.`,
                `player${gameState.currentPlayer + 1}`,
            );
            break;

        case "ninja":
            // Double attaque : effectue deux attaques consécutives
            addLogEntry(
                `${gameState.playerNames[gameState.currentPlayer]} utilise Double attaque !`,
                `player${gameState.currentPlayer + 1}`,
            );

            // Trouver une cible valide
            let targetIndex = -1;
            let minDistance = Number.POSITIVE_INFINITY;

            for (let i = 0; i < gameState.players.length; i++) {
                if (i !== gameState.currentPlayer) {
                    const distance =
                        Math.abs(gameState.players[i].position.x - currentPlayerObj.position.x) +
                        Math.abs(gameState.players[i].position.y - currentPlayerObj.position.y);

                    if (distance <= heroData.attackRange && distance < minDistance) {
                        targetIndex = i;
                        minDistance = distance;
                    }
                }
            }

            if (targetIndex === -1) {
                addLogEntry("Aucune cible valide pour la double attaque !", "system");
                return;
            }

            const targetPlayerObj = gameState.players[targetIndex];

            // Première attaque
            const diceResult1 = rollDice();
            let damage1 = 0;

            if (diceResult1 <= 2) {
                addLogEntry(`Première attaque : échec !`, `player${gameState.currentPlayer + 1}`);
            } else {
                damage1 = heroData.attackDamage.quick;
                if (diceResult1 === 6) {
                    damage1 *= 2;
                    addLogEntry(
                        `Première attaque : coup critique ! ${damage1} dégâts à ${gameState.playerNames[targetIndex]} !`,
                        `player${gameState.currentPlayer + 1}`,
                    );
                    gameState.stats.totalCrits++;
                } else {
                    addLogEntry(
                        `Première attaque : ${damage1} dégâts à ${gameState.playerNames[targetIndex]} !`,
                        `player${gameState.currentPlayer + 1}`,
                    );
                }

                // Check if target is defending
                if (targetPlayerObj.isDefending) {
                    const originalDamage = damage1;
                    damage1 *= (1 - DEFENSE_REDUCTION);
                    addLogEntry(
                        `${gameState.playerNames[targetIndex]} est en position défensive et réduit les dégâts de ${Math.round(originalDamage - damage1)} !`,
                        `player${targetIndex + 1}`,
                    );
                }

                targetPlayerObj.health = Math.max(0, targetPlayerObj.health - damage1);
                gameState.stats.totalDamage += damage1;
            }

            // Vérifier si la cible est vaincue
            if (targetPlayerObj.health <= 0) {
                addLogEntry(`${gameState.playerNames[targetIndex]} est vaincu !`, "system");

                // Supprimer le joueur vaincu
                gameState.players.splice(targetIndex, 1);

                // Ajuster l'index du joueur actuel si nécessaire
                if (targetIndex < gameState.currentPlayer) {
                    gameState.currentPlayer--;
                }

                // Vérifier s'il ne reste qu'un seul joueur
                if (gameState.players.length === 1) {
                    endGame(0); // Le dernier joueur restant est le vainqueur
                    return;
                }
            } else {
                // Deuxième attaque (seulement si la cible est encore en vie)
                const diceResult2 = rollDice();
                let damage2 = 0;

                if (diceResult2 <= 2) {
                    addLogEntry(`Deuxième attaque : échec !`, `player${gameState.currentPlayer + 1}`);
                } else {
                    damage2 = heroData.attackDamage.quick;
                    if (diceResult2 === 6) {
                        damage2 *= 2;
                        addLogEntry(
                            `Deuxième attaque : coup critique ! ${damage2} dégâts à ${gameState.playerNames[targetIndex]} !`,
                            `player${gameState.currentPlayer + 1}`,
                        );
                        gameState.stats.totalCrits++;
                    } else {
                        addLogEntry(
                            `Deuxième attaque : ${damage2} dégâts à ${gameState.playerNames[targetIndex]} !`,
                            `player${gameState.currentPlayer + 1}`,
                        );
                    }

                    // Check if target is defending
                    if (targetPlayerObj.isDefending) {
                        const originalDamage = damage2;
                        damage2 *= (1 - DEFENSE_REDUCTION);
                        addLogEntry(
                            `${gameState.playerNames[targetIndex]} est en position défensive et réduit les dégâts de ${Math.round(originalDamage - damage2)} !`,
                            `player${targetIndex + 1}`,
                        );
                    }

                    targetPlayerObj.health = Math.max(0, targetPlayerObj.health - damage2);
                    gameState.stats.totalDamage += damage2;
                }

                // Vérifier si la cible est vaincue après la deuxième attaque
                if (targetPlayerObj.health <= 0) {
                    addLogEntry(`${gameState.playerNames[targetIndex]} est vaincu !`, "system");

                    // Supprimer le joueur vaincu
                    gameState.players.splice(targetIndex, 1);

                    // Ajuster l'index du joueur actuel si nécessaire
                    if (targetIndex < gameState.currentPlayer) {
                        gameState.currentPlayer--;
                    }

                    // Vérifier s'il ne reste qu'un seul joueur
                    if (gameState.players.length === 1) {
                        endGame(0); // Le dernier joueur restant est le vainqueur
                        return;
                    }
                }
            }

            gameState.stats.totalAttacks += 2;
            break;

        case "sorciere":
            // Tempête magique : attaque tous les ennemis dans un rayon de 2 cases
            addLogEntry(
                `${gameState.playerNames[gameState.currentPlayer]} utilise Tempête magique !`,
                `player${gameState.currentPlayer + 1}`,
            );

            const playerX = currentPlayerObj.position.x;
            const playerY = currentPlayerObj.position.y;
            let targetsHit = 0;

            // Parcourir tous les joueurs
            for (let i = 0; i < gameState.players.length; i++) {
                if (i !== gameState.currentPlayer) {
                    const distance =
                        Math.abs(gameState.players[i].position.x - playerX) + Math.abs(gameState.players[i].position.y - playerY);

                    // La tempête magique touche tous les ennemis dans un rayon de 2 cases
                    if (distance <= 2) {
                        const diceResult = rollDice();
                        let damage = heroData.attackDamage.heavy;

                        if (diceResult <= 2) {
                            addLogEntry(`La tempête magique échoue contre ${gameState.playerNames[i]} !`, `player${gameState.currentPlayer + 1}`);
                        } else {
                            if (diceResult === 6) {
                                damage *= 2;
                                addLogEntry(
                                    `Tempête magique critique ! ${damage} dégâts à ${gameState.playerNames[i]} !`,
                                    `player${gameState.currentPlayer + 1}`,
                                );
                                gameState.stats.totalCrits++;
                            } else {
                                addLogEntry(
                                    `Tempête magique inflige ${damage} dégâts à ${gameState.playerNames[i]} !`,
                                    `player${gameState.currentPlayer + 1}`,
                                );
                            }

                            // Check if target is defending
                            if (gameState.players[i].isDefending) {
                                const originalDamage = damage;
                                damage *= (1 - DEFENSE_REDUCTION);
                                addLogEntry(
                                    `${gameState.playerNames[i]} est en position défensive et réduit les dégâts de ${Math.round(originalDamage - damage)} !`,
                                    `player${i + 1}`,
                                );
                            }

                            gameState.players[i].health = Math.max(0, gameState.players[i].health - damage);
                            gameState.stats.totalDamage += damage;
                            targetsHit++;
                        }

                        gameState.stats.totalAttacks++;
                    }
                }
            }

            if (targetsHit === 0) {
                addLogEntry(`Aucun ennemi n'a été touché par la tempête magique !`, `player${gameState.currentPlayer + 1}`);
            }

            // Vérifier si des joueurs ont été vaincus
            for (let i = gameState.players.length - 1; i >= 0; i--) {
                if (i !== gameState.currentPlayer && gameState.players[i].health <= 0) {
                    addLogEntry(`${gameState.playerNames[i]} est vaincu !`, "system");

                    // Supprimer le joueur vaincu
                    gameState.players.splice(i, 1);

                    // Ajuster l'index du joueur actuel si nécessaire
                    if (i < gameState.currentPlayer) {
                        gameState.currentPlayer--;
                    }
                }
            }

            // Vérifier s'il ne reste qu'un seul joueur
            if (gameState.players.length === 1) {
                endGame(0); // Le dernier joueur restant est le vainqueur
                return;
            }
            break;
    }

    // Mettre le pouvoir en recharge
    currentPlayerObj.powerCooldown = heroData.specialPower.cooldown;

    // End turn after using special power
    endTurn();

    // Mettre à jour l'affichage
    updateGameDisplay();
}

// Se défendre
function defend() {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];

    // Set the defending flag and duration
    currentPlayerObj.isDefending = true;
    currentPlayerObj.defendingTurnsLeft = 1; // Defense lasts until the start of their next turn

    addLogEntry(
        `${gameState.playerNames[gameState.currentPlayer]} se met en position défensive ! (Dégâts réduits de 50% jusqu'au prochain tour)`,
        `player${gameState.currentPlayer + 1}`,
    );

    endTurn();
    // Mettre à jour l'affichage
    updateGameDisplay();
}

// Lancer le dé
function rollDice() {
    const result = Math.floor(Math.random() * 6) + 1;

    // Animer le dé
    const dice = document.getElementById("dice");
    dice.classList.add("rolling");
    setTimeout(() => {
        dice.classList.remove("rolling");
        dice.querySelector(".dice-face").textContent = result;
    }, 500);

    return result;
}

// Terminer le tour
function endTurn() {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const heroData = HEROES[currentPlayerObj.hero];

    // Regenerate charge each turn
    currentPlayerObj.charge = Math.min(heroData.maxCharge, currentPlayerObj.charge + heroData.chargePerTurn);
    addLogEntry(
        `${gameState.playerNames[gameState.currentPlayer]} récupère ${heroData.chargePerTurn} points de charge`,
        `player${gameState.currentPlayer + 1}`,
    );

    // Réduire la durée des effets actifs
    gameState.players.forEach((player) => {
        player.effects = player.effects.filter((effect) => {
            effect.duration--;
            return effect.duration > 0;
        });

        // Réduire le temps de recharge du pouvoir spécial
        if (player.powerCooldown > 0) {
            player.powerCooldown--;
        }
    });

    // Passer au joueur suivant
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;

    // Si on revient au joueur 0, incrémenter le compteur de tours
    if (gameState.currentPlayer === 0) {
        gameState.turn++;
        gameState.stats.totalTurns++;
    }

    // Handle defense duration for the new current player
    const newCurrentPlayer = gameState.players[gameState.currentPlayer];
    if (newCurrentPlayer.isDefending) {
        newCurrentPlayer.defendingTurnsLeft--;
        if (newCurrentPlayer.defendingTurnsLeft <= 0) {
            newCurrentPlayer.isDefending = false;
            addLogEntry(
                `${gameState.playerNames[gameState.currentPlayer]} n'est plus en position défensive.`,
                `player${gameState.currentPlayer + 1}`,
            );
        }
    }

    // Mettre à jour l'affichage
    updateGameDisplay();

    addLogEntry(`Tour ${gameState.turn}, ${gameState.playerNames[gameState.currentPlayer]}`, "system");
}

// Gestion des clics sur les cases
function handleCellClick(x, y) {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];

    if (gameState.gameMode === "attack") {
        // Vérifier si la case cliquée contient un ennemi
        for (let i = 0; i < gameState.players.length; i++) {
            if (
                i !== gameState.currentPlayer &&
                gameState.players[i].position.x === x &&
                gameState.players[i].position.y === y
            ) {
                // Afficher les options d'attaque
                showAttackControls();

                return;
            }
        }
    } else if (gameState.gameMode === "movement") {
        // Vérifier si la case est dans la portée de mouvement
        const distance = Math.abs(x - currentPlayerObj.position.x) + Math.abs(y - currentPlayerObj.position.y);
        if (distance <= HEROES[currentPlayerObj.hero].moveRange && distance > 0) {
            // Vérifier si la case est vide
            let isEmpty = true;
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].position.x === x && gameState.players[i].position.y === y) {
                    isEmpty = false;
                    break;
                }
            }

            if (isEmpty) {
                // Déplacer le joueur
                currentPlayerObj.position.x = x;
                currentPlayerObj.position.y = y;
                addLogEntry(
                    `${gameState.playerNames[gameState.currentPlayer]} se déplace en (${x}, ${y})`,
                    `player${gameState.currentPlayer + 1}`,
                );
                endTurn();
                updateGameDisplay();
            }
        }
    }
}

// End game function
function endGame(winnerIndex) {
    const winnerHeroName = HEROES[gameState.players[winnerIndex].hero].name;

    // Mettre à jour l'écran de fin
    document.getElementById("winner-hero").textContent = winnerHeroName;
    document.getElementById("total-turns").textContent = gameState.stats.totalTurns;
    document.getElementById("total-attacks").textContent = gameState.stats.totalAttacks;
    document.getElementById("total-damage").textContent = gameState.stats.totalDamage;
    document.getElementById("total-crits").textContent = gameState.stats.totalCrits;

    // Afficher l'écran de fin
    setTimeout(() => {
        changeScreen("end");
    }, 1000);

    addLogEntry(`Fin de la partie ! ${winnerHeroName} est victorieux !`, "system");
}
function resetGame() {
    gameState = {
        currentScreen: "start",
        playerCount: 2,
        currentPlayerSelection: 0,
        selectedHeroes: [],
        players: [],
        currentPlayer: 0,
        turn: 1,
        gameMode: "movement",
        gameLog: [],
        stats: {
            totalTurns: 0,
            totalAttacks: 0,
            totalDamage: 0,
            totalCrits: 0,
        },
    };

    // Vider le journal de combat
    document.getElementById("log-entries").innerHTML = "";

    // Réinitialiser les sélections
    const heroCards = document.querySelectorAll(".hero-card");
    heroCards.forEach((card) => card.classList.remove("selected"));

    const countOptions = document.querySelectorAll(".count-option");
    countOptions.forEach((option) => option.classList.remove("selected"));
    countOptions[0].classList.add("selected"); // Sélectionner 2 joueurs par défaut

    // Désactiver le bouton de démarrage de bataille
    document.getElementById("start-battle").disabled = true;
}
// Ajouter une entrée au journal de combat
function addLogEntry(message, type) {
    const logEntries = document.getElementById("log-entries");
    const gameLog = document.getElementById("game-log");
    const entry = document.createElement("div");
    entry.classList.add("log-entry", type);
    entry.textContent = message;

    logEntries.appendChild(entry);
    gameLog.scrollTop = gameLog.scrollHeight;
}

// Initialize the game when the DOM is fully loaded
window.onload = () => {
    initGame();
};


// Add this CSS to the document for defense visual indicator
document.head.insertAdjacentHTML('beforeend', `
<style>
.hero-token.defending {
    box-shadow: 0 0 10px 3px rgba(255, 255, 255, 0.7);
}
.shield-overlay {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #4361ee;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}
</style>
`);