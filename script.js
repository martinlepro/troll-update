let trollLevel = 0;
let progress = 0;
let degoulinantText = null;

const progressBar = document.getElementById("progress");
const status = document.getElementById("status");
const searchBar = document.getElementById("search-bar");
const morpionContainer = document.getElementById("morpion-container");
const popupContainer = document.getElementById("popup-container");
const errorSound = document.getElementById("error-sound");
const imageTroll = document.getElementById("image-troll");
const rickrollContainer = document.getElementById("rickroll-container");
const rickrollVideo = document.getElementById("rickroll-video");
const calculatorContainer = document.getElementById("calculator-container");
const calcDisplay = document.getElementById("calc-display");
const calcButtons = document.getElementById("calc-buttons");

function updateProgress() {
  if (progress < 100) {
    progress += Math.random() * 5;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + "%";
    status.textContent = `Mise à jour en cours... ${Math.floor(progress)}%`;
    setTimeout(updateProgress, 300);
  } else {
    status.textContent = "Mise à jour terminée !";
    // Activation troll par défaut au niveau 1 pour starter
    if (trollLevel === 0) {
      trollLevel = 1;
      startTrollLevel(trollLevel);
    }
  }
}

// Fonction pour lancer un niveau de troll
function startTrollLevel(n) {
  trollLevel = n;

  // Réinitialiser tout à chaque changement de niveau
  resetAll();

  if (trollLevel >= 1) {
    // Niveau 1: Fausse mise à jour (déjà géré)
  }
  if (trollLevel >= 2) {
    status.textContent =
      "Mise à jour terminée - votre PC est infecté 😈 (ceci est un troll)";
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
  if (trollLevel >= 9) {
    searchBar.addEventListener("input", handleSearchInput);
  }
  if (trollLevel >= 10) {
    // Rickroll dès qu'une voyelle est tapée (activé dans handleSearchInput)
    rickrollContainer.style.display = "block";
    rickrollVideo.play();
  }
  if (trollLevel >= 11) {
    imageTroll.style.display = "block";
  }
  if (trollLevel >= 12) {
    // simulation d’activation troll.vbs (popup faux système)
    alert(
      "Activation de troll.vbs - (faux script externe, ne fait rien en vrai)"
    );
  }
  if (trollLevel >= 13) {
    alert(
      "Installation de script au démarrage Windows (faux install.bat, juste pour le troll)"
    );
  }
  if (trollLevel >= 14) {
    enableCursorJitter();
  }
  if (trollLevel >= 15) {
    calculatorContainer.style.display = "block";
    initCalculator();
    // Ajout d’une règle pour fermer uniquement avec "easter egg"
    searchBar.addEventListener("input", handleCloseTroll);
  }
}

// Remise à zéro des effets entre niveaux
function resetAll() {
  // Curseur normal
  document.body.classList.remove("cursor-pale");

  // Cacher tout
  morpionContainer.style.display = "none";
  popupContainer.innerHTML = "";
  imageTroll.style.display = "none";
  rickrollContainer.style.display = "none";
  rickrollVideo.pause();
  rickrollVideo.currentTime = 0;
  calculatorContainer.style.display = "none";

  // Enlever texte dégoulinant s’il existe
  if (degoulinantText) {
    degoulinantText.remove();
    degoulinantText = null;
  }

  // Stop jitter si actif
  disableCursorJitter();
}

// Texte dégoulinant animé au centre
function showDegoulinantText() {
  degoulinantText = document.createElement("div");
  degoulinantText.id = "degoulinant-text";
  degoulinantText.textContent =
    "MAJ TERMINÉE - VOTRE PC EST INFECTÉ (CECI EST UN TROLL)";
  document.body.appendChild(degoulinantText);
}

// Jouer le son d’erreur n fois
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

// Afficher des popups d'erreurs
function showFakePopups(count) {
  for (let i = 0; i < count; i++) {
    const popup = document.createElement("div");
    popup.classList.add("fake-popup");
    popup.textContent = `Erreur critique 0x${Math
      .floor(Math.random() * 9999)
      .toString(16)
      .toUpperCase()}`;
    popupContainer.appendChild(popup);
  }
}

// Morpion imbattable
function initMorpion() {
  const board = document.createElement("div");
  board.id = "board";

  // Clear previous board if any
  while (board.firstChild) board.removeChild(board.firstChild);

  // Reset morpion container children (in case re-init)
  morpionContainer.innerHTML = "<h3>Jouez pendant que ça installe...</h3>";
  morpionContainer.appendChild(board);

  const cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.addEventListener("click", () => {
      if (!cell.classList.contains("used")) {
        cell.textContent = "X";
        cell.classList.add("used");
        // Ordinateur joue
        const move = getBestMove(cells);
        if (move !== null) {
          cells[move].textContent = "O";
          cells[move].classList.add("used");
        }
      }
    });
    board.appendChild(cell);
    cells.push(cell);
  }
}

