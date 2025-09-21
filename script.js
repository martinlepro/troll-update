let trollLevel = 0;
let progress = 0;
let degoulinantText = null;
let calculatorInitialized = false;
let morpionCells = [];
let popupCount = 0;
let activatedAlerts = new Set();

const fullscreenContainer = document.getElementById("fullscreen-container");
const mainTitle = document.getElementById("main-title");
const progressBarElement = document.getElementById("progress-bar");
const progressBar = document.getElementById("progress");
const status = document.getElementById("status");
const searchBarWrapper = document.getElementById("search-bar-wrapper"); // Nouveau wrapper
const searchBar = document.getElementById("search-bar");
const submitSearchBtn = document.getElementById("submit-search-btn"); // Nouveau bouton
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
  searchBarWrapper.style.display = 'none'; // Masquer le wrapper de la barre de recherche
  searchBar.disabled = true;

  status.textContent = "Cliquez n'importe où pour démarrer la mise à jour.";
  status.style.cursor = 'pointer';

  document.addEventListener('click', handleInitialClick, { once: true });
  document.addEventListener('click', handleReEnterFullscreen);
}

function handleInitialClick() {
    status.style.cursor = 'default';
    mainTitle.style.display = 'block';
    progressBarElement.style.display = 'block';
    searchBarWrapper.style.display = 'flex'; // Afficher le wrapper de la barre de recherche

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
    submitSearchBtn.style.display = 'none'; // Le bouton submit est caché au début

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
      activateTrollEffects(1);
    }
  }
}

function activateTrollEffectForLevel(level) {
    switch (level) {
        case 1: break;
        case 2:
            status.textContent = "Mise à jour terminée - votre PC est infecté 😈";
            break;
        case 3:
            document.body.classList.add("cursor-pale");
            break;
        case 4:
            showDegoulinantText();
            break;
        case 5:
            playErrorSound(1);
            break;
        case 6:
            playErrorSound(5);
            break;
        case 7:
            showFakePopups(15);
            break;
        case 8:
            morpionContainer.style.display = "block";
            initMorpion();
            break;
        case 9:
            break;
        case 10:
            rickrollVideo.style.display = "block";
            rickrollVideo.play();
            break;
        case 11:
            imageTroll.style.display = "block";
            break;
        case 12:
            if (!activatedAlerts.has(12)) {
                alert("Activation de troll.vbs - (faux script externe, ne fait rien en vrai)");
                activatedAlerts.add(12);
            }
            break;
        case 13:
            if (!activatedAlerts.has(13)) {
                alert("Installation de script au démarrage Windows (faux install.bat, juste pour le troll)");
                activatedAlerts.add(13);
            }
            break;
        case 14:
            enableCursorJitter();
            break;
        case 15:
            calculatorContainer.style.display = "block";
            initCalculator();
            break;
    }
}

function activateTrollEffects(newLevel) {
  const parsedNewLevel = parseInt(newLevel);
  if (isNaN(parsedNewLevel) || parsedNewLevel < 0 || parsedNewLevel > 15) {
    console.warn("Tentative d'activer un niveau de troll invalide :", newLevel);
    return;
  }

  if (parsedNewLevel === trollLevel) return;

  if (parsedNewLevel < trollLevel || parsedNewLevel === 0) {
    resetAll();
    activatedAlerts.clear();
    trollLevel = 0;
  }

  for (let i = trollLevel + 1; i <= parsedNewLevel; i++) {
    activateTrollEffectForLevel(i);
  }

  trollLevel = parsedNewLevel;

  if (trollLevel >= 1) {
      searchBar.disabled = false; // La barre de recherche est activée
      submitSearchBtn.style.display = 'inline-block'; // Le bouton submit est affiché
      if (trollLevel === 1) {
          status.textContent = "Mise à jour terminée. Le système est en attente d'instructions.";
      }
  } else {
      searchBar.disabled = true;
      submitSearchBtn.style.display = 'none';
  }
}

