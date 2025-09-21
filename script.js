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
const searchBarWrapper = document.getElementById("search-bar-wrapper");
const searchBar = document.getElementById("search-bar");
const submitSearchBtn = document.getElementById("submit-search-btn");
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
    console.log("Tentative de demande de plein écran.");
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
    console.log("Tentative de sortie du plein écran.");
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

function handleFullscreenChange() {
    console.log("Événement fullscreenchange détecté. FullscreenElement:", document.fullscreenElement);
    if (!document.fullscreenElement && isTrollActive) {
        console.log("Hors plein écran et troll actif, tentative de retour en plein écran.");
        requestFullscreenMode();
    }
}

function handleGlobalKeyDown(event) {
    if (event.key === "Escape" && isTrollActive) {
        console.log("Touche Escape pressée, troll actif.");
        event.preventDefault();
        if (!document.fullscreenElement) {
             console.log("Hors plein écran, tentative de retour en plein écran.");
             requestFullscreenMode();
        }
    }
}

function handleBeforeUnload(event) {
    if (isTrollActive) {
        console.log("Tentative de quitter la page, troll actif.");
        event.returnValue = "Vous êtes sûr de vouloir quitter ? La mise à jour est en cours et cela pourrait endommager votre système.";
        return event.returnValue;
    }
}

// --- INITIALISATION DU TROLL AVEC INTERACTION ---
function initializeTrollStartInteraction() {
  mainTitle.style.display = 'none';
  progressBarElement.style.display = 'none';
  searchBarWrapper.style.display = 'none';
  searchBar.disabled = true;

  status.textContent = "Cliquez n'importe où pour démarrer la mise à jour.";
  status.style.cursor = 'pointer';

  document.addEventListener('click', handleInitialClick, { once: true });
  document.addEventListener('click', handleReEnterFullscreen);
}

function handleInitialClick() {
    console.log("Clic initial détecté, démarrage du troll.");
    status.style.cursor = 'default';
    mainTitle.style.display = 'block';
    progressBarElement.style.display = 'block';
    searchBarWrapper.style.display = 'flex';

    requestFullscreenMode();
    startTrollMechanism();
}

function handleReEnterFullscreen() {
    if (isTrollActive && !document.fullscreenElement) {
        console.log("Clic pour ré-entrer en plein écran détecté.");
        requestFullscreenMode();
    }
}

function startTrollMechanism() {
    if (isTrollActive) return;
    isTrollActive = true;
    console.log("Mécanisme de troll démarré.");

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    searchBar.disabled = true;

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
    console.log(`Activation de l'effet pour le niveau ${level}.`);
    switch (level) {
        case 1: break; // Niveau de base, géré par activateTrollEffects
        case 2:
            status.textContent = "Mise à jour terminée - votre PC est infecté 😈";
            break;
        case 3:
            document.body.classList.add("cursor-pale");
            console.log("Niveau 3: Curseur pâle activé.");
            break;
        case 4:
            showDegoulinantText();
            console.log("Niveau 4: Texte dégoulinant activé.");
            break;
        case 5:
            playErrorSound(1);
            console.log("Niveau 5: Son d'erreur activé.");
            break;
        case 6:
            playErrorSound(5);
            console.log("Niveau 6: Sons d'erreur répétés activés.");
            break;
        case 7:
            showFakePopups(15);
            console.log("Niveau 7: Popups activées.");
            break;
        case 8:
            morpionContainer.style.display = "block";
            initMorpion();
            console.log("Niveau 8: Morpion activé.");
            break;
        case 9: break; // Logique dans handleSearchInput
        case 10:
            rickrollVideo.style.display = "block";
            rickrollVideo.play();
            console.log("Niveau 10: Rickroll activé.");
            break;
        case 11:
            imageTroll.style.display = "block";
            console.log("Niveau 11: Image troll activée.");
            break;
        case 12:
            if (!activatedAlerts.has(12)) {
                alert("Activation de troll.vbs - (faux script externe, ne fait rien en vrai)");
                activatedAlerts.add(12);
                console.log("Niveau 12: Alerte .vbs déclenchée.");
            }
            break;
        case 13:
            if (!activatedAlerts.has(13)) {
                alert("Installation de script au démarrage Windows (faux install.bat, juste pour le troll)");
                activatedAlerts.add(13);
                console.log("Niveau 13: Alerte .bat déclenchée.");
            }
            break;
        case 14:
            enableCursorJitter();
            console.log("Niveau 14: Jitter de fenêtre activé.");
            break;
        case 15:
            calculatorContainer.style.display = "block";
            initCalculator();
            console.log("Niveau 15: Calculatrice activée.");
            break;
    }
}

