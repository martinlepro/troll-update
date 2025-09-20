// Variables globales
let progress = 0;
const progressBar = document.getElementById('progress');
const status = document.getElementById('status');
const searchBar = document.getElementById('search-bar');
const morpionContainer = document.getElementById('morpion-container');
const popupContainer = document.getElementById('popup-container'); // Nouveau conteneur pour les popups factices
const imageTroll = document.getElementById('image-troll'); // L'image du troll
const errorAudio = document.getElementById('error-audio'); // L'élément audio

// --- Gestion de la barre de progression ---
function updateProgress() {
  if (progress < 100) {
    progress += Math.random() * 5; // Progression aléatoire
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + '%';
    status.textContent = `Mise à jour en cours... ${Math.floor(progress)}%`;
    setTimeout(updateProgress, 300);
  } else {
    status.textContent = "Mise à jour terminée !";
    triggerTroll(); // Déclenche le troll une fois la progression finie
  }
}

// --- Fonction principale de déclenchement du troll ---
function triggerTroll() {
  document.body.style.cursor = 'wait'; // Curseur "attente"

  // Texte "dégoulinant" au centre de l'écran
  let degoulinant = document.createElement('div');
  degoulinant.textContent = "MAJ TERMINÉE - VOTRE PC EST MAINTENANT INFECTÉ 😈";
  degoulinant.style.position = 'fixed';
  degoulinant.style.top = '40%';
  degoulinant.style.left = '50%';
  degoulinant.style.transform = 'translate(-50%, -50%)';
  degoulinant.style.color = 'lime';
  degoulinant.style.fontSize = '24px';
  degoulinant.style.fontWeight = 'bold';
  degoulinant.style.animation = 'degoulinement 5s forwards';
  document.body.appendChild(degoulinant);

  playErrorSounds(5); // Joue des sons d'erreur 5 fois

  // Affiche des fausses popups après un court délai
  setTimeout(() => showFakePopups(15), 3000); // 15 popups qui apparaissent/disparaissent

  // Affiche le morpion imbattable
  morpionContainer.style.display = 'block';
  initMorpion();

  // Attache l'écouteur d'événements pour la barre de recherche
  searchBar.addEventListener('input', handleSearchInput);
}

// --- Gestion des sons d'erreur ---
function playErrorSounds(times) {
  let count = 0;
  if (!errorAudio) { // Vérifie si l'élément audio existe
      console.warn("Fichier audio 'winstart.wav' introuvable ou non chargé.");
      return;
  }
  errorAudio.volume = 0.5;

  // On crée une fonction pour gérer la lecture en boucle
  const playNext = () => {
    count++;
    if (count <= times) {
      errorAudio.currentTime = 0; // Remet au début
      errorAudio.play().catch(e => console.error("Erreur de lecture audio:", e));
    }
  };

  errorAudio.addEventListener('ended', playNext); // Lance la prochaine lecture après la fin
  playNext(); // Lance la première lecture
}

// --- Gestion des fausses popups (mieux que alert()) ---
function showFakePopups(number) {
    const messages = [
        "Erreur système critique !",
        "Pilote introuvable !",
        "Fichier corrompu !",
        "Mise à jour impossible !",
        "Attention, virus détecté !"
    ];
    let created = 0;
    let interval = setInterval(() => {
        if (created >= number) {
            clearInterval(interval);
            return;
        }
        const popup = document.createElement('div');
        popup.classList.add('fake-popup');
        popup.textContent = messages[created % messages.length];
        // Positionnement aléatoire des popups
        popup.style.top = `${Math.random() * 70 + 10}%`; // Entre 10% et 80% de la hauteur
        popup.style.left = `${Math.random() * 70 + 10}%`; // Entre 10% et 80% de la largeur
        popup.style.transform = 'translate(-50%, -50%)'; // Centre le popup sur le point généré
        popupContainer.appendChild(popup);

        setTimeout(() => {
            popup.remove(); // Fait disparaître la popup après 5 secondes
        }, 5000);
        created++;
    }, 800); // Une nouvelle popup toutes les 0.8 secondes
}

