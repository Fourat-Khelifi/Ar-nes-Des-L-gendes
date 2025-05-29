import {GRID_SIZE, HEROES, STARTING_POSITIONS} from "./config.js";
import {gameState} from "./script.js";
import {updateHeroSelectionScreen} from "./ScreenManager.js";
import {handleCellClick, hasValidAttackTargets} from "./GameManager.js";

export function createBackgroundElements() {
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
/* Initialiser les cartes de jeu */
export function initGameCards() {
    // Créer des cartes de héros pour le conteneur de cartes
    displayCardImage('card-container', HEROES.chevalier);
    displayCardImage('card-container', HEROES.ninja);
    displayCardImage('card-container', HEROES.sorciere);
    displayCardImage('card-container', HEROES.gardien);
}
export function displayCardImage(containerClass, hero) {
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
export function createHeroSelectionCards() {
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
export function showMessagePopup(message, duration = 2000) {
    return new Promise((resolve) => {
        const popup = document.createElement('div');
        popup.className = 'start-popup';
        popup.innerHTML = `
            <h2>${message}</h2>
        `;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
            resolve();
        }, duration);
    });
}

// Fonction pour afficher l'animation du dé
export function showDiceAnimation(result) {
    return new Promise((resolve) => {
        const dice = document.createElement('div');
        dice.className = 'dice-animation';
        dice.textContent = result;
        document.body.appendChild(dice);

        setTimeout(() => {
            dice.remove();
            resolve();
        }, 1000);
    });
}

// Fonction pour afficher le popup de début de partie
export function showStartPopup(playerName) {
    return new Promise((resolve) => {
        const popup = document.createElement('div');
        popup.className = 'start-popup';
        popup.innerHTML = `
            <h2>La Bataille Commence !</h2>
            <p>Le premier joueur est :</p>
            <div class="player-name">${playerName}</div>
        `;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
            resolve();
        }, 3000);
    });
}
export function initializeMysteryCells() {
    gameState.mysteryCells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const isStartingPosition = STARTING_POSITIONS[gameState.playerCount].some(
                pos => pos.x === x && pos.y === y
            );

            const playerOnStart = gameState.players.some(p => p.position.x === x && p.position.y === y);

            if (!isStartingPosition && !playerOnStart && Math.random() < 0.3) {
                gameState.mysteryCells.push({ x, y });
            }
        }
    }
}

export function createArena() {
    const arena = document.getElementById("arena");
    arena.innerHTML = "";

    // Créer la grille
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Vérifier si c'est une position de départ
            const isStartingPosition = STARTING_POSITIONS[gameState.playerCount].some(
                pos => pos.x === x && pos.y === y
            );

            // Vérifier si un joueur est sur cette case
            let playerOnCell = false;
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].position.x === x && gameState.players[i].position.y === y) {
                    playerOnCell = true;
                    break;
                }
            }

            const isMystery = gameState.mysteryCells.some(pos => pos.x === x && pos.y === y);

            if (isMystery && !playerOnCell) {
                cell.classList.add("question-mark");
                cell.dataset.isMystery = "true";
                cell.innerHTML = '<div class="mystery-icon">?</div>';
            }

            // Afficher le pion du joueur si présent (et effacer le ?)
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].position.x === x && gameState.players[i].position.y === y) {
                    cell.innerHTML = '';
                    const heroToken = document.createElement("div");
                    heroToken.classList.add("hero-token", gameState.players[i].hero);
                    if (gameState.players[i].isDefending) {
                        heroToken.classList.add("defending");
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

            cell.addEventListener("click", () => handleCellClick(x, y));
            arena.appendChild(cell);
        }
    }
}
export function updateGameDisplay() {
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
// Afficher les contrôles d'attaque
export function showAttackControls() {
    document.getElementById("attack-controls").classList.remove("hidden");
    //document.getElementById("movement-controls").classList.add("hidden");

    // Mettre en évidence les cases où le joueur peut attaquer
    highlightAttackRange();
}

// Cacher les contrôles d'attaque
export function hideAttackControls() {
    document.getElementById("attack-controls").classList.add("hidden");
}

// Mettre en évidence la portée de mouvement
export function highlightMoveRange() {
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
export function highlightAttackRange() {
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
export function clearHighlights() {
    const highlightedCells = document.querySelectorAll(".cell.highlight, .cell.attack-range");
    highlightedCells.forEach((cell) => {
        cell.classList.remove("highlight", "attack-range");
    });
}
export function showInfoPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'info-popup';
    popup.innerHTML = `<div class="info-popup-content">${message}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('info-popup-hide');
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}