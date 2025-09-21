let trollLevel = 0;
let progress = 0;
let degoulinantText = null;
let calculatorInitialized = false;
let morpionCells = [];
let popupCount = 0;
let activatedAlerts = new Set();
let matrixRainInterval = null;

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
const subwaySurferVideo = document.getElementById("subway-surfer-video");
const matrixRainContainer = document.getElementById("matrix-rain-container");
const calculatorContainer = document.getElementById("calculator-container");
const customAlertContainer = document.getElementById("custom-alert-container");
const calcDisplay = document.getElementById("calc-display");
const calcButtons = document.getElementById("calc-buttons");

// NOUVEAU: Tableau de messages troll pour les popups
const trollMessages = [
    "Erreur critique 0x000000FF. Votre système est immunisé contre les erreurs (temporairement).",
    "Système 32 protégé. (Pour l'instant... 😏)",
    "Antivirus désactivé pendant 10 minutes pour cause de 'mise à jour essentielle'.",
    "Suppression de Windows bloquée. Dommage hein ?",
    "Tentative d'accès à vos données personnelles... Échec. Re-tentative dans 5 secondes.",
    "Votre souris est maintenant contrôlée par une intelligence supérieure. Enjoy !",
    "La l&%%ai@de-sE\"@cOprM, =\\¡s¿¿ Votre PC a buggé en essayant de comprendre ce message.", // Message corrompu
    "Je te troll 🤣🤣🤣 ou pas 😐😐 du tout et c'est un virus 😨.",
    "Un fichier crucial a été remplacé par un GIF de chatons. Pas de panique !",
    "Attention : Votre café est probablement froid maintenant.",
    "Détection d'une activité anormale... C'est juste vous, ne vous inquiétez pas (ou si).",
    "Votre clavier est maintenant en mode QWERTY aléatoire. Bonne chance !",
    "Scan de votre historique de navigation en cours. Juste pour rire !",
    "Chargement du 'Dossier Secret' impossible. Contenu trop gênant.",
    "Félicitations ! Vous avez trouvé l'erreur 404... dans votre vie."
];


// --- LOGIQUE POUR LE PLEIN ÉCRAN ET LES TOUCHES DE SORTIE ---
let isTrollActive = false;
let hasEnteredFullscreenOnce = false;

function requestFullscreenMode() {
    console.log("Tentative de demande de plein écran.");
    if (fullscreenContainer.requestFullscreen) {
        fullscreenContainer.requestFullscreen().then(() => {
            hasEnteredFullscreenOnce = true;
            console.log("Plein écran activé.");
            if (trollLevel >= 14) {
                disableCursorJitter();
                console.log("Jitter (Niveau 14) désactivé en mode plein écran.");
            }
        }).catch(err => {
            console.warn("Échec de la demande de plein écran:", err);
            if (!isTrollActive) {
                console.log("Démarrage du mécanisme de troll car plein écran échoué.");
                startTrollMechanism();
            }
        });
    } else {
        console.warn("API Fullscreen non supportée par le navigateur. Démarrage direct du troll.");
        if (!isTrollActive) {
            startTrollMechanism();
        }
    }
}

function exitFullscreenMode() {
    console.log("Tentative de sortie du plein écran.");
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
            console.warn("Échec de la sortie du plein écran:", err);
        });
    }
}

function handleFullscreenChange() {
    console.log("Événement fullscreenchange détecté. FullscreenElement:", document.fullscreenElement);
    if (!document.fullscreenElement && isTrollActive) {
        console.log("Sortie du plein écran détectée. Le retour sera forcé au prochain clic.");
        if (trollLevel >= 14 && !jitterInterval) {
            enableCursorJitter();
            console.log("Jitter (Niveau 14) réactivé après sortie du plein écran.");
        }
    }
}