function activateTrollEffects(newLevel) {
  const parsedNewLevel = parseInt(newLevel);
  if (isNaN(parsedNewLevel) || parsedNewLevel < 0 || parsedNewLevel > 15) {
    console.warn("Tentative d'activer un niveau de troll invalide :", newLevel);
    return;
  }

  if (parsedNewLevel === trollLevel) {
    console.log(`Niveau ${parsedNewLevel} déjà actif, pas de changement.`);
    return;
  }
  console.log(`Changement de niveau de troll : de ${trollLevel} à ${parsedNewLevel}.`);

  if (parsedNewLevel < trollLevel || parsedNewLevel === 0) {
    console.log("Reset complet demandé.");
    resetAll();
    activatedAlerts.clear();
    trollLevel = 0;
  }

  for (let i = trollLevel + 1; i <= parsedNewLevel; i++) {
    activateTrollEffectForLevel(i);
  }

  trollLevel = parsedNewLevel;

  if (trollLevel >= 1) {
      searchBar.disabled = false;
      submitSearchBtn.style.display = 'inline-block';
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
  console.log("Exécution de resetAll().");
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

  searchBarWrapper.style.display = 'flex';
  searchBar.disabled = true;
  submitSearchBtn.style.display = 'none';
  searchBar.value = '';

  status.textContent = "Système réinitialisé. Entrez un niveau pour activer le troll.";

  trollLevel = 0;
  activatedAlerts.clear();
}

function showDegoulinantText() {
  if (!degoulinantText) { // S'assure de ne créer l'élément qu'une seule fois
    degoulinantText = document.createElement("div");
    degoulinantText.id = "degoulinant-text";
    degoulinantText.textContent = "MAJ TERMINÉE - VOTRE PC EST INFECTÉ (CECI EST UN TROLL)";
    document.body.appendChild(degoulinantText);
  }
}

function playErrorSound(times) {
  let count = 0;
  function play() {
    errorSound.currentTime = 0;
    errorSound.play();
    count++;
    if (count < times) setTimeout(play, 800);
  }
  play();
}

function showFakePopups(count) {
  for (let i = 0; i < count; i++) {
    const popup = document.createElement("div");
    popup.classList.add("fake-popup");
    popup.textContent = `Erreur critique 0x${Math
      .floor(Math.random() * 9999)
      .toString(16)
      .toUpperCase()}`;

    const offsetX = popupCount * 20;
    const offsetY = popupCount * 20;

    popup.style.setProperty('--popup-offset-x', `${offsetX}px`);
    popup.style.setProperty('--popup-offset-y', `${offsetY}px`);

    popup.style.top = `0px`;
    popup.style.left = `0px`;

    popupContainer.appendChild(popup);
    popupCount++;
  }
}

function initMorpion() {
  // Reset morpionCells avant de recréer le plateau
  morpionCells = Array(9).fill(""); // Assurez-vous que c'est un tableau de 9 chaînes vides

  const boardElement = document.getElementById("board");
  boardElement.innerHTML = ""; // Vide le contenu existant

  morpionContainer.innerHTML = "<h3>Jouez pendant que ça installe...</h3>"; // Réajoute le titre
  morpionContainer.appendChild(boardElement); // Réajoute le plateau vidé

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.dataset.index = i;
    cell.addEventListener("click", () => {
      if (!cell.classList.contains("used") && morpionCells[i] === "") {
        cell.textContent = "X";
        cell.classList.add("used");
        morpionCells[i] = "X";

        if (checkWinner(morpionCells) === null) {
          setTimeout(() => {
            const move = getBestMove(morpionCells);
            if (move !== null) {
              const computerCell = boardElement.children[move];
              if (computerCell) {
                computerCell.textContent = "O";
                computerCell.classList.add("used");
                morpionCells[move] = "O";
              }
            }
            const winner = checkWinner(morpionCells);
            if (winner !== null) { /* Handle winner */ }
          }, 500);
        }
      }
    });
    boardElement.appendChild(cell);
  }
}


