import {GRID_SIZE,HEROES,screens,STARTING_POSITIONS,DEFENSE_REDUCTION} from "./config.js";
import {initGame} from "./GameManager.js";

export let gameState = {
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
export function setGameState(gs){
    gameState = gs;
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

// Ajout de la fonction pour afficher le popup de confirmation
function showQuitConfirmation() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        const popup = document.createElement('div');
        popup.className = 'quit-popup';
        popup.innerHTML = `
            <h2>Quitter la partie ?</h2>
            <p>Êtes-vous sûr de vouloir quitter la partie en cours ?</p>
            <div class="quit-popup-buttons">
                <button class="btn btn-cancel">Annuler</button>
                <button class="btn btn-confirm">Quitter</button>
            </div>
        `;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        popup.querySelector('.btn-cancel').onclick = () => {
            overlay.remove();
            resolve(false);
        };
        popup.querySelector('.btn-confirm').onclick = () => {
            overlay.remove();
            resolve(true);
        };
    });
}

// Ajout du bouton dans l'interface de jeu après le chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader && !document.getElementById('quit-game-btn')) {
        const quitBtn = document.createElement('button');
        quitBtn.id = 'quit-game-btn';
        quitBtn.className = 'btn secondary-btn';
        quitBtn.textContent = 'Quitter la partie';
        quitBtn.style.marginLeft = '1rem';
        quitBtn.onclick = async () => {
            const confirm = await showQuitConfirmation();
            if (confirm) {
                resetGame();
                changeScreen('start');
            }
        };
        gameHeader.appendChild(quitBtn);
    }
});