// --- Gestion des entrées dans la barre de recherche ---
function handleSearchInput(e) {
  let val = e.target.value.toLowerCase();

  // Jokes spécifiques pour certains mots-clés
  if (val.includes('fail')) {
    status.textContent = "Oops, échec détecté, comme votre tentative de déjouer ce troll !";
  } else if (val.includes('bug')) {
    status.textContent = "Système en panique ! C'est le bug qui vous regarde, pas l'inverse.";
  } else if (val.includes('help')) {
    status.textContent = "Aide non disponible, c'est un troll ! Vous êtes seul face à votre destin.";
  }
  // Easter egg pour arrêter le troll
  else if (val === 'easter egg') {
    endTroll();
  }
  // Jokes génériques pour du texte alphabétique
  else if (/^[a-z]+$/.test(val) && !val.includes('easter egg')) {
    const jokes = [
      "Tu tapes du texte, Kevin ? Sérieux ?",
      "Je vois ce que tu fais... ce n'est pas très malin.",
      "Arrête de chercher, ce n'est qu'un troll !",
      "T'as pas mieux à faire que de nourrir ce système ?!",
      "Votre clavier est maintenant sous le contrôle du troll."
    ];
    status.textContent = jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Rickroll si des voyelles sont tapées (sauf pour l'easter egg pour ne pas gâcher la surprise)
  if (/[aeiouy]/.test(val) && !val.includes('easter egg') && Math.random() < 0.2) { // 20% de chance
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
  }
}

// --- Logique du Morpion imbattable (basée sur l'algorithme Minimax) ---
const morpionBoard = ['', '', '', '', '', '', '', '', ''];
const player = 'X'; // Le joueur humain
const computer = 'O'; // L'ordinateur (le troll)

function initMorpion() {
  morpionContainer.innerHTML = '<h3>Bot Morpion imbattable</h3><p id="message"></p><div id="board"></div>';
  const boardDiv = document.getElementById('board');
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = "C'est à vous (X) !";

  for(let i=0; i<9; i++) {
    const cell = document.createElement('div');
    cell.dataset.index = i;
    cell.addEventListener('click', playerMove);
    boardDiv.appendChild(cell);
    morpionBoard[i] = ''; // Réinitialise l'état du tableau
  }
  resetMorpionUI(); // Réinitialise l'affichage
}

function playerMove(e) {
  const index = parseInt(e.target.dataset.index);
  if (morpionBoard[index] !== '' || checkWin(morpionBoard, player) || checkWin(morpionBoard, computer) || isBoardFull(morpionBoard)) return;

  morpionBoard[index] = player;
  e.target.textContent = player;
  e.target.classList.add('used');
  document.getElementById('message').textContent = "C'est à moi (O) !";

  if (checkWin(morpionBoard, player)) {
    document.getElementById('message').textContent = "Bravo ! Vous avez gagné ! (Par pure chance, sûrement)";
    setTimeout(resetMorpion, 2000);
    return;
  }

  if (isBoardFull(morpionBoard)) {
    document.getElementById('message').textContent = "Match nul ! Le troll ne perd jamais vraiment.";
    setTimeout(resetMorpion, 2000);
    return;
  }

  setTimeout(computerMove, 500); // Laisse un petit délai pour le "réflexion" du bot
}

function computerMove() {
  let move = findBestMove(morpionBoard, computer);
  if (move !== -1) {
    morpionBoard[move] = computer;
    const boardDiv = document.getElementById('board');
    if (boardDiv && boardDiv.children[move]) {
      boardDiv.children[move].textContent = computer;
      boardDiv.children[move].classList.add('used');
    }
  }

  if (checkWin(morpionBoard, computer)) {
    document.getElementById('message').textContent = "Je gagne à chaque fois ! Votre PC est mon esclave ! 😈";
    if (imageTroll) imageTroll.style.display = 'block'; // Affiche l'image de troll
    setTimeout(resetMorpion, 2000);
    return;
  }

  if (isBoardFull(morpionBoard)) {
    document.getElementById('message').textContent = "Match nul ! Le troll ne perd jamais vraiment.";
    setTimeout(resetMorpion, 2000);
    return;
  }

  document.getElementById('message').textContent = "C'est à vous (X) !";
}

function findBestMove(board, playerTurn) {
  let bestScore = (playerTurn === computer) ? -Infinity : Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = playerTurn;
      let score = minimax(board, 0, playerTurn === computer, player, computer);
      board[i] = ''; // Annule le mouvement

      if (playerTurn === computer) {
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing, currentPlayerSymbol, opponentPlayerSymbol) {
  if (checkWin(board, computer)) return 10 - depth;
  if (checkWin(board, player)) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = computer;
        let score = minimax(board, depth + 1, false, player, computer);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = player;
        let score = minimax(board, depth + 1, true, player, computer);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWin(board, currentSymbol) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
    [0, 4, 8], [2, 4, 6]             // diagonales
  ];
  return winPatterns.some(pattern =>
    pattern.every(index => board[index] === currentSymbol)
  );
}

function isBoardFull(board) {
  return board.every(cell => cell !== '');
}

function resetMorpion() {
  morpionBoard.fill('');
  resetMorpionUI();
  document.getElementById('message').textContent = "Nouvelle partie ! C'est à vous (X) !";
  if (imageTroll) imageTroll.style.display = 'none'; // Cache l'image du troll
}

function resetMorpionUI() {
    const boardDiv = document.getElementById('board');
    if (!boardDiv) return;
    for(let cell of boardDiv.children) {
        cell.textContent = '';
        cell.classList.remove('used');
    }
}

// --- Fonction pour mettre fin au troll (Easter Egg) ---
function endTroll() {
  alert('Easter Egg détecté : Fin du troll ! Merci d\'avoir joué.');
  location.reload(); // Recharge la page pour tout remettre à zéro
}

// --- Démarrage de la progression au chargement de la page ---
window.onload = () => {
  updateProgress();
};
