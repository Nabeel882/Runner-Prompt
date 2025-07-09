import { themes, levelTypes, templates, vocabulary } from './config.js';

let lastLevelType = null;

export function generateLevel(levelNumber) {
    // Choose a random level type, but avoid repeating the last one if possible
    let availableTypes = levelTypes.filter(t => t !== lastLevelType);
    if (availableTypes.length === 0) {
        availableTypes = levelTypes; // Reset if all types have been used in sequence
    }
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    lastLevelType = type;

    // Choose a random template for the selected type
    const template = templates[type][Math.floor(Math.random() * templates[type].length)];

    const level = { type, scenario: template.s, correctAnswer: template.c };
    
    // Fill template with random words
    for (const key in vocabulary) {
        const word = vocabulary[key][Math.floor(Math.random() * vocabulary[key].length)];
        const regex = new RegExp(`{${key}}`, "g");
        if (level.scenario) {
            level.scenario = level.scenario.replace(regex, word);
        }
        if (level.correctAnswer) {
            level.correctAnswer = level.correctAnswer.replace(regex, word);
        }
        if (template.b) {
            level.badPrompt = template.b.replace(regex, word);
        }
         if (template.w) {
            level.options = template.w.map(opt => opt.replace(regex, word));
            level.options.push(level.correctAnswer);
            level.options.sort(() => Math.random() - 0.5); // Shuffle options
        }
        if (template.f) {
            level.forbiddenWord = template.f.replace(regex, word);
        }
    }
    level.theme = themes[0]; // Always use the first (and only) theme
    return level;
}