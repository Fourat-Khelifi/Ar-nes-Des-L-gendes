import {screens} from "./config.js";
import {gameState} from "./script.js";

export function changeScreen(screenName) {
    Object.keys(screens).forEach((key) => {
        screens[key].classList.remove("active");
    });
    screens[screenName].classList.add("active");
    gameState.currentScreen = screenName;
}
export function manageScreens() {
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
}
export function updateHeroSelectionScreen() {
    // Mettre à jour le texte du joueur actuel
    const currentPlayerSelectionText = document.getElementById("current-player-selection");
    if (gameState.currentPlayerSelection < gameState.playerCount) {
        currentPlayerSelectionText.textContent = `${gameState.playerNames[gameState.currentPlayerSelection]}, choisissez votre héros`;
    } else {
        currentPlayerSelectionText.textContent = "Tous les joueurs ont choisi leur héros";
    }
}