function getBestMove(board) {
  if (isGameOver(board)) return null;

  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "O";
      const score = minimax(board, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, isMaximizing) {
  const winner = checkWinner(board);
  if (winner !== null) {
    if (winner === "O") return 10;
    else if (winner === "X") return -10;
    else return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        bestScore = Math.max(bestScore, minimax(board, false));
        board[i] = "";
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        bestScore = Math.min(bestScore, minimax(board, true));
        board[i] = "";
      }
    }
    return bestScore;
  }
}

function checkWinner(board) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of wins) {
    if (
      board[a] !== "" &&
      board[a] === board[b] &&
      board[a] === board[c]
    )
      return board[a];
  }
  if (board.every((cell) => cell !== "")) return "draw";
  return null;
}

function isGameOver(board) {
  return checkWinner(board) !== null;
}

function processSearchBarSubmission(value) {
    if (searchBar.disabled) {
        console.warn("Tentative de soumission avec barre de recherche désactivée.");
        return;
    }
    console.log(`Soumission barre de recherche: "${value}"`);

    // --- NOUVEAU : Fonctionnalité "RESET ALL" ---
    if (value === 'reset all') {
        resetAll();
        searchBar.value = '';
        status.textContent = "Système réinitialisé. Entrez un niveau pour activer le troll.";
        return;
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
    } else if (value.length > 0) { // Si ce n'est pas une lettre/chiffre reconnu mais non vide
        status.textContent = "Commande inconnue.";
    }
}

function handleSearchBarInputLive(e) {
    if (searchBar.disabled) {
        e.target.value = '';
        return;
    }

    const val = e.target.value.toLowerCase();

    if (trollLevel >= 10 && /[aeiouy]/.test(val)) {
        rickrollVideo.style.display = "block";
        rickrollVideo.play();
    } else if (trollLevel < 10 && rickrollVideo.style.display === "block") {
        rickrollVideo.pause();
        rickrollVideo.currentTime = 0;
        rickrollVideo.style.display = "none";
    }
}

function handleSearchBarKeyDown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        processSearchBarSubmission(searchBar.value.toLowerCase());
        searchBar.value = '';
    }
}

function handleSubmitSearchClick() {
    processSearchBarSubmission(searchBar.value.toLowerCase());
    searchBar.value = '';
}

let jitterInterval = null;
function enableCursorJitter() {
  jitterInterval = setInterval(() => {
    const x = Math.random() * (window.screen.width - window.outerWidth);
    const y = Math.random() * (window.screen.height - window.outerHeight);
    window.moveTo(x, y);
  }, 1000);
}
function disableCursorJitter() {
  if (jitterInterval) {
    clearInterval(jitterInterval);
    jitterInterval = null;
  }
}

function initCalculator() {
  calcDisplay.value = "";

  if (!calculatorInitialized) {
    const buttons = [
      "7", "8", "9", "/",
      "4", "5", "6", "*",
      "1", "2", "3", "-",
      "0", ".", "=", "+"
    ];

    buttons.forEach(val => {
      const btn = document.createElement("button");
      btn.className = "calc-button";
      btn.textContent = val;
      if (val === "=") {
        btn.dataset.action = "equals";
      } else if (["+", "-", "*", "/"].includes(val)) {
        btn.dataset.action = "operator";
      } else {
        btn.dataset.action = "number";
      }
      calcButtons.appendChild(btn);
    });

    const clearBtn = document.createElement("button");
    clearBtn.className = "calc-button";
    clearBtn.textContent = "C";
    clearBtn.dataset.action = "clear";
    calcButtons.appendChild(clearBtn);

    calcButtons.querySelectorAll(".calc-button").forEach((btn) => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        const buttonValue = btn.textContent;

        if (action === "clear") {
          calcDisplay.value = "";
        } else if (action === "equals") {
          try {
            calcDisplay.value = new Function('return ' + calcDisplay.value)();
          } catch {
            calcDisplay.value = "Erreur";
          }
        } else {
          calcDisplay.value += buttonValue;
        }
      };
    });
    calculatorInitialized = true;
  }
}


searchBar.addEventListener("input", handleSearchBarInputLive);
searchBar.addEventListener("keydown", handleSearchBarKeyDown);
submitSearchBtn.addEventListener("click", handleSubmitSearchClick);

document.addEventListener('DOMContentLoaded', initializeTrollStartInteraction);
