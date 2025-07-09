let audioContext;
const audioBuffers = {};
let musicSource;

export async function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        await Promise.all([
            loadSound('success.mp3'),
            loadSound('fail.mp3'),
            loadSound('music.mp3', 'music')
        ]);
    } catch (error) {
        console.error("Audio initialization failed:", error);
    }
}

async function loadSound(url, key) {
    if (!audioContext) return;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers[key || url] = audioBuffer;
    } catch (error) {
        console.error(`Error loading sound: ${url}`, error);
    }
}

export function playSound(url) {
    if (!audioContext || !audioBuffers[url]) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[url];
    source.connect(audioContext.destination);
    source.start(0);
}

export function playMusic() {
    if (!audioContext || !audioBuffers['music'] || (musicSource && musicSource.context.state === 'running')) return;
    if (musicSource) {
        musicSource.stop();
    }
    musicSource = audioContext.createBufferSource();
    musicSource.buffer = audioBuffers['music'];
    musicSource.loop = true;
    musicSource.connect(audioContext.destination);
    musicSource.start(0);
}