function startTrollLevel(n) {
  activateTrollEffects(n);
}

function resetAll() {
  document.body.classList.remove("cursor-pale");

  morpionContainer.style.display = "none";
  const boardElement = document.getElementById("board");
  if (boardElement) boardElement.innerHTML = '';
  morpionCells = [];

  popupContainer.innerHTML = "";
  popupCount = 0;

  imageTroll.style.display = "none";

  rickrollVideo.style.display = "none";
  rickrollVideo.pause();
  rickrollVideo.currentTime = 0;

  calculatorContainer.style.display = "none";

  if (degoulinantText) {
    degoulinantText.remove();
    degoulinantText = null;
  }

  disableCursorJitter();

  mainTitle.style.display = 'block';
  progressBarElement.style.display = 'block';
  progressBar.style.width = '0%';
  progress = 0;

  searchBarWrapper.style.display = 'flex'; // Afficher le wrapper
  searchBar.disabled = true;
  submitSearchBtn.style.display = 'none'; // Cacher le bouton
  searchBar.value = '';

  status.textContent = "Système réinitialisé. Entrez un niveau pour activer le troll.";

  trollLevel = 0;
  activatedAlerts.clear();
}

// NOUVELLE FONCTION pour gérer la soumission de la barre de recherche
function processSearchBarSubmission(value) {
    if (searchBar.disabled) {
        return; // Ne rien faire si la barre est désactivée
    }

    if (trollLevel >= 15 && value === 'easter egg') {
        alert('Bien joué ! Le troll se ferme.');
        exitFullscreenMode();
        window.close();
        return;
    }

    const niveau = parseInt(value);
    if (!isNaN(niveau) && niveau >= 1 && niveau <= 15) {
        activateTrollEffects(niveau);
        return;
    }

    // Si ce n'est ni un easter egg ni un niveau, alors c'est du texte aléatoire
    if (/^[a-z]+$/.test(value)) {
        if (trollLevel >= 9) {
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
}

// Fonction existante handleSearchInput renommée pour clarifier son rôle "live"
function handleSearchBarInputLive(e) {
    // Si la barre est désactivée, ne pas traiter les inputs
    if (searchBar.disabled) {
        e.target.value = ''; // Efface ce qui est tapé pendant que c'est désactivé
        return;
    }

    const val = e.target.value.toLowerCase();

    // Le Rickroll est un effet "live" qui peut se déclencher à chaque frappe de voyelle
    if (trollLevel >= 10 && /[aeiouy]/.test(val)) {
        rickrollVideo.style.display = "block";
        rickrollVideo.play();
    } else if (trollLevel < 10 && rickrollVideo.style.display === "block") {
        rickrollVideo.pause();
        rickrollVideo.currentTime = 0;
        rickrollVideo.style.display = "none";
    }

    // Le statut des blagues sera mis à jour seulement si l'utilisateur soumet (via bouton ou Entrée)
    // ou si on garde une logique "live" plus agressive. Pour l'instant, c'est mieux avec soumission.
}

// Gestion de la touche Entrée du clavier physique/virtuel
function handleSearchBarKeyDown(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Empêche le comportement par défaut de l'Entrée
        processSearchBarSubmission(searchBar.value.toLowerCase());
        searchBar.value = ''; // Efface le contenu après soumission
    }
}

// Gestion du clic sur le bouton "Entrée" dédié
function handleSubmitSearchClick() {
    processSearchBarSubmission(searchBar.value.toLowerCase());
    searchBar.value = ''; // Efface le contenu après soumission
}


// Démarrage
searchBar.addEventListener("input", handleSearchBarInputLive);
searchBar.addEventListener("keydown", handleSearchBarKeyDown); // Écouteur pour la touche Entrée
submitSearchBtn.addEventListener("click", handleSubmitSearchClick); // Écouteur pour le bouton

document.addEventListener('DOMContentLoaded', initializeTrollStartInteraction);
