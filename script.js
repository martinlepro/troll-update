let trollLevel = 0;
let progress = 0;
let degoulinantText = null;
let calculatorInitialized = false;
let morpionCells = [];
let popupCount = 0; // Nouveau: Compteur pour gérer les popups qui descendent

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

// --- Nouvelle fonction pour gérer l'état initial avant le démarrage du troll ---
function initializeTrollStart() {
  searchBar.disabled = true; // Désactive la barre de recherche au début
  status.textContent = "Appuyez sur ENTRÉE pour commencer le grand troll...";

  document.addEventListener('keydown', handleInitialEnter);
}

// --- Nouveau gestionnaire d'événement pour la touche Entrée ---
function handleInitialEnter(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Empêche le comportement par défaut de la touche Entrée
    document.removeEventListener('keydown', handleInitialEnter); // Retire cet écouteur
    searchBar.disabled = false; // Active la barre de recherche
    searchBar.classList.add('fixed-search-bar'); // Ajoute une classe pour la position fixe

    status.textContent = "Préparation de la mise à jour...";
    updateProgress(); // Démarre le troll !
  }
}

function updateProgress() {
  if (progress < 100) {
    progress += Math.random() * 5;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + "%";
    status.textContent = `Mise à jour en cours... ${Math.floor(progress)}%`;
    setTimeout(updateProgress, 300);
  } else {
    status.textContent = "Mise à jour terminée !";
    if (trollLevel === 0) {
      trollLevel = 1;
      startTrollLevel(trollLevel);
    }
  }
}

function startTrollLevel(n) {
  const newLevel = parseInt(n);
  if (isNaN(newLevel) || newLevel < 0 || newLevel > 15) {
    console.warn("Tentative d'activer un niveau de troll invalide :", n);
    return;
  }

  if (trollLevel === newLevel) return;

  trollLevel = newLevel;

  resetAll();

  if (trollLevel >= 1) { /* Already handled */ }
  if (trollLevel >= 2) {
    status.textContent = "Mise à jour terminée - votre PC est infecté 😈";
  }
  if (trollLevel >= 3) {
    document.body.classList.add("cursor-pale");
  }
  if (trollLevel >= 4) {
    showDegoulinantText();
  }
  if (trollLevel >= 5) {
    playErrorSound(1);
  }
  if (trollLevel >= 6) {
    playErrorSound(5);
  }
  if (trollLevel >= 7) {
    showFakePopups(15);
  }
  if (trollLevel >= 8) {
    morpionContainer.style.display = "block";
    initMorpion();
  }
  if (trollLevel >= 9) { /* Handled by handleSearchInput */ }
  if (trollLevel >= 10) {
    rickrollVideo.style.display = "block";
    rickrollVideo.play();
  }
  if (trollLevel >= 11) {
    imageTroll.style.display = "block";
  }
  if (trollLevel >= 12) {
    alert("Activation de troll.vbs - (faux script externe, ne fait rien en vrai)");
  }
  if (trollLevel >= 13) {
    alert("Installation de script au démarrage Windows (faux install.bat, juste pour le troll)");
  }
  if (trollLevel >= 14) {
    enableCursorJitter();
  }
  if (trollLevel >= 15) {
    calculatorContainer.style.display = "block";
    initCalculator();
  }
}

function resetAll() {
  document.body.classList.remove("cursor-pale");

  morpionContainer.style.display = "none";
  popupContainer.innerHTML = "";
  popupCount = 0; // Réinitialise le compteur de popups
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

  morpionCells = [];
  const boardElement = document.getElementById("board");
  if (boardElement) boardElement.innerHTML = '';
}

function showDegoulinantText() {
  degoulinantText = document.createElement("div");
  degoulinantText.id = "degoulinant-text";
  degoulinantText.textContent = "MAJ TERMINÉE - VOTRE PC EST INFECTÉ (CECI EST UN TROLL)";
  document.body.appendChild(degoulinantText);
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

// Modifié: showFakePopups pour l'effet de descente
function showFakePopups(count) {
  for (let i = 0; i < count; i++) {
    const popup = document.createElement("div");
    popup.classList.add("fake-popup");
    popup.textContent = `Erreur critique 0x${Math
      .floor(Math.random() * 9999)
      .toString(16)
      .toUpperCase()}`;

    // Calculer un offset pour chaque popup
    const offsetX = popupCount * 20; // Décalage de 20px vers la droite
    const offsetY = popupCount * 20; // Décalage de 20px vers le bas

    // Appliquer les offsets comme des propriétés CSS personnalisées
    popup.style.setProperty('--popup-offset-x', `${offsetX}px`);
    popup.style.setProperty('--popup-offset-y', `${offsetY}px`);

    // Positionner la popup
    popup.style.top = `0px`; // Commence au top de popup-container
    popup.style.left = `0px`; // Commence au left de popup-container

    popupContainer.appendChild(popup);
    popupCount++; // Incrémente le compteur pour la prochaine popup
  }
}

function initMorpion() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";

  morpionContainer.innerHTML = "<h3>Jouez pendant que ça installe...</h3>";
  morpionContainer.appendChild(boardElement);

  morpionCells = [];
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
            if (winner !== null) {
              // alert(winner === 'draw' ? 'Match Nul !' : `Le joueur ${winner} a gagné !`);
            }
          }, 500);
        }
      }
    });
    boardElement.appendChild(cell);
    morpionCells.push("");
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

function handleSearchInput(e) {
  const val = e.target.value.toLowerCase();

  if (trollLevel >= 15) {
    if (val === 'easter egg') {
      alert('Bien joué ! Le troll se ferme.');
      window.close();
      return;
    } else if (val.length > 0) {
      status.textContent = "Ceci est un piège ! (sauf 'easter egg' 😉)";
    }
  }

  const niveau = parseInt(val);
  if (!isNaN(niveau) && niveau >= 1 && niveau <= 15) {
    startTrollLevel(niveau);
    e.target.value = '';
    return;
  }

  if (/^[a-z]+$/.test(val)) {
    const jokes = [
      "Tu tapes du texte, Kevin ? Sérieux ?",
      "Je vois ce que tu fais... ce n'est pas très malin.",
      "Arrête de chercher, ce n'est qu'un troll !",
      "T'as pas mieux à faire ?"
    ];
    status.textContent = jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (trollLevel >= 10 && /[aeiouy]/.test(val)) {
    rickrollVideo.style.display = "block";
    rickrollVideo.play();
  } else if (trollLevel < 10) {
    rickrollVideo.pause();
    rickrollVideo.currentTime = 0;
    rickrollVideo.style.display = "none";
  }
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

searchBar.addEventListener("input", handleSearchInput);

// Démarrer l'état initial en attendant la touche Entrée
initializeTrollStart();
