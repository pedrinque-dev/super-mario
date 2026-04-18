const mario = document.getElementById('mario');
const pipe = document.getElementById('pipe');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');
const coinsContainer = document.getElementById('coins-container');
const popupsContainer = document.getElementById('popups-container');

const scoreEl = document.getElementById('score');
const coinCountEl = document.getElementById('coin-count');
const bestScoreEl = document.getElementById('best-score');
const finalScoreEl = document.getElementById('final-score');
const finalCoinsEl = document.getElementById('final-coins');
const finalBestEl = document.getElementById('final-best');

const bgMusic = document.getElementById('bgMusic');
const coinSound = document.getElementById('coinSound');
const jumpSound = document.getElementById('jumpSound');
const gameoverSound = document.getElementById('gameoverSound');

function playSound(audio) {
    if (!audio) return;
    try { audio.currentTime = 0; audio.play().catch(() => { }); } catch (e) { }
}

let score = 0;
let coins = 0;
let isGameOver = false;
let gameStarted = false;
let isJumping = false;
let activeCoinEls = [];

let pipeRight = -80;
let pipeSpeed = 650;
let pipeRAF = null;
let lastTimestamp = null;
let difficultyTimer = null;
let coinSpawnTimer = null;
let scoreTimer = null;
let collisionLoop = null;

function getBest() { return parseInt(localStorage.getItem('marioBestScore') || '0'); }
function saveBest() { if (score > getBest()) localStorage.setItem('marioBestScore', score); }
function updateBestDisplay() { bestScoreEl.textContent = String(getBest()).padStart(6, '0'); }
updateBestDisplay();

function updateScore(pts) {
    score += pts;
    scoreEl.textContent = String(score).padStart(6, '0');
}

function showScorePopup(x, y, text) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;
    popup.style.left = x + 'px';
    popup.style.bottom = y + 'px';
    popupsContainer.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

function getBoard() { return document.getElementById('game-board'); }

function initPipePosition() {
    pipeRight = -(pipe.offsetWidth + 20);
    pipe.style.right = pipeRight + 'px';
    pipe.style.animation = 'none';
}

function pipeTick(timestamp) {
    if (isGameOver) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;

    const board = getBoard();
    pipeRight += pipeSpeed * delta;

    if (pipeRight > board.offsetWidth + pipe.offsetWidth + 20) {
        pipeRight = -(pipe.offsetWidth + 20);
    }

    pipe.style.right = pipeRight + 'px';
    pipeRAF = requestAnimationFrame(pipeTick);
}

function startPipeLoop() {
    if (pipeRAF) cancelAnimationFrame(pipeRAF);
    lastTimestamp = null;
    pipeRAF = requestAnimationFrame(pipeTick);
}

function stopPipeLoop() {
    if (pipeRAF) { cancelAnimationFrame(pipeRAF); pipeRAF = null; }
}

function jump() {
    if (isGameOver || !gameStarted || isJumping) return;
    isJumping = true;
    mario.classList.add('jump');
    playSound(jumpSound);
    setTimeout(() => {
        mario.classList.remove('jump');
        isJumping = false;
    }, 500);
}

function getRandomCoinHeight() {
    return Math.floor(Math.random() * (130 - 55) + 55);
}

let coinRAFs = new Map();

function spawnCoin() {
    if (isGameOver) return;
    const coinEl = document.createElement('img');
    coinEl.src = 'assets/imgs/coin.gif';
    coinEl.className = 'coin';
    coinEl.style.bottom = getRandomCoinHeight() + 'px';

    let coinRight = -(32 + 10);
    coinEl.style.right = coinRight + 'px';

    coinsContainer.appendChild(coinEl);
    activeCoinEls.push(coinEl);

    let lastCoinTs = null;

    function coinTick(timestamp) {
        if (coinEl.dataset.collected) return;
        if (!lastCoinTs) lastCoinTs = timestamp;
        const delta = Math.min((timestamp - lastCoinTs) / 1000, 0.05);
        lastCoinTs = timestamp;

        const board = getBoard();
        coinRight += pipeSpeed * delta;

        if (coinRight > board.offsetWidth + 40) {
            coinEl.remove();
            activeCoinEls = activeCoinEls.filter(c => c !== coinEl);
            coinRAFs.delete(coinEl);
            return;
        }

        coinEl.style.right = coinRight + 'px';
        coinRAFs.set(coinEl, requestAnimationFrame(coinTick));
    }

    coinRAFs.set(coinEl, requestAnimationFrame(coinTick));
}

function checkCoinCollision(coinEl) {
    const mr = mario.getBoundingClientRect();
    const cr = coinEl.getBoundingClientRect();
    const m = 10;
    return mr.left < cr.right - m && mr.right > cr.left + m &&
        mr.top < cr.bottom - m && mr.bottom > cr.top + m;
}

