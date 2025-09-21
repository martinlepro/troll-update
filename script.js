let trollLevel = 0; // Le niveau de troll maximal actuellement activé
let progress = 0;
let degoulinantText = null;
let calculatorInitialized = false;
let morpionCells = [];
let popupCount = 0;
let activatedAlerts = new Set(); // Pour suivre les alertes déjà affichées (éviter les répétitions)

const fullscreenContainer = document.getElementById("fullscreen-container");
const mainTitle = document.getElementById("main-title");
const progressBarElement = document.getElementById("progress-bar");
const progressBar = document.getElementById("progress");
const status = document.getElementById("status");
const searchBar = document.getElementById("search-bar");
const morpionContainer = document.getElementById("morpion-container");
const popupContainer = document.getElementById("popup-container");
const errorSound = document.getElementById("error-sound");
const imageTroll = document.getElementById("image-troll");
const rickrollVideo = document.getElementById("rickroll-video");
const calculatorContainer = document.getElementById("calculator-container");
const calcDisplay = document.getElementById("calc-display");
const calcButtons = document.getElementById("calc-buttons");

// --- LOGIQUE POUR LE PLEIN ÉCRAN ET LES TOUCHES DE SORTIE ---
let isTrollActive = false; // Flag pour savoir si le troll est démarré

function requestFullscreenMode() {
    if (fullscreenContainer.requestFullscreen) {
        fullscreenContainer.requestFullscreen().catch(err => {
            console.warn("Échec de la demande de plein écran:", err);
            if (!isTrollActive) {
                startTrollMechanism();
            }
        });
    } else {
        console.warn("API Fullscreen non supportée par le navigateur.");
        if (!isTrollActive) {
            startTrollMechanism();
        }
    }
}

function exitFullscreenMode() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

function handleFullscreenChange() {
    if (!document.fullscreenElement && isTrollActive) {
        requestFullscreenMode();
    }
}

function handleGlobalKeyDown(event) {
    if (event.key === "Escape" && isTrollActive) {
        event.preventDefault();
        if (!document.fullscreenElement) {
             requestFullscreenMode();
        }
    }
}

function handleBeforeUnload(event) {
    if (isTrollActive) {
        event.returnValue = "Vous êtes sûr de vouloir quitter ? La mise à jour est en cours et cela pourrait endommager votre système.";
        return event.returnValue;
    }
}

// --- INITIALISATION DU TROLL AVEC INTERACTION ---
function initializeTrollStartInteraction() {
  mainTitle.style.display = 'none';
  progressBarElement.style.display = 'none';
  searchBar.style.display = 'none';
  searchBar.disabled = true;

  status.textContent = "Cliquez n'importe où pour démarrer la mise à jour.";
  status.style.cursor = 'pointer';

  document.addEventListener('click', handleInitialClick, { once: true });
  document.addEventListener('click', handleReEnterFullscreen); // Cet écouteur est toujours actif
}

function handleInitialClick() {
    status.style.cursor = 'default';
    mainTitle.style.display = 'block';
    progressBarElement.style.display = 'block';
    searchBar.style.display = 'block';

    requestFullscreenMode();
    startTrollMechanism();
}

function handleReEnterFullscreen() {
    if (isTrollActive && !document.fullscreenElement) {
        requestFullscreenMode();
    }
}

function startTrollMechanism() {
    if (isTrollActive) return;
    isTrollActive = true;

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    searchBar.disabled = true; // Reste désactivée pendant la progression initiale

    updateProgress();
}


// --- Fonctions de progression et d'activation des niveaux de troll ---

function updateProgress() {
  if (progress < 100) {
    progress += Math.random() * 5;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + "%";
    status.textContent = `Mise à jour en cours... ${Math.floor(progress)}%`;
    setTimeout(updateProgress, 300);
  } else {
    status.textContent = "Mise à jour terminée. Démarrage des services.";
    if (trollLevel === 0) {
      activateTrollEffects(1); // Active le niveau 1 après la progression initiale
    }
  }
}

