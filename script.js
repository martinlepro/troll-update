// Niveau de troll (1 à 15)
let trollLevel = 1;

// Éléments DOM
const progressBar = document.getElementById('progress');
const status = document.getElementById('status');
const searchBar = document.getElementById('search-bar');
const morpionContainer = document.getElementById('morpion-container');
const popupContainer = document.getElementById('popup-container');
const errorSound = document.getElementById('error-sound');
const imageTroll = document.getElementById('image-troll');

let progress = 0;
let degoulinantText = null;

// Lancement de la progression
function updateProgress() {
  if (progress < 100) {
    progress += Math.random() * 5;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + '%';
    status.textContent = `Mise à jour en cours... ${Math.floor(progress)}%`;
    setTimeout(updateProgress, 300);
  } else {
    status.textContent = "Mise à jour terminée !";
    triggerTroll();
  }
}

// Lancement du troll complet selon niveau
function triggerTroll() {
  trollLevel = 15; // Passe au niveau max pour la démo

  if (trollLevel >= 3) {
    document.body.classList.add('cursor-pale'); // Curseur pâle
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
    morpionContainer.style.display = 'block';
    initMorpion();
  }

  if (trollLevel >= 9) {
    searchBar.addEventListener('input', handleSearchInput);
  }

  if (trollLevel >= 11) {
    // Affiche image troll au début (ou à la perte)
    imageTroll.style.display = 'block';
  }
}

// Texte dégoulinant animé
function showDegoulinantText() {
  degoulinantText = document.createElement('div');
  degoulinantText.id = 'degoulinant-text';
  degoulinantText.textContent = 'MAJ TERMINÉE - VOTRE PC EST INFECTÉ (CECI EST UN TROLL)';
  document.body.appendChild(degoulinantText);
  setTimeout(() => {
    degoulinantText.style.opacity = '0';
    degoulinantText.style.transform = 'translate(-50%, 100%)';
    setTimeout(() => {
      degoulinantText.remove();
    }, 5000);
  }, 3000);
}

// Lecture des sons d’erreur
function playErrorSound(times) {
  let count = 0;
  error