function collectCoin(coinEl) {
    if (coinEl.dataset.collected) return;
    coinEl.dataset.collected = 'true';

    if (coinRAFs.has(coinEl)) {
        cancelAnimationFrame(coinRAFs.get(coinEl));
        coinRAFs.delete(coinEl);
    }

    coins++;
    coinCountEl.textContent = 'x' + String(coins).padStart(2, '0');
    updateScore(100);
    playSound(coinSound);
    const cr = coinEl.getBoundingClientRect();
    const br = getBoard().getBoundingClientRect();
    showScorePopup(cr.left - br.left, getBoard().offsetHeight - (cr.bottom - br.top) + 20, '+100');
    coinEl.classList.add('collected');
    setTimeout(() => {
        coinEl.remove();
        activeCoinEls = activeCoinEls.filter(c => c !== coinEl);
    }, 300);
}

function detectCollisions() {
    const pr = pipe.getBoundingClientRect();
    const mr = mario.getBoundingClientRect();
    const m = 22;
    const hit = pr.left + m < mr.right - m && pr.right - m > mr.left + m &&
        pr.top + m < mr.bottom - m && pr.bottom - m > mr.top + m;
    if (hit) { triggerGameOver(); return; }
    activeCoinEls.forEach(c => { if (!c.dataset.collected && checkCoinCollision(c)) collectCoin(c); });
}

function increaseDifficulty() {
    if (isGameOver) return;
    pipeSpeed = Math.min(1100, pipeSpeed + 60);
    const indicator = document.querySelector('.speed-indicator');
    if (indicator) {
        indicator.textContent = '⚡ VELOCIDADE!';
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 1500);
    }
}

function startGameLoop() {
    clearInterval(collisionLoop);
    collisionLoop = setInterval(() => { if (!isGameOver) detectCollisions(); }, 16);

    clearInterval(scoreTimer);
    scoreTimer = setInterval(() => { if (!isGameOver) updateScore(10); }, 100);

    clearTimeout(coinSpawnTimer);
    function scheduleCoin() {
        if (isGameOver) return;
        coinSpawnTimer = setTimeout(() => {
            if (!isGameOver) { spawnCoin(); scheduleCoin(); }
        }, 1500 + Math.random() * 2500);
    }
    scheduleCoin();

    clearInterval(difficultyTimer);
    difficultyTimer = setInterval(() => { if (!isGameOver) increaseDifficulty(); }, 5000);
}

function triggerGameOver() {
    if (isGameOver) return;
    isGameOver = true;

    stopPipeLoop();
    clearInterval(collisionLoop);
    clearInterval(scoreTimer);
    clearTimeout(coinSpawnTimer);
    clearInterval(difficultyTimer);

    mario.style.animation = 'none';
    mario.src = 'assets/imgs/game-over.png';
    mario.style.width = '60px';

    bgMusic.pause();
    playSound(gameoverSound);
    saveBest();

    finalScoreEl.textContent = String(score).padStart(6, '0');
    finalCoinsEl.textContent = String(coins).padStart(2, '0');
    finalBestEl.textContent = String(getBest()).padStart(6, '0');
    updateBestDisplay();

    setTimeout(() => gameOverScreen.classList.add('visible'), 600);
}

function restartGame() {
    isGameOver = false;
    score = 0;
    coins = 0;
    pipeSpeed = 650;
    isJumping = false;

    scoreEl.textContent = '000000';
    coinCountEl.textContent = 'x00';
    updateBestDisplay();

    activeCoinEls.forEach(c => {
        if (coinRAFs.has(c)) { cancelAnimationFrame(coinRAFs.get(c)); coinRAFs.delete(c); }
        c.remove();
    });
    activeCoinEls = [];
    coinRAFs.clear();
    coinsContainer.innerHTML = '';
    popupsContainer.innerHTML = '';

    mario.src = 'assets/imgs/mario.gif';
    mario.style.width = '';
    mario.style.bottom = '';
    mario.style.animation = '';
    mario.classList.remove('jump');

    initPipePosition();
    gameOverScreen.classList.remove('visible');

    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => { });

    startPipeLoop();
    startGameLoop();
}

function startGame() {
    gameStarted = true;
    startScreen.style.display = 'none';
    mario.classList.remove('idle');

    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => { });

    startPipeLoop();
    startGameLoop();
}

initPipePosition();

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameStarted) startGame();
        else jump();
    }
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameStarted) startGame();
    else jump();
}, { passive: false });

const speedEl = document.createElement('div');
speedEl.className = 'speed-indicator';
document.body.appendChild(speedEl);
