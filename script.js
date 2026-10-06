// ============================================================
//   НАВИГАЦИЯ
// ============================================================
window.navigate = function(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });

    const titles = {
        wheel: '🎂 Колесо',
        timeline: '📸 История',
        coupons: '🎁 Купоны',
        surprise: '🎉 Сюрприз',
        game: '🎮 Игры'
    };
    document.title = titles[section] || 'С Днём Рождения!';

    history.replaceState(null, '', `#${section}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (section !== 'game' && typeof stopAllGames === 'function') {
        stopAllGames();
    }
};

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        window.navigate(link.dataset.section);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['wheel', 'timeline', 'coupons', 'surprise', 'game'];
    if (valid.includes(hash)) window.navigate(hash);
});


// ============================================================
//   ЗВУКИ
// ============================================================
var audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

document.addEventListener('touchstart', initAudio, { once: true });
document.addEventListener('click', initAudio, { once: true });

function playSound(type) {
    try {
        initAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        if (type === 'click') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'confetti') {
            [0, 0.12].forEach((delay, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'triangle';
                const base = i === 0 ? 523 : 659;
                osc.frequency.setValueAtTime(base, now + delay);
                osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + delay + 0.15);
                gain.gain.setValueAtTime(0.001, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.2, now + delay + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
                osc.start(now + delay); osc.stop(now + delay + 0.2);
            });
        } else if (type === 'spin') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.4);
            osc.frequency.linearRampToValueAtTime(200, now + 0.8);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            osc.start(now); osc.stop(now + 0.8);
        }
    } catch (e) {}
}


// ============================================================
//   КОЛЕСО ФОРТУНЫ
// ============================================================
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('result-text');
const toGiftBtn = document.getElementById('to-gift-btn');

const sectors = [1, 5, 10, 15, 18, 20, 25, 30];
const colors = [
    '#00e676', '#00e5ff', '#ff2d95', '#b14aff',
    '#ffea00', '#00e676', '#00e5ff', '#ff2d95'
];
const numSectors = sectors.length;
const anglePerSector = (2 * Math.PI) / numSectors;
let currentRotation = 0;
let isSpinning = false;

function drawWheel() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = canvas.width / 2 - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSectors; i++) {
        const start = i * anglePerSector + currentRotation;
        const end = start + anglePerSector;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + anglePerSector / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(sectors[i], r - 30, 7);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 3;
    ctx.stroke();
}
drawWheel();

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    resultDiv.classList.add('hidden');
    toGiftBtn.classList.add('hidden');
    playSound('spin');

    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 2 * Math.PI;
    const totalRotation = spins * 2 * Math.PI + randomAngle;
    currentRotation += totalRotation;
    canvas.style.transform = `rotate(${currentRotation}rad)`;

    setTimeout(() => {
        const pointerAngle = (3 * Math.PI) / 2;
        const normalized = currentRotation % (2 * Math.PI);
        const atPointer = (pointerAngle - normalized + 2 * Math.PI) % (2 * Math.PI);
        const idx = Math.floor(atPointer / anglePerSector);
        showResult(sectors[idx]);
        isSpinning = false;
    }, 4000);
});

function showResult(age) {
    let message = '';
    if (age === 20) {
        const messages = [
            'Пусть всё в твоей жизни будет хорошо!',
            '20 лет — это только начало!',
            'Ты лучший, и это факт!',
            'Пусть сбудется всё, что загадал!'
        ];
        message = messages[Math.floor(Math.random() * messages.length)];
    } else {
        message = `Тебе выпало ${age}. Но сегодня твой день — 20!`;
    }
    resultText.textContent = message;
    resultDiv.classList.remove('hidden');
    setTimeout(() => toGiftBtn.classList.remove('hidden'), 1500);
}

toGiftBtn.addEventListener('click', () => {
    playSound('click');
    window.navigate('timeline');
});


// ============================================================
//   ТАЙМЛАЙН
// ============================================================
const photos = [
    { src: 'images/photo1.jpg', story: 'ты тогда играл на 4 шк, дал мне телефон играть в игры и бегал постоянно попарить' },
    { src: 'images/photo2.jpg', story: 'мы нашли очки на лавочке, и потом жоска сняли под твою любимую песню' },
    { src: 'images/photo3.jpg', story: '1-2 ночевка' },
    { src: 'images/photo4.jpg', story: 'я тогда избивала тебя и вы меня называли ведьмой' },
    { src: 'images/photo5.jpg', story: 'пока ты спал я решила снимать тик токи, как видишь сам проснулся' },
    { src: 'images/photo6.jpg', story: 'первое щипание бровей(так волнительно)' },
    { src: 'images/photo7.jpg', story: 'твое дршкинс' },
    { src: 'images/photo8.jpg', story: 'ты меня тогда провожал и не отпускал' },
    { src: 'images/photo9.jpg', story: 'ты в этот день выйграл медальку' },
    { src: 'images/photo10.jpg', story: 'первый раз вынесла фотик, был замечен за гейскими повадками' },
    { src: 'images/photo11.jpg', story: 'селфи' },
    { src: 'images/photo12.jpg', story: 'на жд были, красивое фото' },
    { src: 'images/photo13.jpg', story: 'я только купила шубу... сказал что это твоя' },
    { src: 'images/photo14.jpg', story: 'твое любимое фото' },
    { src: 'images/photo15.jpg', story: 'красивое очень фото, грех не добавить' },
    { src: 'images/photo16.jpg', story: 'сидели в падике, я тогда поехала на 8' },
    { src: 'images/photo17.jpg', story: 'тебя ебал ярик' },
    { src: 'images/photo18.jpg', story: 'я хз откуда это у меня но это прикольное фото' },
    { src: 'images/photo19.jpg', story: 'одел мои очки и типо спишь' },
    { src: 'images/photo20.jpg', story: 'мрт не щадило' },
    { src: 'images/photo21.jpg', story: 'не надо мои сиськи кусать' },
    { src: 'images/photo22.jpg', story: 'селфи 2' },
    { src: 'images/photo23.jpg', story: 'пришибла тебя дверью: ты сказал я первая кто так сделал' },
    { src: 'images/photo24.jpg', story: 'наконец то ты постригся' },
    { src: 'images/photo25.jpg', story: 'классная фотка' },
    { src: 'images/photo26.jpg', story: 'попросил сфоткать на кухне с ужастиков' },
    { src: 'images/photo27.jpg', story: 'первый фейс тайм' },
    { src: 'images/photo28.jpg', story: 'отмечали год и ты напился квасом' },
    { src: 'images/photo29.jpg', story: 'боевое ранение(футбол не щадит)' },
    { src: 'images/photo30.jpg', story: 'этот же день - ты спал очень круто' },
    { src: 'images/photo31.jpg', story: 'не так давно ходили на футбол и встретили звезду жодино' }
];

const timelineEl = document.getElementById('timeline');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalText = document.getElementById('modal-text');
const modalClose = document.getElementById('modal-close');

photos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `<img src="${photo.src}" alt="Фото ${index + 1}" loading="lazy">`;
    item.addEventListener('click', () => {
        playSound('click');
        modalImg.src = photo.src;
        modalText.textContent = photo.story;
        modal.classList.remove('hidden');
    });
    timelineEl.appendChild(item);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });
document.querySelectorAll('.timeline-item').forEach(item => observer.observe(item));

modalClose.addEventListener('click', () => {
    playSound('click');
    modal.classList.add('hidden');
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});


// ============================================================
//   КУПОНЫ
// ============================================================
const couponsData = [
    { icon: '💋', title: '10 поцелуев', desc: 'Отрывай по одному купону, когда захочешь', activation: 'Активирован! Действует бессрочно' },
    { icon: '🍆', title: 'Купон на отсос', desc: 'Действует 1 раз, по предварительной договорённости', activation: 'Активирован! Использовать с умом 😏' },
    { icon: '🤐', title: 'Не ору день', desc: 'Целый день без криков и ссор', activation: 'Активирован! Действует 24 часа' },
    { icon: '⚽', title: 'Делаем то, что ты скажешь', desc: 'Футбол, любое желание — исполняю', activation: 'Активирован! Жду твою команду' }
];

const couponsContainer = document.getElementById('coupons');
couponsData.forEach((coupon, index) => {
    const el = document.createElement('div');
    el.className = 'coupon';
    el.innerHTML = `
        <div class="coupon-icon">${coupon.icon}</div>
        <div class="coupon-title">${coupon.title}</div>
        <div class="coupon-desc">${coupon.desc}</div>
        <div class="coupon-activation">${coupon.activation}</div>
    `;
    if (localStorage.getItem(`coupon_${index}`) === 'activated') el.classList.add('activated');
    el.addEventListener('click', () => {
        playSound('click');
        el.classList.toggle('activated');
        if (el.classList.contains('activated')) {
            localStorage.setItem(`coupon_${index}`, 'activated');
        } else {
            localStorage.removeItem(`coupon_${index}`);
        }
    });
    couponsContainer.appendChild(el);
});


// ============================================================
//   СЮРПРИЗ
// ============================================================
const surprises = [
    { src: 'images/meme1.jpg', text: '😂' },
    { src: 'images/meme2.jpg', text: '😂' },
    { src: 'images/meme3.jpg', text: '😂' },
    { src: 'images/meme4.jpg', text: '😂' },
    { src: 'images/meme5.jpg', text: '😂' },
    { src: 'images/meme6.jpg', text: '😂' },
    { src: 'images/meme7.jpg', text: '😂' },
    { src: 'images/meme8.jpg', text: '😂' }
];

const surpriseBtn = document.getElementById('surprise-btn');
const surpriseContent = document.getElementById('surprise-content');
const surpriseImg = document.getElementById('surprise-img');
const surpriseText = document.getElementById('surprise-text');

let lastSurpriseIndex = -1;

if (surpriseBtn) {
    surpriseBtn.addEventListener('click', () => {
        let idx;
        do { idx = Math.floor(Math.random() * surprises.length); }
        while (idx === lastSurpriseIndex && surprises.length > 1);
        lastSurpriseIndex = idx;
        surpriseImg.src = surprises[idx].src;
        surpriseText.textContent = surprises[idx].text;
        surpriseContent.classList.remove('hidden');

        playSound('confetti');
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#00e676', '#00e5ff', '#ff2d95', '#b14aff', '#ffea00']
            });
        }
    });
}


// ============================================================
//   ИГРЫ
// ============================================================
const gameSelector = document.getElementById('game-selector');
const gameShooter = document.getElementById('game-shooter');
const gameCat = document.getElementById('game-cat');
const gameWinScreen = document.getElementById('game-win');
const gameLoseScreen = document.getElementById('game-lose');

window.showSelector = function() {
    stopAllGames();
    gameShooter.classList.add('hidden');
    gameCat.classList.add('hidden');
    gameWinScreen.classList.add('hidden');
    gameLoseScreen.classList.add('hidden');
    gameSelector.classList.remove('hidden');
};

function showWin(text, onRestart) {
    gameWinScreen.classList.remove('hidden');
    document.getElementById('game-win-text').textContent = text;
    document.getElementById('game-win-restart').onclick = () => {
        playSound('click');
        gameWinScreen.classList.add('hidden');
        onRestart();
    };
    document.getElementById('game-win-back').onclick = () => {
        playSound('click');
        gameWinScreen.classList.add('hidden');
        window.showSelector();
    };
    playSound('confetti');
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#00e676', '#00e5ff', '#ff2d95', '#b14aff', '#ffea00']
        });
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.5, x: 0.2 },
                colors: ['#00e676', '#00e5ff', '#ff2d95', '#b14aff', '#ffea00']
            });
        }, 300);
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.5, x: 0.8 },
                colors: ['#00e676', '#00e5ff', '#ff2d95', '#b14aff', '#ffea00']
            });
        }, 600);
    }
}

function showLose(text, onRestart) {
    gameLoseScreen.classList.remove('hidden');
    document.getElementById('game-lose-text').textContent = text;
    document.getElementById('game-lose-restart').onclick = () => {
        playSound('click');
        gameLoseScreen.classList.add('hidden');
        onRestart();
    };
    document.getElementById('game-lose-back').onclick = () => {
        playSound('click');
        gameLoseScreen.classList.add('hidden');
        window.showSelector();
    };
}

document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        playSound('click');
        gameSelector.classList.add('hidden');
        gameWinScreen.classList.add('hidden');
        gameLoseScreen.classList.add('hidden');

        if (card.dataset.game === 'shooter') {
            gameShooter.classList.remove('hidden');
            resetShooter();
        } else {
            gameCat.classList.remove('hidden');
            resetCat();
        }
    });
});


// ---------- ИГРА 1: ТИР ----------
const shooterArea = document.getElementById('shooter-area');
const shooterOverlay = document.getElementById('shooter-overlay');
const shooterLevelEl = document.getElementById('shooter-level');
const shooterScoreEl = document.getElementById('shooter-score');
const shooterLivesEl = document.getElementById('shooter-lives');
const shooterTimeEl = document.getElementById('shooter-time');

const shooterState = {
    running: false, score: 0, lives: 3, level: 1, time: 45,
    balls: [], lastSpawn: 0, animationId: null, timeInterval: null, target: 12
};

const ballEmojis = ['⚽', '🏀', '🎾', '🏐', '🎱', '🏓'];

function resetShooter() {
    stopAllGames();
    shooterState.running = false;
    shooterState.score = 0;
    shooterState.lives = 3;
    shooterState.level = 1;
    shooterState.time = 45;
    shooterState.balls = [];

    shooterScoreEl.textContent = '0';
    shooterLivesEl.textContent = '❤️❤️❤️';
    shooterTimeEl.textContent = '45';
    shooterLevelEl.textContent = '1';

    shooterArea.querySelectorAll('.ball, .score-pop').forEach(el => el.remove());
    shooterOverlay.style.display = 'flex';
    shooterOverlay.innerHTML = `
        <h2>Тир</h2>
        <p>Кликай по мячам. Промах — минус жизнь. Собери 12 очков за 45 секунд.</p>
        <button id="shooter-start" class="btn-primary">Начать</button>
    `;
    document.getElementById('shooter-start').onclick = startShooter;
}

function startShooter() {
    playSound('click');
    shooterOverlay.style.display = 'none';
    shooterState.running = true;
    shooterState.score = 0;
    shooterState.lives = 3;
    shooterState.level = 1;
    shooterState.time = 45;
    shooterState.balls = [];
    shooterState.lastSpawn = 0;

    shooterScoreEl.textContent = '0';
    shooterLivesEl.textContent = '❤️❤️❤️';
    shooterTimeEl.textContent = '45';
    shooterLevelEl.textContent = '1';

    shooterState.timeInterval = setInterval(() => {
        shooterState.time--;
        shooterTimeEl.textContent = shooterState.time;
        if (shooterState.time <= 0) endShooter(false);
    }, 1000);

    shooterState.lastSpawn = performance.now();
    shooterState.animationId = requestAnimationFrame(updateShooter);
}

function updateShooter(now) {
    if (!shooterState.running) return;

    const interval = Math.max(700, 1800 - shooterState.level * 150);
    if (now - shooterState.lastSpawn > interval) {
        spawnBall();
        shooterState.lastSpawn = now;
    }

    const areaW = shooterArea.clientWidth;
    const areaH = shooterArea.clientHeight;
    const ballSize = 60;

    shooterState.balls.forEach(ball => {
        if (ball.dead) return;
        ball.vy += 0.12;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x <= 0 || ball.x >= areaW - ballSize) {
            ball.vx *= -0.9;
            ball.x = Math.max(0, Math.min(areaW - ballSize, ball.x));
        }
        if (ball.y >= areaH - ballSize) {
            ball.vy *= -0.9;
            ball.y = areaH - ballSize;
            if (Math.abs(ball.vy) < 1) ball.vy = -7;
        }
        if (ball.y <= 0) {
            ball.vy *= -0.9;
            ball.y = 0;
        }

        ball.el.style.left = ball.x + 'px';
        ball.el.style.top = ball.y + 'px';
        ball.el.style.transform = `rotate(${ball.x * 0.5}deg)`;

        if (ball.y > areaH + 100) removeBall(ball);
    });

    shooterState.animationId = requestAnimationFrame(updateShooter);
}

function spawnBall() {
    const areaW = shooterArea.clientWidth;
    const areaH = shooterArea.clientHeight;
    const ballSize = 60;

    const el = document.createElement('div');
    el.className = 'ball';
    const i = Math.floor(Math.random() * ballEmojis.length);
    el.textContent = ballEmojis[i];

    const x = Math.random() * (areaW - ballSize);
    const y = areaH - ballSize;
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    const power = 8 + shooterState.level * 1.2;
    const vx = (Math.random() - 0.5) * 5;
    const vy = -power - Math.random() * 2;
    const ball = { el, x, y, vx, vy, dead: false };

    el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ball.dead) return;
        ball.dead = true;
        playSound('click');
        shooterState.score++;
        shooterScoreEl.textContent = shooterState.score;
        showScorePop(ball.x, ball.y, '+1', false);
        el.classList.add('hit');
        setTimeout(() => { if (el.parentNode) el.remove(); }, 400);

        if (shooterState.score >= shooterState.target) {
            endShooter(true);
        } else if (shooterState.score % 4 === 0) {
            shooterState.level++;
            shooterLevelEl.textContent = shooterState.level;
        }
    });

    shooterArea.appendChild(el);
    shooterState.balls.push(ball);
}

function removeBall(ball) {
    ball.dead = true;
    if (ball.el.parentNode) ball.el.remove();
    shooterState.balls = shooterState.balls.filter(b => b !== ball);
}

shooterArea.addEventListener('click', (e) => {
    if (!shooterState.running) return;
    if (e.target.classList.contains('ball')) return;
    playSound('click');
    shooterState.lives--;
    const hearts = '❤️'.repeat(Math.max(0, shooterState.lives)) + '🖤'.repeat(Math.max(0, 3 - shooterState.lives));
    shooterLivesEl.textContent = hearts;
    showScorePop(e.offsetX, e.offsetY, '-1', true);
    if (shooterState.lives <= 0) endShooter(false);
});

function showScorePop(x, y, text, isMiss) {
    const pop = document.createElement('div');
    pop.className = 'score-pop' + (isMiss ? ' miss' : '');
    pop.textContent = text;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    shooterArea.appendChild(pop);
    setTimeout(() => pop.remove(), 800);
}

function endShooter(win) {
    shooterState.running = false;
    clearInterval(shooterState.timeInterval);
    cancelAnimationFrame(shooterState.animationId);
    shooterState.balls.forEach(b => { if (b.el.parentNode) b.el.remove(); });
    shooterState.balls = [];

    if (win) {
        showWin(`Ты собрал ${shooterState.score} очков на ${shooterState.level} уровне!`, () => {
            resetShooter(); startShooter();
        });
    } else {
        showLose(
            shooterState.time <= 0
                ? `Время вышло! Ты набрал ${shooterState.score} очков.`
                : `Ты потерял все жизни! Очки: ${shooterState.score}.`,
            () => { resetShooter(); startShooter(); }
        );
    }
}


// ---------- ИГРА 2: ПОЙМАЙ ТОЛСТОГО ----------
const catArea = document.getElementById('cat-area');
const catOverlay = document.getElementById('cat-overlay');
const catHitsEl = document.getElementById('cat-hits');
const catTimeEl = document.getElementById('cat-time');
const catMissesEl = document.getElementById('cat-misses');

const FAT_IMAGE = 'images/fat.jpg';

const catState = {
    running: false, hits: 0, misses: 0, time: 25,
    catEl: null, catX: 0, catY: 0, catVx: 2, catVy: 2,
    animationId: null, timeInterval: null,
    target: 5, maxMisses: 3
};

function createFatElement() {
    const el = document.createElement('div');
    el.className = 'cat fat';
    const img = document.createElement('img');
    img.src = FAT_IMAGE;
    img.alt = '🐱';
    img.onerror = () => {
        img.remove();
        el.textContent = '🐱';
    };
    el.appendChild(img);
    return el;
}

function resetCat() {
    stopAllGames();
    catState.running = false;
    catState.hits = 0;
    catState.misses = 0;
    catState.time = 25;

    catHitsEl.textContent = '0 / 5';
    catTimeEl.textContent = '25';
    catMissesEl.textContent = '0';

    if (catState.catEl) catState.catEl.remove();
    catState.catEl = null;

    catOverlay.style.display = 'flex';
    catOverlay.innerHTML = `
        <h2>Поймай толстого</h2>
        <p>Он бегает и прячется. Кликни по нему 5 раз за 25 секунд. 3 промаха — проигрыш.</p>
        <button id="cat-start" class="btn-primary">Начать</button>
    `;
    document.getElementById('cat-start').onclick = startCat;
}

function startCat() {
    playSound('click');
    catOverlay.style.display = 'none';
    catState.running = true;
    catState.hits = 0;
    catState.misses = 0;
    catState.time = 25;

    catHitsEl.textContent = '0 / 5';
    catTimeEl.textContent = '25';
    catMissesEl.textContent = '0';

    const el = createFatElement();
    catArea.appendChild(el);
    catState.catEl = el;

    const areaW = catArea.clientWidth;
    const areaH = catArea.clientHeight;
    catState.catX = areaW / 2 - 35;
    catState.catY = areaH / 2 - 35;
    catState.catVx = (Math.random() > 0.5 ? 1 : -1) * 2;
    catState.catVy = (Math.random() > 0.5 ? 1 : -1) * 2;

    el.style.left = catState.catX + 'px';
    el.style.top = catState.catY + 'px';

    el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!catState.running) return;
        playSound('click');
        catState.hits++;
        catHitsEl.textContent = `${catState.hits} / ${catState.target}`;
        catState.catVx *= 1.10;
        catState.catVy *= 1.10;

        el.style.opacity = '0';
        setTimeout(() => {
            if (!catState.running) return;
            const aW = catArea.clientWidth;
            const aH = catArea.clientHeight;
            catState.catX = Math.random() * (aW - 70);
            catState.catY = Math.random() * (aH - 70);
            el.style.left = catState.catX + 'px';
            el.style.top = catState.catY + 'px';
            el.style.opacity = '1';
        }, 300);

        if (catState.hits >= catState.target) endCat(true);
    });

    catState.timeInterval = setInterval(() => {
        catState.time--;
        catTimeEl.textContent = catState.time;
        if (catState.time <= 0) endCat(false);
    }, 1000);

    catState.animationId = requestAnimationFrame(updateCat);
}

function updateCat() {
    if (!catState.running) return;
    const areaW = catArea.clientWidth;
    const areaH = catArea.clientHeight;
    const size = 70;

    catState.catX += catState.catVx;
    catState.catY += catState.catVy;

    if (catState.catX <= 0 || catState.catX >= areaW - size) {
        catState.catVx *= -1;
        catState.catX = Math.max(0, Math.min(areaW - size, catState.catX));
    }
    if (catState.catY <= 0 || catState.catY >= areaH - size) {
        catState.catVy *= -1;
        catState.catY = Math.max(0, Math.min(areaH - size, catState.catY));
    }

    if (Math.random() < 0.015) {
        catState.catVx += (Math.random() - 0.5) * 1.5;
        catState.catVy += (Math.random() - 0.5) * 1.5;
        const max = 6;
        catState.catVx = Math.max(-max, Math.min(max, catState.catVx));
        catState.catVy = Math.max(-max, Math.min(max, catState.catVy));
    }

    if (catState.catEl) {
        catState.catEl.style.left = catState.catX + 'px';
        catState.catEl.style.top = catState.catY + 'px';
        catState.catEl.style.transform = `rotate(${catState.catVx * 3}deg)`;
    }

    catState.animationId = requestAnimationFrame(updateCat);
}

catArea.addEventListener('click', (e) => {
    if (!catState.running) return;
    if (e.target.closest('.cat')) return;

    catState.misses++;
    catMissesEl.textContent = catState.misses;

    const pop = document.createElement('div');
    pop.className = 'score-pop miss';
    pop.textContent = 'Промах!';
    pop.style.left = e.offsetX + 'px';
    pop.style.top = e.offsetY + 'px';
    catArea.appendChild(pop);
    setTimeout(() => pop.remove(), 800);

    if (catState.misses >= catState.maxMisses) endCat(false);
});

function endCat(win) {
    catState.running = false;
    clearInterval(catState.timeInterval);
    cancelAnimationFrame(catState.animationId);
    if (catState.catEl) {
        catState.catEl.remove();
        catState.catEl = null;
    }

    if (win) {
        showWin(`Ты поймал толстого ${catState.hits} раз! Он в шоке.`, () => {
            resetCat(); startCat();
        });
    } else {
        showLose(
            catState.time <= 0
                ? `Время вышло! Ты поймал толстого ${catState.hits} раз.`
                : `Слишком много промахов! Ты поймал толстого ${catState.hits} раз.`,
            () => { resetCat(); startCat(); }
        );
    }
}

function stopAllGames() {
    shooterState.running = false;
    clearInterval(shooterState.timeInterval);
    cancelAnimationFrame(shooterState.animationId);
    shooterState.balls.forEach(b => { if (b.el.parentNode) b.el.remove(); });
    shooterState.balls = [];

    catState.running = false;
    clearInterval(catState.timeInterval);
    cancelAnimationFrame(catState.animationId);
    if (catState.catEl) {
        catState.catEl.remove();
        catState.catEl = null;
    }
}