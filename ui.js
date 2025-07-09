// --- DOM ELEMENTS ---
export const screens = {
    start: document.getElementById('start-screen'),
    levelSelection: document.getElementById('level-selection-screen'),
    game: document.getElementById('game-screen'),
};

const gameContainer = document.getElementById('game-container');
const confettiContainer = document.getElementById('confetti-container');
export const startGameBtn = document.getElementById('start-game-btn');
export const resumeGameBtn = document.getElementById('resume-game-btn');
export const newGameBtn = document.getElementById('new-game-btn');
const playerNameContainer = document.getElementById('player-name-container');
const welcomeMessage = document.getElementById('welcome-message');
const levelSelectionContainer = document.getElementById('level-buttons-container');
export const levelCounter = document.getElementById('level-counter');
const scoreCounter = document.getElementById('score-counter');
const timerCounter = document.getElementById('timer-counter');
const timerDisplay = document.getElementById('timer-display');
const scenarioDiv = document.getElementById('scenario');
const challengeContainer = document.getElementById('challenge-container');
export const checkAnswerBtn = document.getElementById('check-answer-btn');
export const nextLevelBtn = document.getElementById('next-level-btn');
export const backToMenuBtn = document.getElementById('back-to-menu-btn');
const feedbackDiv = document.getElementById('feedback');


// --- UI FUNCTIONS ---
export function showScreen(screenToShow) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screenToShow.classList.add('active');
}

export function setTheme(theme) {
    // Theming is now handled globally via CSS for the hacker look. This function is kept for potential future use.
}

export function resetTheme() {
    // Theming is now handled globally via CSS.
}

export function updateGameHeader(level, score) {
    levelCounter.textContent = level;
    scoreCounter.textContent = score;
}

export function updateScore(score) {
    scoreCounter.textContent = score;
}

export function renderChallenge({ type, scenario, options, badPrompt, correctAnswer, forbiddenWord }, onMcqSelect) {
    scenarioDiv.textContent = scenario;
    challengeContainer.innerHTML = '';

    if (type === 'mcq') {
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'mcq-option';
            optionDiv.textContent = option;
            optionDiv.addEventListener('click', () => {
                document.querySelectorAll('.mcq-option').forEach(el => el.classList.remove('selected'));
                optionDiv.classList.add('selected');
                onMcqSelect(option);
            });
            challengeContainer.appendChild(optionDiv);
        });
    } else if (type === 'correction' || type === 'creation' || type === 'forbid') {
        const input = document.createElement('textarea');
        input.id = 'prompt-input';
        input.rows = 4;
        input.placeholder = "اكتب الأمر المثالي هنا...";
        if (type === 'correction') {
             const badPromptDiv = document.createElement('div');
             badPromptDiv.innerHTML = `<strong class="hacker-text">> الأمر الحالي:</strong><p style="background:rgba(255, 65, 54, 0.1); border:1px solid var(--incorrect-color); padding:10px; margin-top:5px;">${badPrompt}</p>`;
             challengeContainer.appendChild(badPromptDiv);
        }
        if (type === 'forbid') {
            const forbidDiv = document.createElement('div');
            forbidDiv.innerHTML = `<strong class="hacker-text">> تحدي:</strong><p style="background:rgba(255, 220, 0, 0.1); border:1px solid var(--timer-warning-color); padding:10px; margin-top:5px; color: var(--timer-warning-color);">اكتب الأمر بدون استخدام كلمة: "${forbiddenWord}"</p>`;
            challengeContainer.appendChild(forbidDiv);
        }
        challengeContainer.appendChild(input);
    } else if (type === 'scramble') {
        const dropZone = document.createElement('div');
        dropZone.className = 'word-scramble-input';
        dropZone.id = 'drop-zone';
        dropZone.dir = 'ltr';
        
        const wordBank = document.createElement('div');
        wordBank.className = 'word-bank';
        
        const words = correctAnswer.split(' ').sort(() => Math.random() - 0.5);
        words.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word-option';
            wordDiv.textContent = word;
            wordDiv.addEventListener('click', () => {
                if (wordDiv.classList.contains('used')) return;
                const newWordSpan = document.createElement('span');
                newWordSpan.textContent = word + ' ';
                newWordSpan.className = 'dropped-word';
                newWordSpan.addEventListener('click', () => {
                     wordDiv.classList.remove('used');
                     newWordSpan.remove();
                });
                dropZone.appendChild(newWordSpan);
                wordDiv.classList.add('used');
            });
            wordBank.appendChild(wordDiv);
        });
        challengeContainer.appendChild(dropZone);
        challengeContainer.appendChild(wordBank);
    }
}

