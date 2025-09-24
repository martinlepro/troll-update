let trollLevel = 0;
let progress = 0;
let degoulinantText = null;
let calculatorInitialized = false;
let morpionCells = []
let morpionLocked = false;;
let popupCount = 0;
let activatedAlerts = new Set();
let matrixRainInterval = null;
let popupInterval = null; // Pour gérer l'intervalle de réapparition des popups

// Pour suivre les effets de troll qui ont déjà déclenché leur "rafale initiale"
let initialTrollEffectsTriggered = new Set();

// Variables pour le système de redémarrage
let errorCounter = 0;
const RESTART_ERROR_THRESHOLD = 5; // Le nombre d'erreurs avant de déclencher le redémarrage
let restartSequenceActive = false; // Drapeau pour indiquer si une séquence de redémarrage est en cours
let spinnerSpeedInterval = null; // Pour contrôler l'intervalle de vitesse du spinner
let currentProgressTimeout = null; // Pour stocker le timeout de updateProgress afin de pouvoir l'arrêter

// Contrôle si le popupInterval peut être démarré ou reprendre.
let canGenerateIntervalPopups = true;


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
const resetMorpionBtn = document.getElementById("reset-morpion-btn"); // Récupérer le bouton Recommencer Morpion

// Éléments des boutons
const startTrollBtn = document.getElementById("start-troll-btn");
const fleeingCancelBtn = document.getElementById("fleeing-cancel-btn");
const realCancelBtnHidden = document.getElementById("real-cancel-btn-hidden"); // Le bouton caché


// Éléments pour le spinner de redémarrage
const windowsRestartSpinnerElement = document.getElementById("windows-restart-spinner");
const spinningCircleElement = windowsRestartSpinnerElement ? windowsRestartSpinnerElement.querySelector(".spinning-circle") : null;


// Tableau de messages troll pour les popups
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

let globalClickCount = 0;
document.addEventListener('click', () => {
  globalClickCount++;
  if (globalClickCount % 10 === 0) {
    const errorSound = document.getElementById('error-sound');
    if (errorSound) {
      errorSound.currentTime = 0;
      errorSound.play().catch(() => {});
    }
  }
});


// --- LOGIQUE POUR LE PLEIN ÉCRAN ET LES TOUCHES DE SORTIE ---
let isTrollActive = false;
let hasEnteredFullscreenOnce = false;

// Fonction pour réinitialiser le jeu de morpion
function resetMorpion() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  updateBoard();
  // Ne pas appeler setStatus ici car il n'est pas défini globalement,
  // et le resetAll gère le message de status.
  // setStatus(`Joueur ${currentPlayer} commence`);
}

