const state = {
    theme: localStorage.getItem('theme') || 'light',
    activated: false,
    isAnimating: false,
    currentSound: localStorage.getItem('sound') || 'water',
    currentIndex: 0,
    contentPool: [],
    touchStartX: 0,
    touchEndX: 0,
    lang: getLanguage()
};

// UI i18n Translation
function applyTranslations() {
    const dict = i18n[state.lang] || i18n.zh;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });
}

// Audio Context
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

// Sound Generators
const sounds = {
    water: () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    },
    click: () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
    },
    'mechanical-red': () => {
        const ctx = getAudioCtx();
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
        noise.buffer = buffer;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(400, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        noise.connect(lowpass).connect(gain).connect(ctx.destination);
        noise.start();
    },
    'mechanical-blue': () => {
        const ctx = getAudioCtx();
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(3500, ctx.currentTime);
        click.frequency.setValueAtTime(0, ctx.currentTime + 0.02);
        clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
        clickGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.02);
        clickGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03);
        click.connect(clickGain).connect(ctx.destination);
        click.start(); click.stop(ctx.currentTime + 0.03);

        const bottom = ctx.createOscillator();
        const bottomGain = ctx.createGain();
        bottom.type = 'sine';
        bottom.frequency.setValueAtTime(120, ctx.currentTime + 0.02);
        bottomGain.gain.setValueAtTime(0, ctx.currentTime + 0.02);
        bottomGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.025);
        bottomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        bottom.connect(bottomGain).connect(ctx.destination);
        bottom.start(ctx.currentTime + 0.02); bottom.stop(ctx.currentTime + 0.1);
    },
    'mechanical-brown': () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
        noise.buffer = buffer;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(600, ctx.currentTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

        noise.connect(lowpass).connect(noiseGain).connect(ctx.destination);
        osc.connect(gain).connect(ctx.destination);
        noise.start(); osc.start(); osc.stop(ctx.currentTime + 0.06);
    },
    'mechanical-silent': () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
    },
    bell: () => {
        const ctx = getAudioCtx();
        const frequencies = [1046.5, 1318.5, 1568, 2093];
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 1.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 1.5);
        });
    }
};

function playSound() {
    try { sounds[state.currentSound]?.(); } catch (e) {}
}

function playSuccessChime() {
    try {
        const ctx = getAudioCtx();
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.12);
            osc.stop(ctx.currentTime + i * 0.12 + 0.5);
        });
    } catch (e) {}
}

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const anchorButton = document.getElementById('anchorButton');
const flashOverlay = document.getElementById('flashOverlay');
const messageCard = document.getElementById('messageCard');
const mainMessage = document.getElementById('mainMessage');
const storySource = document.getElementById('storySource');
const particlesContainer = document.getElementById('particlesContainer');
const soundBtn = document.getElementById('soundBtn');
const soundMenu = document.getElementById('soundMenu');
const soundLabel = document.getElementById('soundLabel');
const navPrev = document.getElementById('navPrev');
const navNext = document.getElementById('navNext');

function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

function initSound() {
    const activeOpt = document.querySelector(`.sound-option[data-sound="${state.currentSound}"]`);
    if (activeOpt) soundLabel.textContent = activeOpt.textContent;
    document.querySelectorAll('.sound-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.sound === state.currentSound);
    });
}

// Event Listeners
themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
});

soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundMenu.classList.toggle('show');
});

document.querySelectorAll('.sound-option').forEach(opt => {
    opt.addEventListener('click', () => {
        state.currentSound = opt.dataset.sound;
        soundLabel.textContent = opt.textContent;
        localStorage.setItem('sound', state.currentSound);
        document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        soundMenu.classList.remove('show');
        playSound();
    });
});

document.addEventListener('click', () => soundMenu.classList.remove('show'));

function createRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

function createParticles() {
    particlesContainer.innerHTML = '';
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            width:${4+Math.random()*6}px;
            height:${4+Math.random()*6}px;
            --drift-x:${(Math.random()-0.5)*200}px;
            --drift-y:${-100-Math.random()*200}px;
            animation-delay:${Math.random()*5}s;
        `;
        particlesContainer.appendChild(p);
    }
    particlesContainer.classList.add('particles-active');
}

function prepareContentPool() {
    state.contentPool = [...philosophicalStories];
    for (let i = state.contentPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.contentPool[i], state.contentPool[j]] = [state.contentPool[j], state.contentPool[i]];
    }
    state.currentIndex = 0;
}

function showCurrentContent() {
    const content = state.contentPool[state.currentIndex];
    mainMessage.textContent = content.story;
    storySource.textContent = content.source;
}

function navigateContent(direction) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    messageCard.classList.remove('visible');
    if (direction === 'prev') {
        messageCard.classList.add('slide-left');
    } else {
        messageCard.classList.add('slide-right');
    }

    playSound();

    setTimeout(() => {
        if (direction === 'prev') {
            state.currentIndex = (state.currentIndex - 1 + state.contentPool.length) % state.contentPool.length;
        } else {
            state.currentIndex = (state.currentIndex + 1) % state.contentPool.length;
        }

        showCurrentContent();
        messageCard.classList.remove('slide-left', 'slide-right');
        messageCard.classList.add('visible');
        state.isAnimating = false;
    }, 300);
}

function activateButton(e) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    createRipple(e);
    playSound();
    flashOverlay.classList.add('active');
    createParticles();

    if (!state.activated) {
        prepareContentPool();
        showCurrentContent();
    }

    setTimeout(playSuccessChime, 400);

    setTimeout(() => {
        flashOverlay.classList.remove('active');
        messageCard.classList.add('visible');
        navPrev.classList.add('visible');
        navNext.classList.add('visible');
        state.activated = true;
        state.isAnimating = false;
    }, 600);
}

function closeMessage(e) {
    if (e.target === messageCard || messageCard.contains(e.target) || e.target === navPrev || e.target === navNext || navPrev.contains(e.target) || navNext.contains(e.target)) return;
    if (messageCard.classList.contains('visible')) {
        messageCard.classList.remove('visible');
        navPrev.classList.remove('visible');
        navNext.classList.remove('visible');
        setTimeout(() => {
            particlesContainer.classList.remove('particles-active');
            state.activated = false;
        }, 400);
    }
}

// Event Binding
anchorButton.addEventListener('click', activateButton);
document.addEventListener('click', closeMessage);
navPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateContent('prev'); });
navNext.addEventListener('click', (e) => { e.stopPropagation(); navigateContent('next'); });

document.addEventListener('touchstart', (e) => { state.touchStartX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener('touchend', (e) => {
    state.touchEndX = e.changedTouches[0].screenX;
    if (!messageCard.classList.contains('visible')) return;
    const diff = state.touchStartX - state.touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) navigateContent('next');
        else navigateContent('prev');
    }
}, { passive: true });

document.addEventListener('keydown', (e) => {
    if (!messageCard.classList.contains('visible')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); navigateContent('prev'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); navigateContent('next'); }
    else if (e.key === 'Escape') { closeMessage({ target: document.body }); }
});

// App Initialization
applyTranslations();
initTheme();
initSound();