function handleGlobalKeyDown(event) {
    if (event.key === "Escape" && isTrollActive) {
        console.log("Touche Escape pressée, troll actif.");
        event.preventDefault();

        if (!document.fullscreenElement && hasEnteredFullscreenOnce) {
             console.log("Hors plein écran, tentative de retour en plein écran au prochain clic.");
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

function showCustomAlert(message) {
    customAlertContainer.innerHTML = `
        <p>${message}</p>
        <button id="custom-alert-ok-btn">OK</button>
    `;
    customAlertContainer.style.display = 'block';
    console.log(`Alert personnalisée affichée: "${message}"`);
    customAlertContainer.querySelector('#custom-alert-ok-btn').onclick = () => {
        customAlertContainer.style.display = 'none';
        console.log("Alert personnalisée fermée.");
    };
}


// --- INITIALISATION DU TROLL AVEC INTERACTION ---
function initializeTrollStartInteraction() {
  mainTitle.style.display = 'none';
  progressBarElement.style.display = 'none';
  searchBarWrapper.style.display = 'none';
  searchBar.disabled = true;

  document.querySelectorAll('.fixed-element').forEach(el => el.style.display = 'none');
  // NOUVEAU: Cacher aussi les boutons de fermeture au démarrage
  document.querySelectorAll('.close-button').forEach(button => button.style.display = 'none');


  status.textContent = "Cliquez n'importe où pour démarrer la mise à jour.";
  status.style.cursor = 'pointer';

  document.addEventListener('click', handleInitialClick, { once: true });
  document.addEventListener('click', handleReEnterFullscreen);
  console.log("Application initialisée, en attente du clic initial.");
}

function handleInitialClick() {
    console.log("Clic initial détecté, démarre le processus.");
    status.style.cursor = 'default';
    mainTitle.style.display = 'block';
    progressBarElement.style.display = 'block';
    searchBarWrapper.style.display = 'flex';
    submitSearchBtn.style.display = 'inline-block';

    // NOUVEAU: Afficher les boutons de fermeture par défaut après le clic initial (pour PC)
    document.querySelectorAll('.close-button').forEach(button => button.style.display = 'block');


    requestFullscreenMode();
    startTrollMechanism();
}

function handleReEnterFullscreen() {
    if (customAlertContainer.style.display === 'block') {
        return;
    }

    if (isTrollActive && !document.fullscreenElement) {
        console.log("Clic détecté hors plein écran alors que le troll est actif. Tentative de ré-entrer.");
        requestFullscreenMode();
    }
}

function startTrollMechanism() {
    if (isTrollActive) return;
    isTrollActive = true;
    console.log("Mécanisme de troll démarré. isTrollActive:", isTrollActive);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    searchBar.disabled = false;

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
    console.log("Progression à 100%. Démarrage du niveau 1.");
    if (trollLevel === 0) {
      activateTrollEffects(1);
    }
  }
}

function activateTrollEffectForLevel(level) {
    console.log(`Activation de l'effet pour le niveau ${level}.`);
    switch (level) {
        case 1:
            break;
        case 2:
            status.textContent = "Mise à jour terminée - votre PC est infecté 😈";
            break;
        case 3:
            document.body.classList.add("cursor-pale");
            console.log("Niveau 3: Curseur pâle activé.");
            break;
        case 4:
            showDegoulinantText();
            startMatrixRain();
            console.log("Niveau 4: Texte dégoulinant et Matrix Rain activés.");
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
            popupContainer.style.display = 'block';
            showFakePopups(15);
            console.log("Niveau 7: Popups activées.");
            break;
        case 8:
            morpionContainer.style.display = 'block';
            initMorpion();
            console.log("Niveau 8: Morpion activé.");
            break;
        case 9:
            console.log("Niveau 9: Comportement de la barre de recherche modifié.");
            break;
        case 10:
            rickrollVideo.style.display = 'block';
            rickrollVideo.play();
            console.log("Niveau 10: Rickroll activé.");
            break;
        case 11:
            imageTroll.style.display = 'block';
            subwaySurferVideo.style.display = 'block';
            subwaySurferVideo.play();
            console.log("Niveau 11: Image Troll et Subway Surfer activés.");
            break;
        case 12:
            if (!activatedAlerts.has(12)) {
                showCustomAlert("Activation de troll.vbs - (faux script externe, ne fait rien en vrai)");
                activatedAlerts.add(12);
                console.log("Niveau 12: Alerte .vbs déclenchée.");
            }
            break;
        case 13:
            if (!activatedAlerts.has(13)) {
                showCustomAlert("Installation de script au démarrage Windows (faux install.bat, juste pour le troll)");
                activatedAlerts.add(13);
                console.log("Niveau 13: Alerte .bat déclenchée.");
            }
            break;
        case 14:
            enableCursorJitter();
            console.log("Niveau 14: Jitter de fenêtre activé.");
            break;
        case 15:
            calculatorContainer.style.display = 'block';
            initCalculator();
            console.log("Niveau 15: Calculatrice activée.");
            break;
    }
}

function activateTrollEffects(newLevel) {
  const parsedNewLevel = parseInt(newLevel);
  console.log(`Appel à activateTrollEffects avec newLevel: ${newLevel}, parsedNewLevel: ${parsedNewLevel}`);
  if (isNaN(parsedNewLevel) || parsedNewLevel < 0 || parsedNewLevel > 15) {
    console.warn("Tentative d'activer un niveau de troll invalide :", newLevel);
    return;
  }

  if (parsedNewLevel === trollLevel) {
    console.log(`Niveau ${parsedNewLevel} déjà actif, pas de changement.`);
    return;
  }
  console.log(`Changement de niveau de troll : de ${trollLevel} à ${parsedNewLevel}.`);

  if (trollLevel >= 14) {
      disableCursorJitter();
      console.log("Jitter (Niveau 14) temporairement désactivé pour changement de niveau.");
  }


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

  if (trollLevel >= 14 && !document.fullscreenElement) {
      enableCursorJitter();
      console.log("Jitter (Niveau 14) réactivé après changement de niveau (hors plein écran).");
  }
}

function startTrollLevel(n) {
  activateTrollEffects(n);
}

function resetAll() {
  console.log("Exécution de resetAll().");
  document.body.classList.remove("cursor-pale");

  document.querySelectorAll('.fixed-element').forEach(el => el.style.display = 'none');
  // NOUVEAU: Cacher les boutons de fermeture lors d'un reset
  document.querySelectorAll('.close-button').forEach(button => button.style.display = 'none');


  const boardElement = document.getElementById("board");
  if (boardElement) boardElement.innerHTML = '';
  morpionCells = [];

  popupContainer.innerHTML = "";
  popupCount = 0;

  subwaySurferVideo.pause();
  subwaySurferVideo.currentTime = 0;

  rickrollVideo.pause();
  rickrollVideo.currentTime = 0;

  if (degoulinantText) {
    degoulinantText.remove();
    degoulinantText = null;
  }
  stopMatrixRain();
  matrixRainContainer.innerHTML = '';

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
  customAlertContainer.style.display = 'none';
}

function startMatrixRain() {
    if (matrixRainInterval) return;
    matrixRainContainer.style.display = 'block';
    matrixRainContainer.innerHTML = '';

    matrixRainContainer.style.position = 'relative';

    const computedStyle = getComputedStyle(matrixRainContainer);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.2;

    const charWidth = fontSize * 0.6;
    const charHeight = lineHeight;

    let initialContent = '';
    const numLines = Math.max(1, Math.floor(matrixRainContainer.offsetHeight / charHeight));
    const numChars = Math.max(1, Math.floor(matrixRainContainer.offsetWidth / charWidth));

    for(let i = 0; i < numLines + 5; i++) {
        let line = '';
        for(let j = 0; j < numChars; j++) {
            line += Math.round(Math.random());
        }
        initialContent += line + '\n';
    }
    matrixRainContainer.textContent = initialContent;


    matrixRainInterval = setInterval(() => {
        let currentContent = matrixRainContainer.textContent;
        const firstLineBreak = currentContent.indexOf('\n');
        if (firstLineBreak !== -1) {
            currentContent = currentContent.substring(firstLineBreak + 1);
        } else {
            currentContent = '';
        }

        let newLine = '';
        for(let i = 0; i < numChars; i++) {
            newLine += Math.round(Math.random());
        }
        matrixRainContainer.textContent = currentContent + newLine + '\n';

    }, 100);
    console.log("Matrix Rain démarré avec numLines:", numLines, "numChars:", numChars, "fontSize:", fontSize);
}


function stopMatrixRain() {
    if (matrixRainInterval) {
        clearInterval(matrixRainInterval);
        matrixRainInterval = null;
    }
    matrixRainContainer.style.display = 'none';
    console.log("Matrix Rain arrêté.");
}


function showDegoulinantText() {
  if (!degoulinantText) {
    degoulinantText = document.createElement("div");
    degoulinantText.id = "degoulinant-text";
    degoulinantText.textContent = "MAJ TERMINÉE - VOTRE PC EST INFECTÉ (CECI EST UN TROLL)";
    document.body.appendChild(degoulinantText);
    console.log("Texte dégoulinant affiché.");
  }
}

function playErrorSound(times) {
  let count = 0;
  function play() {
    if (errorSound) {
        errorSound.currentTime = 0;
        errorSound.play().catch(e => console.warn("Erreur de lecture audio:", e));
        count++;
        if (count < times) setTimeout(play, 800);
    } else {
        console.warn("Element audio 'error-sound' non trouvé.");
    }
  }
  play();
  console.log(`Son d'erreur joué ${times} fois.`);
}

function showFakePopups(count) {
  for (let i = 0; i < count; i++) {
    const popup = document.createElement("div");
    popup.classList.add("fake-popup");

    // NOUVEAU: Choisir un message troll aléatoire
    const randomMessage = trollMessages[Math.floor(Math.random() * trollMessages.length)];
    popup.textContent = randomMessage;

    // NOUVEAU: Ajouter un bouton de fermeture à chaque popup
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-button");
    closeBtn.textContent = "×";
    closeBtn.onclick = () => {
        popup.remove(); // Supprime la popup
        console.log("Popup fermée manuellement.");
    };
    popup.appendChild(closeBtn); // Ajouter le bouton à la popup

    const offsetX = popupCount * 20;
    const offsetY = popupCount * 20;

    popup.style.setProperty('--popup-offset-x', `${offsetX}px`);
    popup.style.setProperty('--popup-offset-y', `${offsetY}px`);

    // Pour relancer l'animation fadeOut à chaque création
    // On doit la supprimer puis la rajouter pour forcer le navigateur à la re-déclencher
    popup.style.animation = 'none';
    popup.offsetHeight; // Force un reflow/repaint
    popup.style.animation = 'fadeOut 5s forwards';

    popupContainer.appendChild(popup);
    popupCount++;
  }
  console.log(`${count} fausses popups affichées.`);
}

function initMorpion() {
  morpionCells = Array(9).fill("");

  const boardElement = document.getElementById("board");
  if (!boardElement) {
      console.error("Element #board non trouvé pour le morpion.");
      return;
  }
  boardElement.innerHTML = "";

  morpionContainer.querySelector('h3').textContent = "Jouez pendant que ça installe..."; // Assure que le titre est là

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
  console.log("Morpion initialisé.");
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

    if (value === 'reset all') {
        resetAll();
        searchBar.value = '';
        status.textContent = "Système réinitialisé. Entrez un niveau pour activer le troll.";
        exitFullscreenMode();
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
        searchBar.value = '';
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
    } else if (value.length > 0) {
        status.textContent = "Commande inconnue.";
    }
    searchBar.value = '';
}

function handleSearchBarInputLive(e) {
    if (searchBar.disabled) {
        e.target.value = '';
        return;
    }

    const val = e.target.value.toLowerCase();

    if (trollLevel >= 10 && /[aeiouy]/.test(val)) {
        rickrollVideo.style.display = "block";
        rickrollVideo.play().catch(e => console.warn("Erreur de lecture Rickroll:", e));
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
    }
}

function handleSubmitSearchClick() {
    processSearchBarSubmission(searchBar.value.toLowerCase());
}

let jitterInterval = null;
function enableCursorJitter() {
  if (document.fullscreenElement) {
      console.log("Tentative d'activer le jitter en plein écran, ignoré.");
      return;
  }
  if (jitterInterval) return;

  jitterInterval = setInterval(() => {
    if (!document.fullscreenElement) {
        const x = Math.random() * (window.screen.width - window.outerWidth);
        const y = Math.random() * (window.screen.height - window.outerHeight);
        window.moveTo(x, y);
    } else {
        disableCursorJitter();
        console.log("Jitter (Niveau 14) désactivé car passé en plein écran.");
    }
  }, 1000);
  console.log("Jitter (Niveau 14) activé.");
}

function disableCursorJitter() {
  if (jitterInterval) {
    clearInterval(jitterInterval);
    jitterInterval = null;
    console.log("Jitter (Niveau 14) désactivé.");
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
            calcDisplay.value = new Function('return ' + calcDisplay.value.replace(/×/g, '*') + ' === undefined ? "" : ' + calcDisplay.value.replace(/×/g, '*') )();
            if (calcDisplay.value === "Infinity" || calcDisplay.value === "-Infinity" || isNaN(calcDisplay.value)) calcDisplay.value = "Erreur";
          } catch {
            calcDisplay.value = "Erreur";
          }
        } else {
          const lastChar = calcDisplay.value.slice(-1);
          const isOperator = ["+", "-", "*", "/"].includes(buttonValue);
          const lastCharIsOperator = ["+", "-", "*", "/"].includes(lastChar);

          if (isOperator && lastCharIsOperator) {
            calcDisplay.value = calcDisplay.value.slice(0, -1) + buttonValue;
          } else if (calcDisplay.value === "Erreur") {
            calcDisplay.value = buttonValue;
          }
          else {
            calcDisplay.value += buttonValue;
          }
        }
      };
    });
    calculatorInitialized = true;
    console.log("Calculatrice initialisée.");
  }
}

// NOUVEAU: Ajout des listeners pour les boutons de fermeture des éléments fixes
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const targetId = event.target.dataset.target;
        if (targetId) {
            document.getElementById(targetId).style.display = 'none';
            console.log(`Fermeture de l'élément: ${targetId}`);
        }
    });
});


searchBar.addEventListener("input", handleSearchBarInputLive);
searchBar.addEventListener("keydown", handleSearchBarKeyDown);
submitSearchBtn.addEventListener("click", handleSubmitSearchClick);

document.addEventListener('DOMContentLoaded', initializeTrollStartInteraction);