// Ajout du listener sur le bouton reset-morpion-btn
// NOTE: Ce listener est déplacé plus bas pour s'assurer que resetMorpionBtn est défini.


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
            // Cette partie ne devrait plus démarrer le troll directement si le bouton est utilisé
            // On s'assure juste que si l'API fullscreen n'est pas supportée, le troll démarre quand même.
            if (!isTrollActive && startTrollBtn.style.display === 'none') { // Si le bouton a été cliqué mais fullscreen a échoué
                 startTrollMechanism();
            }
        });
    } else {
        console.warn("API Fullscreen non supportée par le navigateur. Démarrage direct du troll.");
        if (!isTrollActive && startTrollBtn.style.display === 'none') { // Si le bouton a été cliqué mais fullscreen a échoué
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
  status.style.display = 'none'; // Cacher le statut initial

  document.querySelectorAll('.fixed-element').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.close-button').forEach(button => button.style.display = 'none');

  startTrollBtn.style.display = 'block'; // Afficher le bouton de démarrage

  // Correction: handleInitialClick n'existe plus, donc cette ligne est supprimée.
  // document.removeEventListener('click', handleInitialClick);
  // L'écouteur global pour ré-entrer en fullscreen reste actif.
  document.addEventListener('click', handleReEnterFullscreen);
  console.log("Application initialisée, en attente du clic sur le bouton de démarrage.");
}

// Fonction pour gérer le clic sur le bouton de démarrage
function handleStartTrollButtonClick() {
    console.log("Bouton de démarrage cliqué, démarre le processus.");
    startTrollBtn.style.display = 'none'; // Cacher le bouton de démarrage

    mainTitle.style.display = 'block';
    progressBarElement.style.display = 'block';
    searchBarWrapper.style.display = 'flex';
    submitSearchBtn.style.display = 'inline-block';
    status.style.display = 'block'; // Réafficher le statut
    status.textContent = "Mise à jour en cours..."; // Message initial

    document.querySelectorAll('.close-button').forEach(button => button.style.display = 'block');

    // Afficher les boutons d'annulation
    fleeingCancelBtn.style.display = 'block';
    realCancelBtnHidden.style.display = 'block'; // Rendre le bouton caché "disponible"
    const xpAudio = document.getElementById('xp-startup');
    if (xpAudio) { xpAudio.currentTime = 0; xpAudio.play().catch(()=>{}); }

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
    if (restartSequenceActive) return; // Ne pas mettre à jour la barre si un redémarrage est en cours

    if (progress < 100) {
        progress += Math.random() * 5;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + "%";
        status.textContent = `Mise à jour en cours... ${Math.floor(progress)}%`;
        currentProgressTimeout = setTimeout(updateProgress, 300); // Stocker le timeout
    } else {
        status.textContent = "Mise à jour terminée. Démarrage des services.";
        console.log("Progression à 100%. Démarrage du niveau 1.");
        if (trollLevel === 0) { // Si aucun niveau n'est actif, passer au niveau 1
            activateTrollEffects(1);
        }
        currentProgressTimeout = null; // La progression est terminée
    }
}


function activateTrollEffects(newLevel) {
    if (restartSequenceActive) {
        console.log("Ignorer l'activation de troll pendant la séquence de redémarrage.");
        return;
    }
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
  activateFakeCursorsForLevel(parsedNewLevel)

  if (trollLevel >= 1) {
      searchBarWrapper.style.display = 'flex'; // Rendre le conteneur visible
      searchBar.disabled = false;
      submitSearchBtn.style.display = 'inline-block';
      if (trollLevel === 1 && !restartSequenceActive) { // Ne pas écraser le message de redémarrage si actif
          status.textContent = "Mise à jour terminée. Le système est en attente d'instructions.";
      }
  } else {
      searchBar.disabled = true;
      submitSearchBtn.style.display = 'none';
      // Optionnel: Cacher searchBarWrapper quand le trollLevel est 0.
      // searchBarWrapper.style.display = 'none';
  }

  if (trollLevel >= 14 && !document.fullscreenElement) {
      enableCursorJitter();
      console.log("Jitter (Niveau 14) réactivé après changement de niveau (hors plein écran).");
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
            // NOUVEAU: Ne pas incrémenter le compteur d'erreurs pour l'activation directe du niveau 5
            playErrorSound(1, false);
            console.log("Niveau 5: Son d'erreur activé.");
            break;
        case 6:
            // CORRECTION: Ne pas incrémenter le compteur d'erreurs pour l'activation directe du niveau 6
            playErrorSound(5, false);
            console.log("Niveau 6: Sons d'erreur répétés activés.");
            break;
        case 7:
            popupContainer.style.display = 'block';
            // Ne déclencher la rafale initiale de 5 popups que si le niveau 7 n'a pas été initialisé depuis le dernier reset.
            if (!initialTrollEffectsTriggered.has(7)) {
                // La rafale initiale NE DOIT PAS compter pour les erreurs déclenchant le redémarrage.
                showFakePopups(5, false);
                initialTrollEffectsTriggered.add(7); // Marquer comme "initialisé" pour ne pas le refaire
            }

            // Seulement démarrer popupInterval si autorisé par canGenerateIntervalPopups
            if (!popupInterval && canGenerateIntervalPopups) {
                // Les popups générées par l'intervalle DOIVENT compter pour les erreurs déclenchant le redémarrage.
                popupInterval = setInterval(() => showFakePopups(Math.floor(Math.random() * 3) + 1, true), 5000);
                console.log("Popup interval started/restarted.");
            } else if (popupInterval && !canGenerateIntervalPopups) {
                // Si l'intervalle tourne mais ne devrait pas (ce cas est généralement géré par triggerRestartSequence)
                clearInterval(popupInterval);
                popupInterval = null;
                console.log("Popup interval stopped because canGenerateIntervalPopups is false.");
            }
            console.log("Niveau 7: Popups activées avec réapparition.");
            break;
        case 8:
            morpionContainer.style.display = 'block';
            initMorpion();
            console.log("Niveau 8: Morpion activé.");
            break;
        case 9:
            console.log("Niveau 9: Comportement de la barre de recherche modifié.");
            if (level => 9) {
  showPong();
            }
            break;
        case 10:
            rickrollVideo.style.display = 'block';
            rickrollVideo.muted = false; // Démute la vidéo
            rickrollVideo.play();
            console.log("Niveau 10: Rickroll activé.");
            break;
        case 11:
            imageTroll.style.display = 'block';
            subwaySurferVideo.style.display = 'block';
            subwaySurferVideo.muted = false; // Démute la vidéo
            subwaySurferVideo.play();
            console.log("Niveau 11: Image Troll et Subway Surfer activés.");
            break;
        case 12:
            if (!activatedAlerts.has(12)) {
                showCustomAlert("Activation de troll.vbs - (faux script externe, ne fait rien en vrai)");
                activatedAlerts.add(12);
                console.log("Niveau 12: Alerte .vbs déclenchée.");
            }
            showFakeExplorer()
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

function startTrollLevel(n) {
  activateTrollEffects(n);
}


function resetAll() {
  morpionLocked = false;
  console.log("Exécution de resetAll().");
  document.body.classList.remove("cursor-pale");

  // Masque tous les éléments 'fixed-element'
  document.querySelectorAll('.fixed-element').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.close-button').forEach(button => button.style.display = 'none');


  let boardElement = morpionContainer.querySelector('#board'); // Assurez-vous d'utiliser l'élément du morpion
  if (boardElement) boardElement.innerHTML = '';
  morpionCells = [];

  popupContainer.innerHTML = "";
  popupCount = 0;
  if (popupInterval) {
      clearInterval(popupInterval);
      popupInterval = null;
      console.log("Intervalle des popups arrêté.");
  }
  popupContainer.style.display = 'none'; // S'assurer que le conteneur de popups est caché

  subwaySurferVideo.pause();
  subwaySurferVideo.currentTime = 0;
  subwaySurferVideo.muted = true; // Remettre en muet

  rickrollVideo.pause();
  rickrollVideo.currentTime = 0;
  rickrollVideo.muted = true; // Remettre en muet

  if (degoulinantText) {
    degoulinantText.remove();
    degoulinantText = null;
  }
  stopMatrixRain();
  matrixRainContainer.innerHTML = '';

  disableCursorJitter();

  // Cacher le spinner de redémarrage et arrêter sa boucle
  if (windowsRestartSpinnerElement) windowsRestartSpinnerElement.style.display = 'none';
  stopRestartSpinnerSpeedLoop();

  mainTitle.style.display = 'block';
  progressBarElement.style.display = 'block';
  progressBar.style.width = '0%';
  progress = 0;

  searchBarWrapper.style.display = 'flex'; // Le reset doit aussi rendre la barre visible
  searchBar.disabled = true;
  submitSearchBtn.style.display = 'none';
  searchBar.value = '';
  // Supprimer le bouton "Tout arrêter" si présent
  const stopAllBtn = document.getElementById('stop-all-btn');
  if (stopAllBtn) stopAllBtn.remove();

  status.textContent = "Système réinitialisé. Entrez un niveau pour activer le troll.";
  status.style.display = 'block'; // S'assurer que le status est visible

  trollLevel = 0;
  activatedAlerts.clear();
  customAlertContainer.style.display = 'none';

  // Réinitialiser les variables du système de redémarrage et le set des initialTrollEffects
  errorCounter = 0;
  restartSequenceActive = false;
  initialTrollEffectsTriggered.clear(); // VIDE LE SET ICI
  canGenerateIntervalPopups = true; // Réinitialiser le flag de génération de popups par intervalle


  if (currentProgressTimeout) { // S'assurer qu'aucun ancien timeout n'est actif
      clearTimeout(currentProgressTimeout);
      currentProgressTimeout = null;
  }

  // Cacher les boutons d'annulation après un reset complet
  fleeingCancelBtn.style.display = 'none';
  realCancelBtnHidden.style.display = 'none';
  // Afficher le bouton de démarrage après un reset complet
  startTrollBtn.style.display = 'block';

  isTrollActive = false; // Désactiver l'état de troll
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  window.removeEventListener('keydown', handleGlobalKeyDown);
  window.removeEventListener('beforeunload', handleBeforeUnload);
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


// Ajout du paramètre incrementErrorCounter
function playErrorSound(times, incrementErrorCounter = true) {
    if (restartSequenceActive) return; // Ne pas compter les erreurs pendant le redémarrage

    let count = 0;
    function play() {
        if (errorSound) {
            errorSound.currentTime = 0;
            errorSound.play().catch(e => console.warn("Erreur de lecture audio:", e));
            count++;
            if (count < times) {
                setTimeout(play, 800);
            } else { // Une fois que tous les sons demandés ont été joués
                if (incrementErrorCounter) {
                    errorCounter++;
                    console.log(`Erreur ${errorCounter}/${RESTART_ERROR_THRESHOLD}.`);
                    if (errorCounter >= RESTART_ERROR_THRESHOLD) {
                        triggerRestartSequence(); // Déclencher la séquence de redémarrage
                    }
                }
            }
        } else {
            console.warn("Element audio 'error-sound' non trouvé.");
        }
    }
    play();
    console.log(`Son d'erreur demandé ${times} fois (compte errors: ${incrementErrorCounter}).`);
}


// Ajout du paramètre countErrors
function showFakePopups(count, countErrors = true) {
    if (restartSequenceActive) return; // Ne pas afficher de popups pendant le redémarrage

    for (let i = 0; i < count; i++) {
        // Retarder l'apparition de chaque popup de 0.2s
        setTimeout(() => {
            const popup = document.createElement("div");
            popup.classList.add("fake-popup");

            const randomMessage = trollMessages[Math.floor(Math.random() * trollMessages.length)];
            popup.textContent = randomMessage;

            const closeBtn = document.createElement("span");
            closeBtn.classList.add("close-button");
            closeBtn.textContent = "×";
            closeBtn.onclick = () => {
                popup.remove();
                console.log("Popup fermée manuellement.");
            };
            popup.appendChild(closeBtn);

            // Positionnement aléatoire pour éviter un empilement trop parfait
            const randomX = Math.random() * (popupContainer.offsetWidth - 200); // 200px est une largeur min estimée pour la popup
            popup.style.left = `${randomX > 0 ? randomX : 0}px`;
            popup.style.top = `${Math.random() * 50}px`; // Légèrement aléatoire en hauteur

            // Appliquer la nouvelle animation et la gérer
            popup.style.animation = 'popupFloatAndFade 1s forwards'; // Animation de 1 seconde

            popupContainer.appendChild(popup);
            popupCount++;
            console.log(`Popup n°${popupCount} affichée.`);

            playErrorSound(1, countErrors); // Passer le flag ici

            // Supprimer la popup après 1 seconde
            setTimeout(() => {
                if (popup.parentNode) { // Vérifier si la popup existe toujours (pas fermée manuellement)
                    popup.remove();
                }
            }, 1000); // La popup est supprimée après 1 seconde
        }, i * 200); // Délai de 200ms entre chaque popup d'un même lot
    }
    console.log(`${count} fausses popups demandées (compte errors: ${countErrors}).`);
}


function triggerRestartSequence() {
    if (restartSequenceActive) return; // Empêche les activations multiples
    restartSequenceActive = true;
    errorCounter = 0; // Réinitialise le compteur d'erreurs pour la prochaine fois
    console.log("Séquence de redémarrage déclenchée !");

    // Arrêter la progression normale si elle est en cours
    if (currentProgressTimeout) {
        clearTimeout(currentProgressTimeout);
        currentProgressTimeout = null;
    }

    // Cacher les éléments UI principaux du troll en cours
    mainTitle.style.display = 'none';
    progressBarElement.style.display = 'none';
    searchBarWrapper.style.display = 'none';
    popupContainer.style.display = 'none'; // Cacher les popups existantes
    morpionContainer.style.display = 'none'; // Cacher le morpion
    calculatorContainer.style.display = 'none'; // Cacher la calculatrice
    rickrollVideo.style.display = 'none'; // Cacher les vidéos
    rickrollVideo.muted = true; // Remettre en muet
    subwaySurferVideo.style.display = 'none';
    subwaySurferVideo.muted = true; // Remettre en muet
    imageTroll.style.display = 'none';
    if (degoulinantText) degoulinantText.style.display = 'none';
    stopMatrixRain();

    // Cacher les boutons d'annulation pendant le redémarrage
    fleeingCancelBtn.style.display = 'none';
    realCancelBtnHidden.style.display = 'none';


    // Empêcher le popupInterval de redémarrer immédiatement et le stopper s'il est actif
    canGenerateIntervalPopups = false;
    if (popupInterval) {
        clearInterval(popupInterval);
        popupInterval = null;
        console.log("Popup interval cleared during restart.");
    }


    status.textContent = "La mise à jour a échoué ; redémarrage en cours...";
    status.style.fontSize = '3vw'; // S'assurer que le texte est bien visible
    status.style.display = 'block'; // S'assurer que le status est visible

    setTimeout(() => {
        status.textContent = "redémarrage de l'ordina4te2tur ¡";
        
        if (windowsRestartSpinnerElement) {
            windowsRestartSpinnerElement.style.display = 'block';
            startRestartSpinnerSpeedLoop(); // Démarrer l'animation de vitesse du spinner
        }

        // Simuler la durée du redémarrage (par exemple, 15 secondes pour le spinner et les messages)
        setTimeout(() => {
            console.log("Séquence de redémarrage terminée. Reprise de la progression.");
            if (windowsRestartSpinnerElement) windowsRestartSpinnerElement.style.display = 'none';
            stopRestartSpinnerSpeedLoop(); // Arrêter l'ajustement de la vitesse du spinner

            // Réinitialiser la progression et relancer la barre principale
            progress = 0;
            status.textContent = `Redémarrage terminé. Reprise de la mise à jour... 0%`; // Message initial de reprise
            mainTitle.style.display = 'block';
            progressBarElement.style.display = 'block';
            progressBar.style.width = '0%';

            restartSequenceActive = false; // Permettre de redéclencher le redémarrage
            updateProgress(); // Relancer la barre de progression

            // Forcer la réapparition de la barre de recherche ici.
            searchBarWrapper.style.display = 'flex'; // Assure que le wrapper est visible
            searchBar.disabled = false; // Et s'assure que l'input est activé
            submitSearchBtn.style.display = 'inline-block'; // Et le bouton soumission visible

            // Réafficher les boutons d'annulation après le redémarrage
            fleeingCancelBtn.style.display = 'block';
            realCancelBtnHidden.style.display = 'block';
            
            // Si le trollLevel est 0 au moment du redémarrage, ajuster le message pour l'utilisateur
            if (trollLevel === 0) { 
                 status.textContent = "Système opérationnel. Entrez un niveau pour activer le troll.";
            }

            // Réactiver les effets du niveau de troll actuel.
            // La barre de recherche est déjà gérée ci-dessus, donc pas de souci de double-activation.
            if (trollLevel > 0) {
                 activateTrollEffects(trollLevel);
            }

            // Planifier la réactivation de la génération de popups par intervalle après un délai de grâce
            setTimeout(() => {
                canGenerateIntervalPopups = true;
                console.log("canGenerateIntervalPopups set to true.");
                // Si le niveau 7 est toujours actif ET que l'intervalle n'est pas encore redémarré, le relancer
                if (trollLevel === 7 && !popupInterval) {
                    // Les popups générées par l'intervalle DOIVENT compter pour les erreurs.
                    popupInterval = setInterval(() => showFakePopups(Math.floor(Math.random() * 3) + 1, true), 5000);
                    console.log("Popup interval re-established after restart grace period.");
                }
            }, 5000); // Délai de grâce de 5 secondes après la fin du redémarrage
        }, 15000); // Le spinner sera visible et changera de vitesse pendant 15 secondes
    }, 3000); // Le deuxième message apparaît 3 secondes après le premier
}

// Faux curseurs mobiles et interactifs
let fakeCursors = [];
let fakeCursorInterval = null;
let realMousePos = {x: window.innerWidth/2, y: window.innerHeight/2};

document.addEventListener('mousemove', (e) => {
    realMousePos.x = e.clientX;
    realMousePos.y = e.clientY;
});

// Ajoute dans ton HTML : <div id="fake-cursors-container" style="pointer-events:none;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;"></div>

function spawnFakeCursors(n) {
    const container = document.getElementById('fake-cursors-container');
    if (!container) return;
    container.innerHTML = '';
    fakeCursors = [];
    for (let i=0; i<n; i++) {
        let c = document.createElement('img');
        c.src = 'cursor-pale.cur'; // ou 'cursor.png' si tu veux une image png de curseur
        c.style.position = 'fixed';
        c.style.width = '32px';
        c.style.height = '32px';
        c.style.left = (Math.random()*window.innerWidth) + "px";
        c.style.top = (Math.random()*window.innerHeight) + "px";
        c.style.pointerEvents = 'none';
        container.appendChild(c);
        fakeCursors.push({
            elt: c,
            x: Math.random()*window.innerWidth,
            y: Math.random()*window.innerHeight,
            dx: (Math.random()-0.5)*5,
            dy: (Math.random()-0.5)*5
        });
    }
    if (fakeCursorInterval) clearInterval(fakeCursorInterval);
    fakeCursorInterval = setInterval(animateFakeCursors, 30);
}

function animateFakeCursors() {
    fakeCursors.forEach(cur => {
        cur.x += cur.dx;
        cur.y += cur.dy;
        if (cur.x < 0 || cur.x > window.innerWidth-32) cur.dx *= -1;
        if (cur.y < 0 || cur.y > window.innerHeight-32) cur.dy *= -1;
        cur.elt.style.left = cur.x+"px";
        cur.elt.style.top = cur.y+"px";
        // Collision avec vraie souris
        let dist = Math.hypot(cur.x-realMousePos.x, cur.y-realMousePos.y);
        if (dist < 32) {
            // Essaie de bouger la souris (window.moveBy si possible)
            // Mais window.moveBy déplace la fenêtre, pas la souris, donc simule un "saut"
            window.scrollBy(0,0);
            try {
                // Simule un effet de "saut"
                window.scrollBy(Math.random()<0.5?30:-30, Math.random()<0.5?30:-30);
                // Après avoir déplacé un curseur :
         const popups = document.querySelectorAll('.fake-popup, #image-troll');
         popups.forEach(popup => {
         const rect = popup.getBoundingClientRect();
         if (
                cur.x + 16 > rect.left && cur.x + 16 < rect.right &&
                cur.y + 16 > rect.top && cur.y + 16 < rect.bottom
                ) {
         // Colle la popup au curseur
        popup.style.position = 'fixed';
        popup.style.left = (cur.x - rect.width/2) + 'px';
        popup.style.top = (cur.y - rect.height/2) + 'px';
  }
});
                // Pour chaque cellule du morpion
        const morpionCellsDom = document.querySelectorAll('#board > div');
        morpionCellsDom.forEach(cell => {
        const rect = cell.getBoundingClientRect();
        if (
                cur.x + 16 > rect.left && cur.x + 16 < rect.right &&
                cur.y + 16 > rect.top && cur.y + 16 < rect.bottom
              ) {
        if (!cell.classList.contains("used") && cell.textContent === "") {
        cell.textContent = ["O", "X"][Math.floor(Math.random()*2)];
        cell.classList.add("used");
    }
  }
});
        if (trollLevel >= 15) {
               popup.onmouseover = () => {
               popup.style.left = (Math.random() * 70) + "vw";
               popup.style.top = (Math.random() * 70) + "vh";
  }
                }
            } catch(e){}
        }
    });
}

// À appeler à chaque changement de niveau de troll (par exemple dans activateTrollEffects)
function activateFakeCursorsForLevel(level) {
    let n = Math.max(0, level-2);
    if (n > 0) spawnFakeCursors(n);
    else {
        document.getElementById('fake-cursors-container').innerHTML = '';
        if (fakeCursorInterval) clearInterval(fakeCursorInterval);
    }
}

function startRestartSpinnerSpeedLoop() {
    if (!spinningCircleElement) return;
    let currentSpeed = 2000; // 2s (2000ms) pour une rotation complète (vitesse initiale)
    let direction = 1; // 1 pour accélérer, -1 pour ralentir
    const minSpeed = 300; // 0.3s (très rapide)
    const maxSpeed = 3000; // 3s (très lent)
    const step = 200; // Augmentation/diminution de la vitesse

    spinnerSpeedInterval = setInterval(() => {
        currentSpeed += direction * step;

        if (currentSpeed <= minSpeed) {
            currentSpeed = minSpeed;
            direction = 1; // Commence à accélérer à nouveau
        } else if (currentSpeed >= maxSpeed) {
            currentSpeed = maxSpeed;
            direction = -1; // Commence à ralentir
        }
        spinningCircleElement.style.animationDuration = `${currentSpeed / 1000}s`;
    }, 500); // Vérifier et ajuster la vitesse toutes les 500ms
    console.log("Boucle de vitesse du spinner démarrée.");
}

function stopRestartSpinnerSpeedLoop() {
    if (spinnerSpeedInterval) {
        clearInterval(spinnerSpeedInterval);
        spinnerSpeedInterval = null;
        if (spinningCircleElement) {
            spinningCircleElement.style.animationDuration = '2s'; // Réinitialiser à la vitesse par défaut
        }
    }
    console.log("Boucle de vitesse du spinner arrêtée.");
}

function triggerBSOD() {
  if (document.getElementById('bsod')) return;
  let bsod = document.createElement('div');
  bsod.id = 'bsod';
  bsod.innerHTML = `
    <h1 style="font-size:3vw">:(</h1>
    <p style="font-size:2vw">Un problème a été détecté et Windows a été arrêté pour éviter d'endommager votre ordinateur.</p>
    <p style="font-size:1.5vw">Appuyez sur une touche pour redémarrer...</p>
  `;
  document.body.appendChild(bsod);
  document.addEventListener('keydown', () => { bsod.remove(); location.reload(); }, { once: true });
}

function initMorpion() {
    morpionCells = Array(9).fill("");
    morpionLocked = false;

    let currentBoardElement = morpionContainer.querySelector('#board');
    if (!currentBoardElement) {
        morpionContainer.innerHTML = "<h3>Jouez pendant que ça installe...</h3>";
        currentBoardElement = document.createElement("div");
        currentBoardElement.id = "board";
        morpionContainer.insertBefore(currentBoardElement, resetMorpionBtn);
    } else {
        currentBoardElement.innerHTML = '';
    }

    // Nouveau : Message sous le plateau
    let morpionMessageElt = morpionContainer.querySelector('#morpion-message');
    if (!morpionMessageElt) {
        morpionMessageElt = document.createElement('div');
        morpionMessageElt.id = 'morpion-message';
        morpionMessageElt.style.marginTop = "10px";
        morpionMessageElt.style.fontWeight = "bold";
        morpionContainer.appendChild(morpionMessageElt);
    }
    showMorpionMessage("C'est à vous de commencer !", "yellow");

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.dataset.index = i;
        cell.addEventListener("click", () => {
            if (morpionLocked) return;
            if (!cell.classList.contains("used") && morpionCells[i] === "") {
                cell.textContent = "X";
                cell.classList.add("used");
                morpionCells[i] = "X";
                let winner = checkWinner(morpionCells);
                if (winner === null) {
                    showMorpionMessage("C'est le tour de O", "cyan");
                    morpionLocked = true;
                    setTimeout(() => {
                        const move = getBestMove(morpionCells);
                        if (move !== null) {
                            const computerCell = currentBoardElement.children[move];
                            if (computerCell) {
                                computerCell.textContent = "O";
                                computerCell.classList.add("used");
                                morpionCells[move] = "O";
                            }
                        }
                        let winner2 = checkWinner(morpionCells);
                        if (winner2 === "X" || winner2 === "O") {
                            showMorpionMessage(winner2 + " a gagné !", "lime", true);
                        } else if (winner2 === "draw") {
                            showMorpionMessage("Égalité !", "orange", true);
                        } else {
                            showMorpionMessage("C'est le tour de X", "yellow");
                        }
                        morpionLocked = false;
                    }, 500);
                } else if (winner === "X" || winner === "O") {
                    showMorpionMessage(winner + " a gagné !", "lime", true);
                } else if (winner === "draw") {
                    showMorpionMessage("Égalité !", "orange", true);
                }
            }
        });
        currentBoardElement.appendChild(cell);
    }
    console.log("Morpion initialisé.");
}

function showMorpionMessage(msg, color, animate) {
    let elt = morpionContainer.querySelector('#morpion-message');
    if (!elt) return;
    elt.textContent = msg;
    elt.style.color = color || "yellow";
    elt.style.animation = "none";
    if (animate) {
        void elt.offsetWidth; // force reflow
        elt.style.animation = "morpionPulse 1s";
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
    // NE PAS déclencher de troll/redémarrage si niveau >= 15,
    // mais activer les effets normaux jusqu'à la calculatrice.
    if (niveau < 15) {
        activateTrollEffects(niveau);
    } else {
        activateTrollEffects(niveau); // la calculatrice s'affiche mais PAS de redémarrage troll
    }
    searchBar.value = '';
    // Ajouter le bouton "Tout arrêter" une seule fois
    if (!document.getElementById('stop-all-btn')) {
        const stopAllBtn = document.createElement('button');
        stopAllBtn.id = 'stop-all-btn';
        stopAllBtn.textContent = 'Tout arrêter';
        stopAllBtn.style.marginLeft = "15px";
        stopAllBtn.style.padding = "10px 18px";
        stopAllBtn.style.fontSize = "1.1em";
        stopAllBtn.onclick = function() {
            triggerRestartSequence(); // Déclenche le redémarrage troll
        };
        searchBarWrapper.appendChild(stopAllBtn);
    }
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

function spawnFakeFileFollower(x, y, message) {
  const file = document.createElement('div');
  file.textContent = "toi.txt";
  file.style.position = "fixed";
  file.style.left = x + "px";
  file.style.top = y + "px";
  file.style.background = "#222";
  file.style.color = "white";
  file.style.padding = "8px";
  file.style.borderRadius = "5px";
  file.style.zIndex = 10000;
  file.style.fontFamily = "monospace";
  file.onclick = () => alert(message);
  document.body.appendChild(file);
  setTimeout(() => file.remove(), 4000);
}

// Ajoute cette ligne dans animateFakeCursors() :
if (Math.random() < 0.003) { // 0.3% de chance chaque frame, ou déclenchement par un event
  spawnFakeFileFollower(cur.x, cur.y, "En fait, ceci n'est pas un troll, mais un virus ...");
}

function handleSearchBarInputLive(e) {
    if (searchBar.disabled) {
        e.target.value = '';
        return;
    }

    const val = e.target.value.toLowerCase();
    if (val.length > 5 && val !== 'easter egg') {
        triggerBSOD();
    }

    if (trollLevel >= 10 && /[aeiouy]/.test(val)) {
        // La vidéo Rickroll est démuted par défaut quand le niveau 10 est actif.
        // On la montre si des voyelles sont tapées, mais elle est déjà censée être visible et jouée au niveau 10
        // Sauf si on veut un effet spécifique ici (e.g., flash de la vidéo)
        // Pour l'instant, pas de changement spécifique, elle se joue en arrière-plan.
    } else if (trollLevel < 10 && rickrollVideo.style.display === "block") {
        rickrollVideo.pause();
        rickrollVideo.currentTime = 0;
        rickrollVideo.muted = true; // Remettre en muet
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

document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const targetElement = event.target.closest('.fake-popup') || document.getElementById(event.target.dataset.target);
        if (targetElement) {
            targetElement.style.display = 'none';
            console.log(`Fermeture de l'élément: ${targetElement.id || 'popup'}`);
        }
    });
});


// --- Logique pour le bouton qui fuit ---
function moveFleeingButton(event) {
    if (fleeingCancelBtn.style.display !== 'block') return; // S'assurer que le bouton est visible
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const btnRect = fleeingCancelBtn.getBoundingClientRect();
    const btnX = btnRect.left + btnRect.width / 2;
    const btnY = btnRect.top + btnRect.height / 2;

    const distance = Math.sqrt(Math.pow(mouseX - btnX, 2) + Math.pow(mouseY - btnY, 2));

    const proximityThreshold = 150; // Distance à laquelle le bouton commence à fuir

    if (distance < proximityThreshold) {
        let newX = Math.random() * (window.innerWidth - btnRect.width);
        let newY = Math.random() * (window.innerHeight - btnRect.height);

        // S'assurer que le bouton reste visible
        newX = Math.max(0, Math.min(newX, window.innerWidth - btnRect.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - btnRect.height));

        fleeingCancelBtn.style.left = `${newX}px`;
        fleeingCancelBtn.style.top = `${newY}px`;
    }
}

function activateRickroll() {
    console.log("Le bouton d'annulation troll a été cliqué ! Rickroll !");
    rickrollVideo.style.display = 'block';
    rickrollVideo.muted = false; // Démute la vidéo Rickroll
    rickrollVideo.play().catch(e => console.warn("Erreur de lecture Rickroll:", e));
    // Optionnel : masquer le bouton de fuite après le clic
    fleeingCancelBtn.style.display = 'none';
}

// --- Logique pour le vrai bouton caché ---
function handleRealCancel() {
    console.log("Le VRAI bouton annuler a été cliqué ! Réinitialisation totale.");
    resetAll();
    exitFullscreenMode();
    // Une fois réinitialisé, on peut refaire apparaître le bouton de démarrage
    startTrollBtn.style.display = 'block';
    // S'assurer que les boutons d'annulation sont cachés après un "vrai" annuler
    fleeingCancelBtn.style.display = 'none';
    realCancelBtnHidden.style.display = 'none';
}

function showFakeExplorer() {
  const exp = document.getElementById('explorer-fake');
  exp.style.display = 'block';
  const files = document.getElementById('explorer-files');
  files.innerHTML = '';
  for(let i=0; i<30; i++) {
    const f = document.createElement('div');
    f.className = "explorer-file";
    f.textContent = "TROLLL" + i + ".txt";
    f.onclick = () => alert("Impossible d'ouvrir ce fichier, il est trop troll !");
    files.appendChild(f);
  }
}
// Appelle showFakeExplorer() quand tu veux (ex: niveau 12 ou bouton)

// --- PONG SIMPLE ---
let pongStarted = false;
function showPong() {
  if (pongStarted) return;
  pongStarted = true;
  const canvas = document.getElementById('pong-canvas');
  const ctx = canvas.getContext('2d');
  let playerY = canvas.height / 2 - 35;
  let botY = canvas.height / 2 - 35;
  const paddleHeight = 70, paddleWidth = 10;
  let ballX = canvas.width / 2, ballY = canvas.height / 2;
  let ballSpeedX = -5, ballSpeedY = 4;
  let up = false, down = false;
  let scorePlayer = 0, scoreBot = 0;

  canvas.style.display = 'block';

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Middle line
    ctx.strokeStyle = "white";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = "lime";
    ctx.fillRect(10, playerY, paddleWidth, paddleHeight);

    // Bot paddle
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width-20, botY, paddleWidth, paddleHeight);

    // Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();

    // Score
    ctx.font = "24px monospace";
    ctx.fillStyle = "white";
    ctx.fillText(scorePlayer, canvas.width/2-60, 30);
    ctx.fillText(scoreBot, canvas.width/2+40, 30);
  }

  function update() {
    // Player move
    if (up) playerY -= 8;
    if (down) playerY += 8;
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

    // Bot AI: always move towards the ball, fast and unfair!
    if (ballY > botY + paddleHeight/2) botY += 7 + Math.abs(ballSpeedX/2);
    else if (ballY < botY + paddleHeight/2) botY -= 7 + Math.abs(ballSpeedX/2);
    botY = Math.max(0, Math.min(canvas.height - paddleHeight, botY));

    // Ball move
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Collisions
    if (ballY < 10 || ballY > canvas.height-10) ballSpeedY = -ballSpeedY;

    // Player paddle
    if (ballX < 20 && ballY > playerY && ballY < playerY + paddleHeight) {
      ballSpeedX = -Math.abs(ballSpeedX) - 1; // La balle accélère
      ballSpeedY += (Math.random() - 0.5) * 4;
    }
    // Bot paddle
    if (ballX > canvas.width-30 && ballY > botY && ballY < botY + paddleHeight) {
      ballSpeedX = Math.abs(ballSpeedX) + 1; // La balle accélère
      ballSpeedY += (Math.random() - 0.5) * 4;
    }

    // Score
    if (ballX < 0) {
      scoreBot++;
      resetBall();
    }
    if (ballX > canvas.width) {
      scorePlayer++;
      resetBall();
    }
  }

  function resetBall() {
    ballX = canvas.width/2;
    ballY = canvas.height/2;
    ballSpeedX = -5 * (Math.random()<0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random()<0.5 ? 1 : -1);
  }

  function loop() {
    update();
    draw();
    if (scoreBot >= 5) {
      setTimeout(() => {
        canvas.style.display = 'none';
        pongStarted = false;
      }, 100);
      return;
    }
    requestAnimationFrame(loop);
  }

  // Controls
  window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowUp") up = true;
    if (e.key === "ArrowDown") down = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === "ArrowUp") up = false;
    if (e.key === "ArrowDown") down = false;
  });

  resetBall();
  loop();
}


// Enregistrement de tous les écouteurs d'événements après que le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Écouteurs pour la barre de recherche et le bouton de soumission
    searchBar.addEventListener("input", handleSearchBarInputLive);
    searchBar.addEventListener("keydown", handleSearchBarKeyDown);
    submitSearchBtn.addEventListener("click", handleSubmitSearchClick);

    // Écouteur d'événement pour le bouton de redémarrage du Morpion
    if (resetMorpionBtn) {
        resetMorpionBtn.addEventListener("click", initMorpion);
    }

    // Événements pour le bouton initial de démarrage
    startTrollBtn.addEventListener("click", handleStartTrollButtonClick);

    // Événements pour le bouton d'annulation qui fuit
    document.body.addEventListener('mousemove', moveFleeingButton);
    fleeingCancelBtn.addEventListener('click', activateRickroll);

    // Événements pour le vrai bouton d'annulation caché
    realCancelBtnHidden.addEventListener('click', handleRealCancel);

    // Initialisation du troll
    initializeTrollStartInteraction();
});








