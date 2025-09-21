let trollLevel = 0;
let progress = 0;
let degoulinantText = null;
let calculatorInitialized = false; // Nouveau flag pour la calculatrice
let morpionCells = []; // Pour stocker les cellules du morpion

const progressBar = document.getElementById("progress");
const status = document.getElementById("status");
const searchBar = document.getElementById("search-bar");
const morpionContainer = document.getElementById("morpion-container");
const popupContainer = document.getElementById("popup-container");
const errorSound = document.getElementById("error-sound");
const imageTroll = document.getElementById("image-troll");
const rickrollVideo = document.getElementById("rickroll-video"); // Correction: Utilisera rickrollVideo
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
  // S'assurer que le niveau est un nombre et qu'il est valide
  const newLevel = parseInt(n);
  if (isNaN(newLevel) || newLevel < 0 || newLevel > 15) {
    console.warn("Tentative d'activer un niveau de troll invalide :", n);
    return;
  }

  // Ne pas réinitialiser si on est déjà au même niveau
  if (trollLevel === newLevel) return;

  trollLevel = newLevel;

  // Réinitialiser tout à chaque changement de niveau
  resetAll();

  if (trollLevel >= 1) {
    // Niveau 1: Fausse mise à jour (déjà géré par updateProgress)
  }
  if (trollLevel >= 2) {
    status.textContent =
      "Mise à jour terminée - votre PC est infecté 😈";
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
    // L'écouteur est déjà sur searchBar, handleSearchInput gère déjà les blagues
  }
  if (trollLevel >= 10) {
    // Rickroll dès qu'une voyelle est tapée (activé dans handleSearchInput)
    rickrollVideo.style.display = "block"; // Correction: rickrollVideo
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
    // La logique de fermeture avec "easter egg" est gérée par handleSearchInput
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
  rickrollVideo.style.display = "none"; // Correction: rickrollVideo
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

  // Reset morpion
  morpionCells = []; // Réinitialise l'état des cellules pour le minimax
  const boardElement = document.getElementById("board");
  if (boardElement) boardElement.innerHTML = ''; // Vide le plateau visuellement
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
  const boardElement = document.getElementById("board"); // Utilise l'élément existant
  boardElement.innerHTML = ""; // Vide le contenu pour réinitialiser les cellules

  // Reset morpion container children (in case re-init)
  morpionContainer.innerHTML = "<h3>Jouez pendant que ça installe...</h3>";
  morpionContainer.appendChild(boardElement); // Ré-ajoute le board à son container

  morpionCells = []; // Réinitialise l'array des cellules
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.dataset.index = i; // Ajoute un index pour faciliter la gestion
    cell.addEventListener("click", () => {
      if (!cell.classList.contains("used") && morpionCells[i] === "") {
        cell.textContent = "X";
        cell.classList.add("used");
        morpionCells[i] = "X"; // Met à jour l'état interne

        if (checkWinner(morpionCells) === null) { // Seulement si le jeu n'est pas terminé
          // Ordinateur joue après un court délai
          setTimeout(() => {
            const move = getBestMove(morpionCells);
            if (move !== null) {
              const computerCell = boardElement.children[move];
              if (computerCell) {
                computerCell.textContent = "O";
                computerCell.classList.add("used");
                morpionCells[move] = "O"; // Met à jour l'état interne
              }
            }
            // Vérifier si le jeu est terminé après le coup de l'ordinateur
            const winner = checkWinner(morpionCells);
            if (winner !== null) {
              // Optionnel: afficher un message de fin de partie
              // alert(winner === 'draw' ? 'Match Nul !' : `Le joueur ${winner} a gagné !`);
            }
          }, 500); // Délai pour que le coup de l'ordi ne soit pas instantané
        }
      }
    });
    boardElement.appendChild(cell);
    morpionCells.push(""); // Initialise l'état des cellules à vide
  }
}