export function updateTimer(timeLeft) {
    timerCounter.textContent = timeLeft;
    timerDisplay.classList.remove('warning', 'danger');
    if (timeLeft <= 10) timerDisplay.classList.add('warning');
    if (timeLeft <= 5) timerDisplay.classList.add('danger');
}

export function showFeedback(isCorrect, feedbackText, correctAnswer, isTimeUp = false) {
    feedbackDiv.style.display = 'block';
    feedbackDiv.classList.toggle('correct', isCorrect);
    feedbackDiv.classList.toggle('incorrect', !isCorrect);
    checkAnswerBtn.disabled = true;

    if (isCorrect) {
        feedbackDiv.innerHTML = feedbackText;
    } else {
        let title = isTimeUp ? 'الوقت نفد!' : 'حاول مرة أخرى!';
        feedbackDiv.innerHTML = `<span class="feedback-title">${title}</span> ${feedbackText}`;
        if(correctAnswer && !['mcq', 'scramble'].includes(document.body.dataset.levelType)) {
             feedbackDiv.innerHTML += `<br><small style="color: var(--secondary-color);"><strong>> الإجابة المقترحة:</strong> ${correctAnswer}</small>`;
        }
    }
}

export function resetFeedback() {
    feedbackDiv.style.display = 'none';
}

export function toggleGameButtons(isGameActive) {
    checkAnswerBtn.style.display = isGameActive ? 'inline-block' : 'none';
    checkAnswerBtn.disabled = false; // Enable by default, logic will disable it
    nextLevelBtn.style.display = isGameActive ? 'none' : 'inline-block';
}

export function getFreeTextAnswer() {
    const input = document.getElementById('prompt-input');
    return input ? input.value.trim() : '';
}

export function getScrambledAnswer() {
    const dropZone = document.getElementById('drop-zone');
    return dropZone ? Array.from(dropZone.children).map(s => s.textContent.trim()).join(' ') : '';
}

export function populateLevelSelection(unlockedLevels, onLevelSelect) {
    levelSelectionContainer.innerHTML = '';
    for (let i = 1; i <= unlockedLevels + 2 && i <= 50; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn level-btn';
        btn.textContent = i;
        if (i <= unlockedLevels) {
            btn.classList.add('unlocked');
            if (i < unlockedLevels) {
                btn.classList.add('completed');
            }
            btn.addEventListener('click', () => onLevelSelect(i));
        } else {
            btn.disabled = true;
            btn.innerHTML = '<span style="font-family: sans-serif;">🔒</span>';
        }
        levelSelectionContainer.appendChild(btn);
    }
}

export function showResumeView(playerName, currentLevel) {
    welcomeMessage.innerHTML = `مرحباً بعودتك يا ${playerName}! <br> <span class="hacker-text">> مستواك الحالي: ${currentLevel}</span>`;
    playerNameContainer.style.display = 'none';
    startGameBtn.style.display = 'none';
    resumeGameBtn.style.display = 'inline-block';
    newGameBtn.style.display = 'inline-block';
}

export function showConfettiEffect() {
    confettiContainer.innerHTML = '';
    const congratsWords = ['أحسنت!', 'رائع!', 'ممتاز!', 'إبداع!', 'مبروك!'];

    for (let i = 0; i < 20; i++) {
        const isText = Math.random() > 0.5;
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        if (isText) {
            confetti.classList.add('confetti-text');
            confetti.textContent = congratsWords[Math.floor(Math.random() * congratsWords.length)];
        } else {
            const img = document.createElement('img');
            img.src = './hacker_flower.png';
            img.className = 'confetti-img';
            confetti.appendChild(img);
        }
        
        const startX = Math.random() * 100;
        const animDuration = Math.random() * 2 + 3; // 3-5 seconds
        const animDelay = Math.random() * 2; // 0-2 seconds delay

        confetti.style.left = `${startX}%`;
        confetti.style.animationDuration = `${animDuration}s`;
        confetti.style.animationDelay = `${animDelay}s`;
        
        confettiContainer.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, (animDuration + animDelay) * 1000);
    }
}