// NOUVELLE FONCTION pour activer les effets d'un niveau spécifique
function activateTrollEffectForLevel(level) {
    // console.log(`Activating effect for level ${level}`); // Pour débug
    switch (level) {
        case 1:
            // Le statut et la barre de recherche sont gérés par le flux principal et en dehors du switch
            // searchBar.disabled est activé dans activateTrollEffects(1)
            break;
        case 2:
            status.textContent = "Mise à jour terminée - votre PC est infecté 😈";
            break;
        case 3:
            document.body.classList.add("cursor-pale");
            break;
        case 4:
            showDegoulinantText(); // Vérifie déjà si l'élément existe pour éviter les doublons
            break;
        case 5:
            playErrorSound(1); // Se déclenche une fois
            break;
        case 6:
            playErrorSound(5); // Se déclenche une fois
            break;
        case 7:
            showFakePopups(15); // Ajoute plus de popups de manière cumulative
            break;
        case 8:
            morpionContainer.style.display = "block";
            initMorpion(); // Réinitialise et re-crée le morpion
            break;
        case 9:
            // Les blagues de la barre de recherche sont gérées par handleSearchInput qui vérifie trollLevel >= 9
            break;
        case 10:
            rickrollVideo.style.display = "block";
            rickrollVideo.play();
            break;
        case 11:
            imageTroll.style.display = "block";
            break;
        case 12:
            if (!activatedAlerts.has(12)) { // S'assure que l'alerte ne se déclenche qu'une fois par niveau
                alert("Activation de troll.vbs - (faux script externe, ne fait rien en vrai)");
                activatedAlerts.add(12);
            }
            break;
        case 13:
            if (!activatedAlerts.has(13)) { // S'assure que l'alerte ne se déclenche qu'une fois par niveau
                alert("Installation de script au démarrage Windows (faux install.bat, juste pour le troll)");
                activatedAlerts.add(13);
            }
            break;
        case 14:
            enableCursorJitter(); // Vérifie déjà si l'intervalle est actif
            break;
        case 15:
            calculatorContainer.style.display = "block";
            initCalculator(); // Vérifie déjà si initialisée
            break;
    }
}


// MODIFIED: La fonction principale pour changer de niveau de troll
function activateTrollEffects(newLevel) {
  const parsedNewLevel = parseInt(newLevel);
  if (isNaN(parsedNewLevel) || parsedNewLevel < 0 || parsedNewLevel > 15) {
    console.warn("Tentative d'activer un niveau de troll invalide :", newLevel);
    return;
  }

  if (parsedNewLevel === trollLevel) return; // Si le niveau est le même, ne rien faire

  // Si le nouveau niveau est inférieur au niveau actuel (on redescend) ou si on va au niveau 0
  // On fait une réinitialisation complète, puis on active les niveaux de 1 à `parsedNewLevel`.
  if (parsedNewLevel < trollLevel || parsedNewLevel === 0) {
    resetAll();
    activatedAlerts.clear(); // Réinitialise le suivi des alertes pour qu'elles puissent être ré-affichées
    trollLevel = 0; // Réinitialise le niveau de troll avant de réactiver
  }

  // Active les effets de manière cumulative, du niveau précédent + 1 jusqu'au nouveau niveau.
  // Si un reset a été effectué (trollLevel est alors 0), cela active de 1 à parsedNewLevel.
  for (let i = trollLevel + 1; i <= parsedNewLevel; i++) {
    activateTrollEffectForLevel(i);
  }

  trollLevel = parsedNewLevel; // Met à jour le niveau de troll maximal actuellement actif

  // Gestion spécifique de l'état de la barre de recherche et du statut pour le niveau 1
  if (trollLevel >= 1) { // Une fois que le troll est au moins au niveau 1 (mise à jour finie)
      searchBar.disabled = false; // La barre de recherche est activée
      if (trollLevel === 1) { // Si c'est juste le niveau 1, un message neutre
          status.textContent = "Mise à jour terminée. Le système est en attente d'instructions.";
      }
      // Sinon, le status est géré par activateTrollEffectForLevel pour les niveaux supérieurs
  } else { // Si le niveau est 0 (ex: après un reset complet)
      searchBar.disabled = true;
  }
}