// Minimax pour morpion imbattable
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
    else return 0; // Draw
  }

  if (isMaximizing) { // Maximizing player is 'O' (AI)
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        bestScore = Math.max(bestScore, minimax(board, false));
        board[i] = "";
      }
    }
    return bestScore;
  } else { // Minimizing player is 'X' (Human)
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
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
    [0, 4, 8], [2, 4, 6], // diagonales
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

// Gestion des messages moqueurs (niveau 9) et de la fermeture (niveau 15)
function handleSearchInput(e) {
  const val = e.target.value.toLowerCase();

  // Logique spécifique pour le niveau 15 : gestion de l'easter egg pour fermer
  if (trollLevel >= 15) {
    if (val === 'easter egg') {
      alert('Bien joué ! Le troll se ferme.');
      window.close(); // Ferme la fenêtre du navigateur
      return; // Ne pas exécuter le reste du code
    } else if (val.length > 0) { // Si l'utilisateur tape autre chose et n'est pas l'easter egg
      // Garde l'alerte pour le troll, mais tu peux l'ajuster si tu veux une interaction plus subtile
      // alert("Impossible de fermer la fenêtre sauf avec 'easter egg' ou à la fin du troll.");
      // Pour un troll plus subtil, on peut juste changer le status.textContent
      status.textContent = "Ceci est un piège ! (sauf 'easter egg' 😉)";
    }
  }

  // Lancer la mise à jour seulement une fois, au premier input
  if (progress === 0 && val.length > 0) { // S'assure que la barre de recherche n'est pas vide
    updateProgress();
  }

  // Si c’est un niveau de troll entre 1 et 15
  const niveau = parseInt(val);
  if (!isNaN(niveau) && niveau >= 1 && niveau <= 15) {
    startTrollLevel(niveau);
    e.target.value = ''; // Optionnel: effacer la barre après avoir entré un niveau
    return; // Quitte ici pour éviter les blagues/rickroll si c'est un niveau valide
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

  // Rickroll si une voyelle est tapée et le niveau est >= 10
  if (trollLevel >= 10 && /[aeiouy]/.test(val)) {
    rickrollVideo.style.display = "block";
    rickrollVideo.play();
  } else if (trollLevel < 10) {
    rickrollVideo.pause();
    rickrollVideo.currentTime = 0;
    rickrollVideo.style.display = "none";
  }
}

// Mouvement aléatoire curseur ou fenêtre (niveau 14)
let jitterInterval = null;
function enableCursorJitter() {
  // Optionnel: Faire bouger la fenêtre plutôt que le curseur pour un effet plus "fort"
  jitterInterval = setInterval(() => {
    // Si tu veux faire bouger le curseur, il faut manipuler l'API du curseur, ce qui est limité
    // La méthode window.moveTo est plus pour bouger la fenêtre du navigateur
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

// Calculatrice troll (niveau 15)
function initCalculator() {
  calcDisplay.value = "";

  // Créer les boutons de la calculatrice s'ils n'existent pas encore
  // et s'assurer que les écouteurs d'événements ne sont attachés qu'une seule fois
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
      // Utilise des attributs data-action pour les opérateurs et equals/clear
      if (val === "=") {
        btn.dataset.action = "equals";
      } else if (["+", "-", "*", "/"].includes(val)) {
        btn.dataset.action = "operator";
      } else {
        btn.dataset.action = "number";
      }
      calcButtons.appendChild(btn);
    });

    // Ajout d'un bouton clear séparé
    const clearBtn = document.createElement("button");
    clearBtn.className = "calc-button";
    clearBtn.textContent = "C";
    clearBtn.dataset.action = "clear";
    calcButtons.appendChild(clearBtn);

    // Attache les écouteurs d'événements ICI, et seulement ici
    calcButtons.querySelectorAll(".calc-button").forEach((btn) => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        const buttonValue = btn.textContent;

        if (action === "clear") {
          calcDisplay.value = "";
        } else if (action === "equals") {
          try {
            // Utilisation de Function pour évaluer pour éviter eval() directement sur l'entrée utilisateur
            // Ceci reste risqué pour de vraies applications, mais acceptable pour un troll
            calcDisplay.value = new Function('return ' + calcDisplay.value)();
          } catch {
            calcDisplay.value = "Erreur";
          }
        } else { // number or operator
          calcDisplay.value += buttonValue;
        }
      };
    });
    calculatorInitialized = true; // Marque la calculatrice comme initialisée
  }
  // Si déjà initialisée, on ne fait rien de plus que vider l'affichage au début de la fonction.
}


// Attacher l'écouteur pour la barre de recherche une seule fois au chargement
searchBar.addEventListener("input", handleSearchInput);

// Démarrer la barre de progression au chargement de la page
// La logique de démarrage du troll (trollLevel 1) est dans updateProgress une fois terminée
updateProgress();
