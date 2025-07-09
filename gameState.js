let state = {
    playerName: null,
    unlockedLevels: 1,
    score: 0,
};

export function getPlayerName() {
    return state.playerName;
}

export function setPlayerName(name) {
    state.playerName = name;
}

export function getUnlockedLevels() {
    return state.unlockedLevels;
}

export function unlockNextLevel(currentLevel) {
    if (currentLevel >= state.unlockedLevels) {
        state.unlockedLevels = currentLevel + 1;
    }
}

export function getScore() {
    return state.score;
}

export function increaseScore(points) {
    state.score += points;
}

export function saveProgress() {
    localStorage.setItem('promptRunnerState', JSON.stringify(state));
}

export function loadProgress() {
    const savedState = localStorage.getItem('promptRunnerState');
    if (savedState) {
        state = JSON.parse(savedState);
    }
}

export function resetProgress() {
    const name = state.playerName;
    state = { playerName: name, unlockedLevels: 1, score: 0 };
    saveProgress();
}