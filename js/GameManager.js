import {DEFENSE_REDUCTION, HEROES, STARTING_POSITIONS} from "./config.js";
import {
    createArena,
    createBackgroundElements, createHeroSelectionCards, hideAttackControls, highlightAttackRange, highlightMoveRange,
    initGameCards, initializeMysteryCells, showAttackControls, showDiceAnimation, showInfoPopup,
    showMessagePopup,
    showStartPopup,
    updateGameDisplay
} from "./UIManager.js";
import {changeScreen, manageScreens, updateHeroSelectionScreen} from "./ScreenManager.js";
import {gameState, setGameState} from "./script.js";

export function initGame(){
    createBackgroundElements();
    manageScreens();

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

    const playerNameFieldsInput = document.querySelectorAll(".player-name-field input");
    playerNameFieldsInput.forEach((input) => {
        input.addEventListener("input", checkPlayerNamesFilled);
    });
    // Appel initial
    checkPlayerNamesFilled();

    document.getElementById("confirm-player-count").addEventListener("click", () => {
        // Vérifier que tous les noms sont remplis
        let missing = [];
        for (let i = 1; i <= gameState.playerCount; i++) {
            const nameInput = document.getElementById(`player${i}-name`);
            if (!nameInput.value.trim()) {
                missing.push(`Joueur ${i}`);
            }
        }
        if (missing.length > 0) {
            showInfoPopup(`Vous devez ajouter le nom pour :<br>${missing.join('<br>')}`);
            return;
        }
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
    document.getElementById("start-battle").addEventListener("click", async () => {
        // Changer d'écran d'abord
        changeScreen("game");

        // Puis initialiser le jeu
        await setupGame();
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
async function determineFirstPlayer() {
    const diceResults = [];
    const playerNames = [];

    // Afficher le message initial
    await showMessagePopup("Chaque joueur va lancer un dé");

    // Chaque joueur lance un dé
    for (let i = 0; i < gameState.playerCount; i++) {
        await showMessagePopup(`${gameState.playerNames[i]}, lancez le dé !`);
        const result = rollDice();
        diceResults.push(result);
        playerNames.push(gameState.playerNames[i]);

        // Afficher l'animation du dé
        await showDiceAnimation(result);
        addLogEntry(`${gameState.playerNames[i]} lance un ${result}`, "system");
    }

    // Trouver le joueur avec le plus grand résultat
    let maxResult = Math.max(...diceResults);
    let firstPlayerIndex = diceResults.indexOf(maxResult);

    // En cas d'égalité, relancer entre les joueurs à égalité
    const tiedPlayers = diceResults.reduce((acc, result, index) => {
        if (result === maxResult) acc.push(index);
        return acc;
    }, []);

    if (tiedPlayers.length > 1) {
        await showMessagePopup("Égalité ! Les joueurs concernés relancent le dé.");
        const newResults = [];
        for (let index of tiedPlayers) {
            await showMessagePopup(`${gameState.playerNames[index]}, relancez le dé !`);
            const result = rollDice();
            newResults.push({index, result});

            // Afficher l'animation du dé pour le relancement
            await showDiceAnimation(result);
            addLogEntry(`${gameState.playerNames[index]} lance un ${result}`, "system");
        }

        // Trouver le nouveau gagnant
        const newMaxResult = Math.max(...newResults.map(r => r.result));
        firstPlayerIndex = newResults.find(r => r.result === newMaxResult).index;
    }

    // Afficher le popup de début de partie
    await showStartPopup(gameState.playerNames[firstPlayerIndex]);

    addLogEntry(`${gameState.playerNames[firstPlayerIndex]} commence la partie !`, "system");
    return firstPlayerIndex;
}

async function setupGame() {
    // Initialiser les joueurs
    gameState.players = [];

    for (let i = 0; i < gameState.playerCount; i++) {
        const heroType = gameState.selectedHeroes.find((hero) => hero.player === i).type;
        const heroData = HEROES[heroType];
        const position = STARTING_POSITIONS[gameState.playerCount][i];

        gameState.players.push({
            name: gameState.playerNames[i],
            hero: heroType,
            position: { ...position },
            health: heroData.health,
            charge: heroData.maxCharge,
            powerCooldown: 0,
            effects: [],
            isDefending: false,
            defendingTurnsLeft: 0,
            bonusDamage: 0
        });
    }

    // Réinitialiser les statistiques
    gameState.stats = {
        totalTurns: 0,
        totalAttacks: 0,
        totalDamage: 0,
        totalCrits: 0,
    };

    // Réinitialiser le tour
    gameState.turn = 1;
    initializeMysteryCells();
    // Créer la grille de l'arène
    createArena();

    // Vider le journal de combat
    const logEntries = document.getElementById("log-entries");
    logEntries.innerHTML = "";

    // Add game start messages
    addLogEntry("La bataille commence !", "system");
    addLogEntry("Utilisez la défense pour réduire les dégâts de 50% jusqu'à votre prochain tour.", "system");

    // Déterminer le premier joueur
    gameState.currentPlayer = await determineFirstPlayer();

    // Mettre à jour l'affichage
    updateGameDisplay();
}
export function revealMystery(cell) {
    const isBonus = Math.random() < 0.6; // 60% de chance d'être un bonus
    let result;

    // Ajout du nouveau bonus 'extraTurn'
    const bonusTypes = ['health', 'charge', 'power', 'extraTurn'];
    if (isBonus) {
        const randomType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        if (randomType === 'health') {
            result = {
                type: 'bonus',
                icon: '❤️',
                effect: 20,
                name: 'Potion de vie',
                bonusType: 'health'
            };
        } else if (randomType === 'charge') {
            result = {
                type: 'bonus',
                icon: '⚡',
                effect: 30,
                name: 'Énergie',
                bonusType: 'charge'
            };
        } else if (randomType === 'power') {
            result = {
                type: 'bonus',
                icon: '✨',
                effect: 1,
                name: 'Pouvoir',
                bonusType: 'power'
            };
        } else if (randomType === 'extraTurn') {
            result = {
                type: 'bonus',
                icon: '🔁',
                effect: 0,
                name: 'Tour supplémentaire',
                bonusType: 'extraTurn'
            };
        }
    } else {
        const obstacleTypes = ['rock', 'tree', 'trap'];
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        result = {
            type: 'obstacle',
            icon: randomType === 'rock' ? '🪨' : randomType === 'tree' ? '🌳' : '⚠️',
            damage: randomType === 'rock' ? 5 : randomType === 'tree' ? 3 : 15,
            name: randomType === 'rock' ? 'Rocher' : randomType === 'tree' ? 'Arbre' : 'Piège'
        };
    }

    // Afficher le popup de révélation initial
    const popup = document.createElement('div');
    popup.className = 'mystery-reveal';
    popup.innerHTML = `
        <div class="mystery-icon">${result.icon}</div>
        <div class="mystery-name">${result.name}</div>
        ${result.type === 'bonus'
        ? `<div class="mystery-effect">${result.bonusType === 'extraTurn' ? 'Rejoue immédiatement !' : '+' + result.effect + (result.name === 'Potion de vie' ? ' PV' : result.name === 'Énergie' ? ' Charge' : result.name === 'Pouvoir' ? ' Tour de recharge' : '')}</div>`
        : `<div class="mystery-damage">-${result.damage} PV</div>`
    }
        <div class="mystery-type">${result.type === 'bonus' ? '🎁 Bonus !' : '💥 Obstacle !'}</div>
    `;
    cell.appendChild(popup);

    setTimeout(() => {
        const cardPopup = document.createElement('div');
        cardPopup.className = 'card-popup';
        cardPopup.innerHTML = `
            <div class="card-header">
                <div class="card-title">${result.type === 'bonus' ? '🎁 Bonus Découvert !' : '💥 Obstacle Rencontré !'}</div>
            </div>
            <div class="card-content">
                <div class="card-icon">${result.icon}</div>
                <div class="card-name">${result.name}</div>
                ${result.type === 'bonus'
            ? `<div class="card-effect">${result.bonusType === 'extraTurn' ? 'Tu gagnes un tour supplémentaire !' : 'Vous avez obtenu : +' + result.effect + (result.name === 'Potion de vie' ? ' Points de Vie' : result.name === 'Énergie' ? ' Points de Charge' : ' Tours de Recharge')}</div>`
            : `<div class="card-damage">Vous avez subi : -${result.damage} Points de Vie</div>`
        }
                <div class="card-description">
                    ${result.type === 'bonus'
            ? (result.bonusType === 'extraTurn' ? 'Bravo ! Tu peux rejouer immédiatement.' : 'Un bonus bienvenu pour renforcer votre héros !')
            : 'Un obstacle dangereux qui vous a affaibli !'
        }
                </div>
            </div>
            <div class="card-footer">
                <button class="card-close-btn">Continuer</button>
            </div>
        `;
        document.body.appendChild(cardPopup);

        // Appliquer l'effet APRÈS le popup, pour voir l'animation
        const currentPlayer = gameState.players[gameState.currentPlayer];
        let barSelector = null;
        let animClass = null;
        let joueurElimine = false;
        if (result.type === 'bonus') {
            if (result.bonusType === 'health') {
                currentPlayer.health = Math.min(HEROES[currentPlayer.hero].health, currentPlayer.health + result.effect);
                animClass = 'bar-anim-green';
                barSelector = '#health-fill';
                addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} récupère ${result.effect} points de vie !`, `player${gameState.currentPlayer + 1}`);
            } else if (result.bonusType === 'charge') {
                currentPlayer.charge = Math.min(HEROES[currentPlayer.hero].maxCharge, currentPlayer.charge + result.effect);
                animClass = 'bar-anim-green';
                barSelector = '#charge-fill';
                addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} récupère ${result.effect} points de charge !`, `player${gameState.currentPlayer + 1}`);
            } else if (result.bonusType === 'power') {
                currentPlayer.powerCooldown = Math.max(0, currentPlayer.powerCooldown - result.effect);
                animClass = 'bar-anim-green';
                barSelector = '#charge-fill';
                addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} réduit le temps de recharge de son pouvoir spécial !`, `player${gameState.currentPlayer + 1}`);
            } else if (result.bonusType === 'extraTurn') {
                // Bonus tour supplémentaire : rien à faire ici, le joueur rejoue
                animClass = 'bar-anim-green';
                barSelector = '#charge-fill';
                addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} gagne un tour supplémentaire !`, `player${gameState.currentPlayer + 1}`);
            }
        } else {
            currentPlayer.health = Math.max(0, currentPlayer.health - result.damage);
            animClass = 'bar-anim-red';
            barSelector = '#health-fill';
            addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} subit ${result.damage} dégâts du ${result.name} !`, `player${gameState.currentPlayer + 1}`);
            if (currentPlayer.health <= 0) {
                joueurElimine = true;
            }
        }

        // Supprimer le point d'interrogation
        cell.classList.remove("question-mark");
        cell.dataset.isMystery = "false";
        cell.innerHTML = '';

        // Animation et update après fermeture du popup
        const closeBtn = cardPopup.querySelector('.card-close-btn');
        closeBtn.addEventListener('click', () => {
            cardPopup.remove();
            updateGameDisplay();
            if (barSelector && animClass) {
                const bar = document.querySelector(barSelector);
                if (bar) {
                    bar.classList.add(animClass);
                    setTimeout(() => {
                        bar.classList.remove(animClass);
                        // Si le joueur est éliminé, le retirer et ajuster l'index
                        if (joueurElimine) {
                            addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} est vaincu par ${result.name} !`, 'system');
                            gameState.players.splice(gameState.currentPlayer, 1);
                            if (gameState.currentPlayer >= gameState.players.length) {
                                gameState.currentPlayer = 0;
                            }
                            updateGameDisplay();
                        }
                        // Si c'est un bonus extraTurn, ne pas appeler endTurn (le joueur rejoue)
                        if (!(result.type === 'bonus' && result.bonusType === 'extraTurn')) {
                            endTurn();
                        } else {
                            //showInfoPopup('Bravo ! Tu gagnes un tour supplémentaire !');
                        }
                    }, 700);
                } else {
                    if (joueurElimine) {
                        addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} est vaincu par ${result.name} !`, 'system');
                        gameState.players.splice(gameState.currentPlayer, 1);
                        if (gameState.currentPlayer >= gameState.players.length) {
                            gameState.currentPlayer = 0;
                        }
                        updateGameDisplay();
                    }
                    if (!(result.type === 'bonus' && result.bonusType === 'extraTurn')) {
                        endTurn();
                    } else {
                        showInfoPopup('Bravo ! Tu gagnes un tour supplémentaire !');
                    }
                }
            } else {
                if (joueurElimine) {
                    addLogEntry(`${gameState.playerNames[gameState.currentPlayer]} est vaincu par ${result.name} !`, 'system');
                    gameState.players.splice(gameState.currentPlayer, 1);
                    if (gameState.currentPlayer >= gameState.players.length) {
                        gameState.currentPlayer = 0;
                    }
                    updateGameDisplay();
                }
                if (!(result.type === 'bonus' && result.bonusType === 'extraTurn')) {
                    endTurn();
                } else {
                    showInfoPopup('Bravo ! Tu gagnes un tour supplémentaire !');
                }
            }
        });
    }, 5000);

    // Supprimer l'animation initiale après 1 seconde
    setTimeout(() => {
        popup.remove();
    }, 5000);
}
// Modifier la fonction handleCellClick pour gérer les mystères
export function handleCellClick(x, y) {
    const currentPlayerObj = gameState.players[gameState.currentPlayer];
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

    if (gameState.gameMode === "movement") {
        const distance = Math.abs(x - currentPlayerObj.position.x) + Math.abs(y - currentPlayerObj.position.y);
        if (distance <= HEROES[currentPlayerObj.hero].moveRange && distance > 0) {
            let canMove = true;

            // Vérifier si la case contient un autre joueur
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].position.x === x && gameState.players[i].position.y === y) {
                    canMove = false;
                    break;
                }
            }

            if (canMove) {
                // Déplacer le joueur
                currentPlayerObj.position.x = x;
                currentPlayerObj.position.y = y;
                addLogEntry(
                    `${gameState.playerNames[gameState.currentPlayer]} se déplace en (${x}, ${y})`,
                    `player${gameState.currentPlayer + 1}`
                );

                // Vérifier si la case contient un mystère
                if (cell.dataset.isMystery === "true") {
                    const x = parseInt(cell.dataset.x, 10);
                    const y = parseInt(cell.dataset.y, 10);

                    gameState.mysteryCells = gameState.mysteryCells.filter(
                        mystery => mystery.x !== x || mystery.y !== y
                    );
                    revealMystery(cell);
                    return;
                }

                endTurn();
                updateGameDisplay();
            }
        }
    } else if (gameState.gameMode === "attack") {
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
    }
}
// Check if the current player has valid attack targets
export function hasValidAttackTargets() {
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
export function setGameMode(mode) {
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
export function attackEnemy(attackType) {
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
        let damage = heroData.attackDamage[attackType] + (currentPlayerObj.bonusDamage || 0);

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
export function useSpecialPower() {
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
export function defend() {
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
export function rollDice() {
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
export function endTurn() {
    // Si plus qu'un joueur, continuer
    if (gameState.players.length <= 1) {
        if (gameState.players.length === 1) {
            endGame(0);
        }
        return;
    }

    // Sécuriser l'index du joueur courant
    if (gameState.currentPlayer >= gameState.players.length) {
        gameState.currentPlayer = 0;
    }

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

    // Sécurité supplémentaire : si l'index dépasse, revenir à 0
    if (gameState.currentPlayer >= gameState.players.length) {
        gameState.currentPlayer = 0;
    }

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
    addLogEntry(`Tour ${gameState.turn}, joueur courant : ${gameState.playerNames[gameState.currentPlayer]} (index ${gameState.currentPlayer})`, "system");
}

// End game function
export function endGame(winnerIndex) {
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
export function resetGame() {
    let gs = {
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
    setGameState(gs);
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
export function addLogEntry(message, type) {
    const logEntries = document.getElementById("log-entries");
    const gameLog = document.getElementById("game-log");
    const entry = document.createElement("div");
    entry.classList.add("log-entry", type);
    entry.textContent = message;

    logEntries.appendChild(entry);
    gameLog.scrollTop = gameLog.scrollHeight;
}
// Ajout dans initGame pour la validation des noms
function checkPlayerNamesFilled() {
    let allFilled = true;
    for (let i = 1; i <= gameState.playerCount; i++) {
        const nameInput = document.getElementById(`player${i}-name`);
        if (!nameInput.value.trim()) {
            allFilled = false;
            break;
        }
    }
    document.getElementById("confirm-player-count").disabled = !allFilled;
}