// Minimax pour morpion imbattable
function getBestMove(cells) {
  const board = cells.map((c) => c.textContent || "");
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
        const score = minimax(board, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const score = minimax(board, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(board) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // lignes
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // colonnes
    [0, 4, 8],
    [2, 4, 6], // diagonales
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

// Gestion des messages moqueurs (niveau 9)
function handleSearchInput(e) {
  const val = e.target.value.toLowerCase();

  if (val === 'easter egg') {
    alert('Bien joué ! Le troll se ferme.');
    window.close();
    return;
  }

  // Lancer la mise à jour seulement une fois, au premier input
  if (progress === 0) {
    updateProgress();
  }

  // Si c’est un niveau de troll entre 1 et 15
  const niveau = parseInt(val);
  if (!isNaN(niveau) && niveau >= 1 && niveau <= 15) {
    startTrollLevel(niveau);
    return;
  }

  // Si c’est juste un texte classique (autre chose)
  if (/^[a-z]+$/.test(val)) {
    const jokes = [
      "Tu tapes du texte, Kevin ? Sérieux ?",
      "Je vois ce que tu fais... ce n'est pas très malin.",
      "Arrête de chercher, ce n'est qu'un troll !",
      "T'as pas mieux à faire ?"
    ];
    status.textContent = jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (/[aeiouy]/.test(val)) {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
  }
}

// Activation du troll "impossible de fermer" (niveau 15)
function handleCloseTroll(e) {
  const val = e.target.value.toLowerCase();
  if (val === "easter egg") {
    alert("Bien joué ! Le troll se ferme.");
    window.close();
  } else {
    alert(
      "Impossible de fermer la fenêtre sauf avec 'easter egg' ou à la fin du troll."
    );
  }
}

// Mouvement aléatoire curseur ou fenêtre (niveau 14)
let jitterInterval = null;
function enableCursorJitter() {
  jitterInterval = setInterval(() => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    window.moveTo(x, y);
  }, 1000);
}
function disableCursorJitter() {
  if (jitterInterval) {
    clearInterval(jitterInterval);
    jitterInterval = null;
  }
}

// Calculatrice troll (niveau 15)
function initCalculator() {
  calcDisplay.value = "";
  calcButtons.querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => {
      const val = btn.getAttribute("data-val");
      if (val) {
        calcDisplay.value += val;
      }
    };
  });
  document.getElementById("calc-clear").onclick = () => {
    calcDisplay.value = "";
  };
  document.getElementById("calc-equals").onclick = () => {
    try {
      // eslint-disable-next-line no-eval
      calcDisplay.value = eval(calcDisplay.value) ?? "";
    } catch {
      calcDisplay.value = "Erreur";
    }
  };
}

searchBar.addEventListener("input", handleSearchInput);

// Start with progress bar
updateProgress();