// Renomme la fonction pour plus de clarté
function startTrollLevel(n) {
  activateTrollEffects(n);
}

// MODIFIED: resetAll est maintenant plus complet et réinitialise tous les effets
function resetAll() {
  document.body.classList.remove("cursor-pale"); // Niveau 3

  morpionContainer.style.display = "none"; // Niveau 8
  const boardElement = document.getElementById("board");
  if (boardElement) boardElement.innerHTML = ''; // Nettoie le plateau de morpion
  morpionCells = []; // Réinitialise l'état logique du morpion

  popupContainer.innerHTML = ""; // Niveau 7
  popupCount = 0; // Réinitialise le compteur de popups

  imageTroll.style.display = "none"; // Niveau 11

  rickrollVideo.style.display = "none"; // Niveau 10
  rickrollVideo.pause();
  rickrollVideo.currentTime = 0;

  calculatorContainer.style.display = "none"; // Niveau 15

  if (degoulinantText) { // Niveau 4
    degoulinantText.remove();
    degoulinantText = null;
  }

  disableCursorJitter(); // Niveau 14

  // Réinitialise les éléments de l'interface utilisateur pour un état neutre
  mainTitle.style.display = 'block'; // S'assure que le titre est visible
  progressBarElement.style.display = 'block'; // S'assure que la barre de progression est visible
  progressBar.style.width = '0%'; // Réinitialise la barre de progression
  progress = 0; // Réinitialise le compteur de progression

  searchBar.style.display = 'block'; // S'assure que la barre de recherche est visible
  searchBar.disabled = true; // La barre de recherche est désactivée après un reset
  searchBar.value = ''; // Efface le contenu de la barre de recherche

  status.textContent = "Système réinitialisé. Entrez un niveau pour activer le troll."; // Statut générique après reset

  // Réinitialise le niveau de troll et les alertes activées
  trollLevel = 0;
  activatedAlerts.clear();
}


// --- Fonctions de Morpion (inchangées) ---
// ... (getBestMove, minimax, checkWinner, isGameOver) ...

// --- Fonctions de handleSearchInput (ajustées pour la nouvelle logique de trollLevel) ---
function handleSearchInput(e) {
  // La barre de recherche est désactivée par l'attribut 'disabled' si trollLevel < 1
  // Donc si on arrive ici, la barre est forcément active (trollLevel >= 1).
  const val = e.target.value.toLowerCase();

  if (trollLevel >= 15) {
    if (val === 'easter egg') {
      alert('Bien joué ! Le troll se ferme.');
      exitFullscreenMode();
      window.close();
      return;
    } else if (val.length > 0) {
      status.textContent = "Ceci est un piège ! (sauf 'easter egg' 😉)";
    }
  }

  const niveau = parseInt(val);
  if (!isNaN(niveau) && niveau >= 1 && niveau <= 15) {
    activateTrollEffects(niveau); // Utilise la nouvelle fonction
    e.target.value = '';
    return;
  }

  if (/^[a-z]+$/.test(val)) {
    if (trollLevel >= 9) { // Les blagues ne se déclenchent qu'à partir du niveau 9
      const jokes = [
        "Tu tapes du texte, Kevin ? Sérieux ?",
        "Je vois ce que tu fais... ce n'est pas très malin.",
        "Arrête de chercher, ce n'est qu'un troll !",
        "T'as pas mieux à faire ?"
      ];
      status.textContent = jokes[Math.floor(Math.random() * jokes.length)];
    } else {
       status.textContent = "Opération non reconnue.";
    }
  }

  if (trollLevel >= 10 && /[aeiouy]/.test(val)) {
    rickrollVideo.style.display = "block";
    rickrollVideo.play();
  } else if (trollLevel < 10) { // Si le niveau est redescendu sous 10, arrêter le rickroll
    rickrollVideo.pause();
    rickrollVideo.currentTime = 0;
    rickrollVideo.style.display = "none";
  }
}

// ... (enableCursorJitter, disableCursorJitter, initCalculator restent inchangées) ...

// Démarrage
searchBar.addEventListener("input", handleSearchInput);
document.addEventListener('DOMContentLoaded', initializeTrollStartInteraction);
