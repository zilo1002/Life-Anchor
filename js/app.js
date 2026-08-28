const state = {
    theme: localStorage.getItem('theme') || 'light',
    activated: false,
    isAnimating: false,
    currentSound: localStorage.getItem('sound') || 'water',
    currentIndex: 0,
    cardLanguage: localStorage.getItem('cardLanguage') || 'zh',
    contentPool: [],
    touchStartX: 0,
    touchEndX: 0
};

// 安全兜底文案（防止 data/messages.js 加载失败导致代码崩溃）
const fallbackStories = [
    {
        story: "万物皆有裂痕，那是光照进来的地方。",
        source: "— 莱昂纳德·科恩",
        storyEn: "There is a crack in everything, that's how the light gets in.",
        sourceEn: "— Leonard Cohen"
    },
    {
        story: "生活明朗，万物可爱，人间值得，未来可期。",
        source: "— 季羡林",
        storyEn: "Life is bright, all things are lovely, human world is worth living, and the future is promising.",
        sourceEn: "— Ji Xianlin"
    },
    {
        story: "凡是过往，皆为序章。",
        source: "— 莎士比亚",
        storyEn: "What's past is prologue.",
        sourceEn: "— William Shakespeare"
    }
];

// Audio Context
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    return audioCtx;
}

// Sound Generators
const sounds = {
    water: () => {
        const ctx = getAudioCtx(); if (!ctx) return;
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
        const ctx = getAudioCtx(); if (!ctx) return;
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
        const ctx = getAudioCtx(); if (!ctx) return;
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
        const ctx = getAudioCtx(); if (!ctx) return;
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
        const ctx = getAudioCtx(); if (!ctx) return;
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
        const ctx = getAudioCtx(); if (!ctx) return;
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
        const ctx = getAudioCtx(); if (!ctx) return;
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

const soundNames = {
    water: '水滴声',
    click: '轻柔点击',
    'mechanical-red': '机械红轴',
    'mechanical-blue': '机械青轴',
    'mechanical-brown': '机械茶轴',
    'mechanical-silent': '静音红轴',
    bell: '风铃'
};

function playSound() {
    try { sounds[state.currentSound]?.(); } catch (e) {}
}

function playSuccessChime() {
    try {
        const ctx = getAudioCtx(); if (!ctx) return;
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

// 安全调用外部 i18n
if (window.LifeAnchorI18n && typeof LifeAnchorI18n.apply === 'function') {
    LifeAnchorI18n.apply();
}

// 获取 DOM 节点
const themeToggle = document.getElementById('themeToggle');
const anchorButton = document.getElementById('anchorButton');
const flashOverlay = document.getElementById('flashOverlay');
const messageCard = document.getElementById('messageCard');
const mainMessage = document.getElementById('mainMessage');
const storySource = document.getElementById('storySource');
const cardLanguageSelector = document.getElementById('cardLanguageSelector');
const cardLanguageOptions = document.querySelectorAll('.card-language-option');
const messageNav = document.getElementById('messageNav');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const particlesContainer = document.getElementById('particlesContainer');
const soundBtn = document.getElementById('soundBtn');
const soundMenu = document.getElementById('soundMenu');
const soundLabel = document.getElementById('soundLabel');

function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

function initSound() {
    if (soundLabel) soundLabel.textContent = soundNames[state.currentSound];
    document.querySelectorAll('.sound-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.sound === state.currentSound);
    });
}

// 绑定导航按键事件
if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('prev');
    });
}
if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('next');
    });
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
    });
}

if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (soundMenu) soundMenu.classList.toggle('show');
    });
}

document.querySelectorAll('.sound-option').forEach(opt => {
    opt.addEventListener('click', () => {
        state.currentSound = opt.dataset.sound;
        if (soundLabel) soundLabel.textContent = soundNames[state.currentSound];
        localStorage.setItem('sound', state.currentSound);
        document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        if (soundMenu) soundMenu.classList.remove('show');
        playSound();
    });
});

document.addEventListener('click', () => {
    if (soundMenu) soundMenu.classList.remove('show');
});

function createRipple(e) {
    const btn = e.currentTarget;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

function createParticles() {
    if (!particlesContainer) return;
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
    // 优先读取 LifeAnchorContent 数据，若无则使用 fallbackStories
    const rawData = (window.LifeAnchorContent && Array.isArray(window.LifeAnchorContent.philosophicalStories) && window.LifeAnchorContent.philosophicalStories.length > 0)
        ? window.LifeAnchorContent.philosophicalStories
        : fallbackStories;

    state.contentPool = [...rawData];
    for (let i = state.contentPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.contentPool[i], state.contentPool[j]] = [state.contentPool[j], state.contentPool[i]];
    }
    state.currentIndex = 0;
}

