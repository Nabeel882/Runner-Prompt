import * as UI from './ui.js';
import * as GameState from './gameState.js';
import * as Audio from './audio.js';
import { generateLevel } from './levels.js';

// --- GAME STATE ---
let currentLevelData = null;
let userAnswer = null;
let timerInterval = null;

// --- GAME FLOW ---
function startLevel(levelNumber) {
    currentLevelData = generateLevel(levelNumber);
    userAnswer = null;

    UI.setTheme(currentLevelData.theme);
    UI.updateGameHeader(levelNumber, GameState.getScore());
    UI.resetFeedback();
    UI.toggleGameButtons(true);

    UI.renderChallenge(currentLevelData, (selectedOption) => {
        userAnswer = selectedOption;
    });

    UI.showScreen(UI.screens.game);
    startTimer();
}

// --- TIMER ---
function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = 60; // 60 seconds per level
    UI.updateTimer(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        UI.updateTimer(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

function timeUp() {
    Audio.playSound('fail.mp3');
    UI.showFeedback(false, "انتهى الوقت! حاول أن تكون أسرع في المرة القادمة.", currentLevelData.correctAnswer, true);
    UI.toggleGameButtons(false);
    UI.checkAnswerBtn.disabled = true;
}

// --- ANSWER EVALUATION ---
function checkAnswer() {
    clearInterval(timerInterval); // Stop timer on answer
    const { type, correctAnswer } = currentLevelData;
    let isCorrect = false;
    let feedback = {};
    let userInput = '';

    switch (type) {
        case 'mcq':
            userInput = userAnswer;
            isCorrect = (userInput === correctAnswer);
            feedback = { isCorrect, feedbackText: isCorrect ? 'اختيار ممتاز!' : 'هذا ليس الخيار الأدق. حاول مرة أخرى.' };
            break;
        case 'forbid':
            userInput = UI.getFreeTextAnswer();
            const forbiddenWord = currentLevelData.forbiddenWord;
            const userWords = userInput.toLowerCase().split(/\s+/);
            if(userWords.includes(forbiddenWord.toLowerCase())) {
                 feedback = { isCorrect: false, feedbackText: `لقد استخدمت الكلمة الممنوعة "${forbiddenWord}"! حاول مرة أخرى.` };
            } else {
                 feedback = evaluateFreeText(userInput, correctAnswer);
            }
            break;
        case 'scramble':
            userInput = UI.getScrambledAnswer();
            isCorrect = (userInput === correctAnswer);
            feedback = { isCorrect, feedbackText: isCorrect ? 'ترتيب رائع!' : 'الترتيب غير صحيح. فكر في بنية الجملة.' };
            break;
        case 'correction':
        case 'creation':
            userInput = UI.getFreeTextAnswer();
            if (userInput.length < 5) {
                feedback = { isCorrect: false, feedbackText: "الأمر قصير جدًا. حاول إضافة المزيد من التفاصيل." };
            } else {
                feedback = evaluateFreeText(userInput, correctAnswer);
            }
            break;
    }
    
    handleFeedback(feedback, correctAnswer);
}

function evaluateFreeText(userInput, idealAnswer) {
    let score = 0;
    const userWords = new Set(userInput.split(/\s+/));
    const idealWords = new Set(idealAnswer.split(/\s+/));
    
    let intersection = new Set([...userWords].filter(x => idealWords.has(x)));
    score = (intersection.size / idealWords.size) * 100;
    
    let feedbackText = `نسبة الدقة: ${Math.round(score)}%. `;
    if (score > 85) feedbackText += "إجابة ممتازة وواضحة!";
    else if (score > 60) feedbackText += "جيد جداً، الأمر فعال.";
    else feedbackText += "بداية جيدة، لكن يمكن إضافة المزيد من التفاصيل لتحسين النتيجة.";
    
    return { isCorrect: score > 60, feedbackText, score };
}

function handleFeedback({ isCorrect, feedbackText }, correctAnswer) {
    if (isCorrect) {
        Audio.playSound('success.mp3');
        const points = (currentLevelData.type === 'mcq' || currentLevelData.type === 'scramble') ? 10 : 20;
        GameState.increaseScore(points);
        UI.updateScore(GameState.getScore());
        UI.showConfettiEffect();
        
        const currentLevel = parseInt(UI.levelCounter.textContent);
        GameState.unlockNextLevel(currentLevel);

        UI.showFeedback(true, `<span class="feedback-title">أحسنت! +${points} نقطة</span> ${feedbackText}`, correctAnswer);
        UI.toggleGameButtons(false);
    } else {
        Audio.playSound('fail.mp3');
        UI.showFeedback(false, feedbackText, correctAnswer, false);
        // Allow retry if it wasn't a time-up failure
        if (timerInterval) { // Check if timer is running
            UI.checkAnswerBtn.disabled = false;
            startTimer(); // Restart timer for another try
        }
    }
    GameState.saveProgress();
}


// --- NAVIGATION ---
function goToLevelSelection() {
    UI.populateLevelSelection(GameState.getUnlockedLevels(), startLevel);
    UI.showScreen(UI.screens.levelSelection);
}


// --- INITIALIZATION ---
function initializeGame() {
    GameState.loadProgress();
    const playerName = GameState.getPlayerName();
    if (playerName) {
        UI.showResumeView(playerName, GameState.getUnlockedLevels() -1);
    }

    // --- EVENT LISTENERS ---
    UI.startGameBtn.addEventListener('click', () => {
        const name = UI.playerNameInput.value.trim();
        if (!name) {
            UI.playerNameInput.style.borderColor = 'red';
            return;
        }
        UI.playerNameInput.style.borderColor = '#ccc';
        Audio.initAudio().then(() => Audio.playMusic());
        GameState.setPlayerName(name);
        GameState.saveProgress();
        goToLevelSelection();
    });

    UI.resumeGameBtn.addEventListener('click', () => {
        Audio.initAudio().then(() => Audio.playMusic());
        goToLevelSelection();
    });
    
    UI.newGameBtn.addEventListener('click', () => {
        if(confirm("هل أنت متأكد أنك تريد بدء لعبة جديدة؟ سيتم مسح تقدمك الحالي.")) {
            Audio.initAudio().then(() => Audio.playMusic());
            GameState.resetProgress();
            GameState.saveProgress();
            goToLevelSelection();
        }
    });

    UI.nextLevelBtn.addEventListener('click', goToLevelSelection);
    
    UI.checkAnswerBtn.addEventListener('click', checkAnswer);
    
    UI.back-to-menu-btn.addEventListener('click', () => {
        clearInterval(timerInterval);
        UI.resetTheme();
        goToLevelSelection();
    });

    UI.showScreen(UI.screens.start);
}

document.addEventListener('DOMContentLoaded', initializeGame);