function showCurrentContent() {
    if (!state.contentPool.length) return;
    const content = state.contentPool[state.currentIndex];
    const hasEnglish = Boolean(content.storyEn);

    if (mainMessage) mainMessage.textContent = content.story || '';
    if (storySource) storySource.textContent = content.source || '';

    let englishMessage = document.getElementById('mainMessageEn');
    let englishSource = document.getElementById('storySourceEn');

    if (!englishMessage && mainMessage) {
        englishMessage = document.createElement('p');
        englishMessage.className = 'main-message main-message-en';
        englishMessage.id = 'mainMessageEn';
        mainMessage.insertAdjacentElement('afterend', englishMessage);
    }

    if (!englishSource && storySource) {
        englishSource = document.createElement('p');
        englishSource.className = 'source source-en';
        englishSource.id = 'storySourceEn';
        storySource.insertAdjacentElement('afterend', englishSource);
    }

    if (englishMessage) englishMessage.textContent = content.storyEn || '';
    if (englishSource) englishSource.textContent = content.sourceEn || '';

    const mode = state.cardLanguage;
    const showZh = mode === 'zh' || mode === 'bilingual';
    const showEn = mode === 'en' || mode === 'bilingual';

    if (mainMessage) mainMessage.style.display = showZh ? '' : 'none';
    if (storySource) storySource.style.display = showZh ? '' : 'none';
    if (englishMessage) englishMessage.style.display = showEn && hasEnglish ? '' : 'none';
    if (englishSource) englishSource.style.display = showEn && hasEnglish && content.sourceEn ? '' : 'none';

    if (mode === 'en' && !hasEnglish) {
        if (mainMessage) {
            mainMessage.style.display = '';
            mainMessage.textContent = content.story;
        }
        if (storySource) {
            storySource.style.display = '';
            storySource.textContent = content.source;
        }
    }
}

function setCardLanguage(language) {
    state.cardLanguage = language;
    localStorage.setItem('cardLanguage', language);
    cardLanguageOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.cardLanguage === language);
    });
    showCurrentContent();
}

cardLanguageOptions.forEach(option => {
    option.addEventListener('click', (event) => {
        event.stopPropagation();
        setCardLanguage(option.dataset.cardLanguage);
    });
});

function navigateContent(direction) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    if (messageCard) messageCard.classList.remove('visible');
    if (cardLanguageSelector) cardLanguageSelector.classList.remove('visible');
    if (messageNav) messageNav.classList.remove('visible');

    if (messageCard) {
        if (direction === 'prev') messageCard.classList.add('slide-left');
        else messageCard.classList.add('slide-right');
    }

    playSound();

    setTimeout(() => {
        if (direction === 'prev') {
            state.currentIndex = (state.currentIndex - 1 + state.contentPool.length) % state.contentPool.length;
        } else {
            state.currentIndex = (state.currentIndex + 1) % state.contentPool.length;
        }

        showCurrentContent();
        if (messageCard) {
            messageCard.classList.remove('slide-left', 'slide-right');
            messageCard.classList.add('visible');
        }
        if (cardLanguageSelector) cardLanguageSelector.classList.add('visible');
        if (messageNav) messageNav.classList.add('visible');
        state.isAnimating = false;
    }, 300);
}

function activateButton(e) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    createRipple(e);
    playSound();
    if (flashOverlay) flashOverlay.classList.add('active');
    createParticles();

    if (!state.activated) {
        prepareContentPool();
        showCurrentContent();
    }

    setTimeout(playSuccessChime, 400);

    setTimeout(() => {
        if (flashOverlay) flashOverlay.classList.remove('active');
        if (messageCard) messageCard.classList.add('visible');
        if (cardLanguageSelector) cardLanguageSelector.classList.add('visible');
        if (messageNav) messageNav.classList.add('visible');
        state.activated = true;
        state.isAnimating = false;
    }, 600);
}

function closeMessage(e) {
    if (e.target.closest('#messageCard') || e.target.closest('#cardLanguageSelector') || e.target.closest('#messageNav')) return;

    if (messageCard && messageCard.classList.contains('visible')) {
        messageCard.classList.remove('visible');
        if (cardLanguageSelector) cardLanguageSelector.classList.remove('visible');
        if (messageNav) messageNav.classList.remove('visible');
        setTimeout(() => {
            if (particlesContainer) particlesContainer.classList.remove('particles-active');
            state.activated = false;
        }, 400);
    }
}

// Touch & Key Event Listeners
document.addEventListener('touchstart', (e) => { state.touchStartX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener('touchend', (e) => {
    state.touchEndX = e.changedTouches[0].screenX;
    if (!messageCard || !messageCard.classList.contains('visible')) return;
    const diff = state.touchStartX - state.touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) navigateContent('next');
        else navigateContent('prev');
    }
}, { passive: true });

document.addEventListener('keydown', (e) => {
    if (!messageCard || !messageCard.classList.contains('visible')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); navigateContent('prev'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); navigateContent('next'); }
    else if (e.key === 'Escape') { closeMessage({ target: document.body }); }
});

if (anchorButton) {
    anchorButton.addEventListener('click', activateButton);
}
document.addEventListener('click', closeMessage);

// Init
initTheme();
setCardLanguage(state.cardLanguage);
initSound();

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
});
