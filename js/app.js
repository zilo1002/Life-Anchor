const state = {
    theme: localStorage.getItem('theme') || 'light',
    activated: false,
    isAnimating: false,
    currentSound: localStorage.getItem('sound') || 'water',
    currentIndex: 0,
    cardLanguage: localStorage.getItem('cardLanguage') || 'zh',
    contentPool: [],
    touchStartX: 0,
    touchEndX: 0,
    touchStartY: 0,
    touchEndY: 0,
    isTouching: false
};

// ============================================================
// Constants
// ============================================================

const VALID_THEMES = [
    'light',
    'dark'
];

const VALID_SOUNDS = [
    'water',
    'click',
    'mechanical-red',
    'mechanical-blue',
    'mechanical-brown',
    'mechanical-silent',
    'bell'
];

const VALID_CARD_LANGUAGES = [
    'zh',
    'en',
    'bilingual'
];

const NAVIGATION_DURATION = 300;
const CLOSE_DURATION = 400;
const ACTIVATION_DURATION = 600;
const SWIPE_THRESHOLD = 50;
const SWIPE_VERTICAL_LIMIT = 100;

// ============================================================
// Storage Helpers
// ============================================================

function getStoredValue(key, validValues, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (validValues.includes(value)) {
            return value;
        }
    } catch (e) {
        // localStorage unavailable
    }

    return fallback;
}

function setStoredValue(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // localStorage unavailable
    }
}

// Normalize values loaded from localStorage.
state.theme = getStoredValue(
    'theme',
    VALID_THEMES,
    'light'
);

state.currentSound = getStoredValue(
    'sound',
    VALID_SOUNDS,
    'water'
);

state.cardLanguage = getStoredValue(
    'cardLanguage',
    VALID_CARD_LANGUAGES,
    'zh'
);

// ============================================================
// Audio Context
// ============================================================

let audioCtx = null;

function getAudioCtx() {
    if (audioCtx) {
        return audioCtx;
    }

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        return null;
    }

    try {
        audioCtx = new AudioContextClass();
        return audioCtx;
    } catch (e) {
        audioCtx = null;
        return null;
    }
}

async function resumeAudioContext() {
    const ctx = getAudioCtx();

    if (!ctx) {
        return null;
    }

    try {
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        return ctx;
    } catch (e) {
        return null;
    }
}

// ============================================================
// Sound Generators
// ============================================================

const sounds = {

    // --------------------------------------------------------
    // Water
    // --------------------------------------------------------

    water: () => {
        const ctx = getAudioCtx();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';

        osc.frequency.setValueAtTime(
            1800,
            now
        );

        osc.frequency.exponentialRampToValueAtTime(
            400,
            now + 0.15
        );

        filter.type = 'lowpass';

        filter.frequency.setValueAtTime(
            3000,
            now
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.linearRampToValueAtTime(
            0.4,
            now + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.2
        );

        osc
            .connect(filter)
            .connect(gain)
            .connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    },

    // --------------------------------------------------------
    // Soft Click
    // --------------------------------------------------------

    click: () => {
        const ctx = getAudioCtx();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';

        osc.frequency.setValueAtTime(
            600,
            now
        );

        osc.frequency.exponentialRampToValueAtTime(
            200,
            now + 0.08
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.linearRampToValueAtTime(
            0.3,
            now + 0.005
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.12
        );

        osc
            .connect(gain)
            .connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    },

    // --------------------------------------------------------
    // Mechanical Red
    // --------------------------------------------------------

    'mechanical-red': () => {
        const ctx = getAudioCtx();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;

        const noise = ctx.createBufferSource();

        const duration = 0.08;

        const buffer = ctx.createBuffer(
            1,
            Math.floor(
                ctx.sampleRate * duration
            ),
            ctx.sampleRate
        );

        const data = buffer.getChannelData(0);

        for (
            let i = 0;
            i < data.length;
            i++
        ) {
            data[i] =
                (Math.random() * 2 - 1) *
                Math.exp(
                    -i /
                    (ctx.sampleRate * 0.02)
                );
        }

        noise.buffer = buffer;

        const lowpass =
            ctx.createBiquadFilter();

        lowpass.type = 'lowpass';

        lowpass.frequency.setValueAtTime(
            400,
            now
        );

        const gain =
            ctx.createGain();

        gain.gain.setValueAtTime(
            0.5,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration
        );

        noise
            .connect(lowpass)
            .connect(gain)
            .connect(ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    },

    // --------------------------------------------------------
    // Mechanical Blue
    // --------------------------------------------------------

    'mechanical-blue': () => {
        const ctx = getAudioCtx();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;

        // Click component
        const click =
            ctx.createOscillator();

        const clickGain =
            ctx.createGain();

        click.type = 'square';

        click.frequency.setValueAtTime(
            3500,
            now
        );

        // Never use 0Hz. Fade the oscillator instead.
        click.frequency.exponentialRampToValueAtTime(
            800,
            now + 0.02
        );

        clickGain.gain.setValueAtTime(
            0.0001,
            now
        );

        clickGain.gain.linearRampToValueAtTime(
            0.15,
            now + 0.003
        );

        clickGain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.03
        );

        click
            .connect(clickGain)
            .connect(ctx.destination);

        click.start(now);
        click.stop(now + 0.03);

        // Bottom component
        const bottom =
            ctx.createOscillator();

        const bottomGain =
            ctx.createGain();

        bottom.type = 'sine';

        bottom.frequency.setValueAtTime(
            120,
            now + 0.02
        );

        bottomGain.gain.setValueAtTime(
            0.0001,
            now + 0.02
        );

        bottomGain.gain.linearRampToValueAtTime(
            0.4,
            now + 0.025
        );

        bottomGain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.1
        );

        bottom
            .connect(bottomGain)
            .connect(ctx.destination);

        bottom.start(now + 0.02);
        bottom.stop(now + 0.1);
    },

    // --------------------------------------------------------
    // Mechanical Brown
    // --------------------------------------------------------

    'mechanical-brown': () => {
        const ctx = getAudioCtx();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;

        const osc =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        const noise =
            ctx.createBufferSource();

        const duration = 0.06;

        const buffer = ctx.createBuffer(
            1,
            Math.floor(
                ctx.sampleRate * duration
            ),
            ctx.sampleRate
        );

        const data =
            buffer.getChannelData(0);

        for (
            let i = 0;
            i < data.length;
            i++
        ) {
            data[i] =
                (Math.random() * 2 - 1) *
                Math.exp(
                    -i /
                    (ctx.sampleRate * 0.015)
                );
        }

        noise.buffer = buffer;

        const lowpass =
            ctx.createBiquadFilter();

        lowpass.type = 'lowpass';

        lowpass.frequency.setValueAtTime(
            600,
            now
        );

        const noiseGain =
            ctx.createGain();

        noiseGain.gain.setValueAtTime(
            0.25,
            now
        );

        noiseGain.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration
        );

        osc.type = 'sine';

        osc.frequency.setValueAtTime(
            200,
            now
        );

        osc.frequency.exponentialRampToValueAtTime(
            80,
            now + duration
        );

        gain.gain.setValueAtTime(
            0.3,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration
        );

        noise
            .connect(lowpass)
            .connect(noiseGain)
            .connect(ctx.destination);

        osc
            .connect(gain)
            .connect(ctx.destination);

        noise.start(now);
        noise.stop(now + duration);

        osc.start(now);
        osc.stop(now + duration);
    },

    // --------------------------------------------------------
    // Mechanical Silent
    // --------------------------------------------------------

    'mechanical-silent': () => {
        const ctx = getAudioCtx();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;

        const osc =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        osc.type = 'sine';

        osc.frequency.setValueAtTime(
            150,
            now
        );

        osc.frequency.exponentialRampToValueAtTime(
            60,
            now + 0.05
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.linearRampToValueAtTime(
            0.15,
            now + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.05
        );

        osc
            .connect(gain)
            .connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    },

    // --------------------------------------------------------
    // Bell
    // --------------------------------------------------------

    bell: () => {
        const ctx = getAudioCtx();

        if (!ctx) {
            return;
        }

        const frequencies = [
            1046.5,
            1318.5,
            1568,
            2093
        ];

        const now = ctx.currentTime;

        frequencies.forEach(
            (frequency, index) => {
                const startTime =
                    now + index * 0.08;

                const osc =
                    ctx.createOscillator();

                const gain =
                    ctx.createGain();

                osc.type = 'sine';

                osc.frequency.setValueAtTime(
                    frequency,
                    startTime
                );

                gain.gain.setValueAtTime(
                    0.0001,
                    startTime
                );

                gain.gain.linearRampToValueAtTime(
                    0.15,
                    startTime + 0.01
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    startTime + 1.5
                );

                osc
                    .connect(gain)
                    .connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 1.5);
            }
        );
    }
};

// ============================================================
// Sound Names
// ============================================================

const soundNames = {
    water: '水滴声',
    click: '轻柔点击',
    'mechanical-red': '机械红轴',
    'mechanical-blue': '机械青轴',
    'mechanical-brown': '机械茶轴',
    'mechanical-silent': '静音红轴',
    bell: '风铃'
};

// ============================================================
// Sound Playback
// ============================================================

async function playSound() {
    try {
        if (
            !VALID_SOUNDS.includes(
                state.currentSound
            )
        ) {
            state.currentSound = 'water';

            setStoredValue(
                'sound',
                state.currentSound
            );
        }

        const ctx =
            await resumeAudioContext();

        if (!ctx) {
            return;
        }

        const sound =
            sounds[state.currentSound];

        if (
            typeof sound !== 'function'
        ) {
            return;
        }

        sound();
    } catch (e) {
        // Audio is optional. Never break the UI.
    }
}

// ============================================================
// Success Chime
// ============================================================

async function playSuccessChime() {
    try {
        const ctx =
            await resumeAudioContext();

        if (!ctx) {
            return;
        }

        const notes = [
            523.25,
            659.25,
            783.99
        ];

        const now = ctx.currentTime;

        notes.forEach(
            (frequency, index) => {
                const startTime =
                    now + index * 0.12;

                const osc =
                    ctx.createOscillator();

                const gain =
                    ctx.createGain();

                osc.type = 'sine';

                osc.frequency.setValueAtTime(
                    frequency,
                    startTime
                );

                gain.gain.setValueAtTime(
                    0.0001,
                    startTime
                );

                gain.gain.linearRampToValueAtTime(
                    0.15,
                    startTime + 0.02
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    startTime + 0.5
                );

                osc
                    .connect(gain)
                    .connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.5);
            }
        );
    } catch (e) {
        // Audio is optional.
    }
}

// ============================================================
// Content Library
// ============================================================

let philosophicalStories = [];

if (
    typeof LifeAnchorContent !== 'undefined' &&
    Array.isArray(
        LifeAnchorContent.philosophicalStories
    )
) {
    philosophicalStories =
        LifeAnchorContent.philosophicalStories;
}

// ============================================================
// DOM References
// ============================================================

let themeToggle = null;
let anchorButton = null;
let flashOverlay = null;
let messageCard = null;
let mainMessage = null;
let storySource = null;
let cardLanguageSelector = null;
let cardLanguageOptions = [];
let particlesContainer = null;
let soundBtn = null;
let soundMenu = null;
let soundLabel = null;

// ============================================================
// DOM Initialization
// ============================================================

function cacheDOM() {
    themeToggle =
        document.getElementById(
            'themeToggle'
        );

    anchorButton =
        document.getElementById(
            'anchorButton'
        );

    flashOverlay =
        document.getElementById(
            'flashOverlay'
        );

    messageCard =
        document.getElementById(
            'messageCard'
        );

    mainMessage =
        document.getElementById(
            'mainMessage'
        );

    storySource =
        document.getElementById(
            'storySource'
        );

    cardLanguageSelector =
        document.getElementById(
            'cardLanguageSelector'
        );

    cardLanguageOptions = Array.from(
        document.querySelectorAll(
            '.card-language-option'
        )
    );

    particlesContainer =
        document.getElementById(
            'particlesContainer'
        );

    soundBtn =
        document.getElementById(
            'soundBtn'
        );

    soundMenu =
        document.getElementById(
            'soundMenu'
        );

    soundLabel =
        document.getElementById(
            'soundLabel'
        );
}

function isDOMReady() {
    return Boolean(
        themeToggle &&
        anchorButton &&
        flashOverlay &&
        messageCard &&
        mainMessage &&
        storySource &&
        cardLanguageSelector &&
        particlesContainer &&
        soundBtn &&
        soundMenu &&
        soundLabel
    );
}

// ============================================================
// Theme
// ============================================================

function initTheme() {
    if (
        !VALID_THEMES.includes(
            state.theme
        )
    ) {
        state.theme = 'light';
    }

    document.documentElement.setAttribute(
        'data-theme',
        state.theme
    );

    setStoredValue(
        'theme',
        state.theme
    );
}

function toggleTheme(e) {
    if (e) {
        e.stopPropagation();
    }

    state.theme =
        state.theme === 'light'
            ? 'dark'
            : 'light';

    document.documentElement.setAttribute(
        'data-theme',
        state.theme
    );

    setStoredValue(
        'theme',
        state.theme
    );
}

// ============================================================
// Sound Menu
// ============================================================

function initSound() {
    if (
        !VALID_SOUNDS.includes(
            state.currentSound
        )
    ) {
        state.currentSound = 'water';

        setStoredValue(
            'sound',
            state.currentSound
        );
    }

    soundLabel.textContent =
        soundNames[
            state.currentSound
        ];

    document
        .querySelectorAll('.sound-option')
        .forEach(option => {
            option.classList.toggle(
                'active',
                option.dataset.sound ===
                state.currentSound
            );
        });
}

function toggleSoundMenu(e) {
    e.stopPropagation();

    soundMenu.classList.toggle(
        'show'
    );
}

function selectSound(e) {
    e.stopPropagation();

    const option =
        e.currentTarget;

    const sound =
        option.dataset.sound;

    if (
        !VALID_SOUNDS.includes(
            sound
        )
    ) {
        return;
    }

    state.currentSound =
        sound;

    setStoredValue(
        'sound',
        sound
    );

    soundLabel.textContent =
        soundNames[sound];

    document
        .querySelectorAll(
            '.sound-option'
        )
        .forEach(item => {
            item.classList.toggle(
                'active',
                item.dataset.sound ===
                sound
            );
        });

    soundMenu.classList.remove(
        'show'
    );

    playSound();
}

// ============================================================
// I18n
// ============================================================

function initI18n() {
    if (
        typeof LifeAnchorI18n !==
        'undefined' &&
        LifeAnchorI18n &&
        typeof LifeAnchorI18n.apply ===
            'function'
    ) {
        try {
            LifeAnchorI18n.apply();
        } catch (e) {
            // Existing i18n system remains optional
            // for the card UI initialization.
        }
    }

    updateCardLanguageLabels();
}

function getI18nValue(
    key,
    fallback
) {
    if (
        typeof LifeAnchorI18n !==
            'undefined' &&
        LifeAnchorI18n &&
        typeof LifeAnchorI18n.get ===
            'function'
    ) {
        try {
            return (
                LifeAnchorI18n.get(key) ||
                fallback
            );
        } catch (e) {
            return fallback;
        }
    }

    return fallback;
}

function updateCardLanguageLabels() {
    const zh =
        document.querySelector(
            '[data-card-language="zh"]'
        );

    const en =
        document.querySelector(
            '[data-card-language="en"]'
        );

    const bilingual =
        document.querySelector(
            '[data-card-language="bilingual"]'
        );

    if (zh) {
        zh.textContent =
            getI18nValue(
                'cardZh',
                '中文'
            );
    }

    if (en) {
        en.textContent =
            getI18nValue(
                'cardEn',
                'English'
            );
    }

    if (bilingual) {
        bilingual.textContent =
            getI18nValue(
                'cardBi',
                '双语'
            );
    }
}

// ============================================================
// Ripple
// ============================================================

function createRipple(e) {
    if (
        !e ||
        !e.currentTarget
    ) {
        return;
    }

    const button =
        e.currentTarget;

    if (
        typeof button.getBoundingClientRect !==
        'function'
    ) {
        return;
    }

    const rect =
        button.getBoundingClientRect();

    const ripple =
        document.createElement(
            'span'
        );

    ripple.className =
        'ripple';

    const size =
        Math.max(
            rect.width,
            rect.height
        );

    let clientX =
        e.clientX;

    let clientY =
        e.clientY;

    if (
        typeof clientX !==
        'number'
    ) {
        clientX =
            rect.left +
            rect.width / 2;
    }

    if (
        typeof clientY !==
        'number'
    ) {
        clientY =
            rect.top +
            rect.height / 2;
    }

    ripple.style.width =
        `${size}px`;

    ripple.style.height =
        `${size}px`;

    ripple.style.left =
        `${clientX -
            rect.left -
            size / 2}px`;

    ripple.style.top =
        `${clientY -
            rect.top -
            size / 2}px`;

    button.appendChild(
        ripple
    );

    ripple.addEventListener(
        'animationend',
        () => {
            if (
                ripple.parentNode
            ) {
                ripple.remove();
            }
        },
        {
            once: true
        }
    );
}

// ============================================================
// Particles
// ============================================================

function createParticles() {
    if (
        !particlesContainer
    ) {
        return;
    }

    particlesContainer.innerHTML =
        '';

    for (
        let i = 0;
        i < 18;
        i++
    ) {
        const particle =
            document.createElement(
                'div'
            );

        particle.className =
            'particle';

        particle.style.cssText = `
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            width:${4 + Math.random() * 6}px;
            height:${4 + Math.random() * 6}px;
            --drift-x:${(Math.random() - 0.5) * 200}px;
            --drift-y:${-100 - Math.random() * 200}px;
            animation-delay:${Math.random() * 5}s;
        `;

        particlesContainer.appendChild(
            particle
        );
    }

    particlesContainer.classList.add(
        'particles-active'
    );
}

function clearParticles() {
    if (
        particlesContainer
    ) {
        particlesContainer.classList.remove(
            'particles-active'
        );
    }
}

// ============================================================
// Content Pool
// ============================================================

function prepareContentPool() {
    if (
        !Array.isArray(
            philosophicalStories
        )
    ) {
        state.contentPool = [];
        state.currentIndex = 0;
        return;
    }

    state.contentPool = [
        ...philosophicalStories
    ];

    // Fisher-Yates shuffle.
    for (
        let i =
            state.contentPool.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            state.contentPool[i],
            state.contentPool[j]
        ] = [
            state.contentPool[j],
            state.contentPool[i]
        ];
    }

    state.currentIndex = 0;
}

function ensureContentPool() {
    if (
        !Array.isArray(
            state.contentPool
        ) ||
        state.contentPool.length === 0
    ) {
        prepareContentPool();
    }

    return (
        state.contentPool.length > 0
    );
}

// ============================================================
// English Elements
// ============================================================

function ensureEnglishElements() {
    let englishMessage =
        document.getElementById(
            'mainMessageEn'
        );

    let englishSource =
        document.getElementById(
            'storySourceEn'
        );

    if (
        !englishMessage
    ) {
        englishMessage =
            document.createElement(
                'p'
            );

        englishMessage.className =
            'main-message main-message-en';

        englishMessage.id =
            'mainMessageEn';

        mainMessage.insertAdjacentElement(
            'afterend',
            englishMessage
        );
    }

    if (
        !englishSource
    ) {
        englishSource =
            document.createElement(
                'p'
            );

        englishSource.className =
            'source source-en';

        englishSource.id =
            'storySourceEn';

        storySource.insertAdjacentElement(
            'afterend',
            englishSource
        );
    }

    return {
        englishMessage,
        englishSource
    };
}

// ============================================================
// Show Content
// ============================================================

function showCurrentContent() {
    if (
        !ensureContentPool()
    ) {
        return false;
    }

    if (
        state.currentIndex < 0 ||
        state.currentIndex >=
            state.contentPool.length
    ) {
        state.currentIndex = 0;
    }

    const content =
        state.contentPool[
            state.currentIndex
        ];

    if (
        !content ||
        typeof content !==
            'object'
    ) {
        return false;
    }

    const {
        englishMessage,
        englishSource
    } =
        ensureEnglishElements();

    const story =
        typeof content.story ===
        'string'
            ? content.story
            : '';

    const source =
        typeof content.source ===
        'string'
            ? content.source
            : '';

    const storyEn =
        typeof content.storyEn ===
        'string'
            ? content.storyEn
            : '';

    const sourceEn =
        typeof content.sourceEn ===
        'string'
            ? content.sourceEn
            : '';

    mainMessage.textContent =
        story;

    storySource.textContent =
        source;

    englishMessage.textContent =
        storyEn;

    englishSource.textContent =
        sourceEn;

    if (
        !VALID_CARD_LANGUAGES.includes(
            state.cardLanguage
        )
    ) {
        state.cardLanguage =
            'zh';
    }

    const mode =
        state.cardLanguage;

    const showZh =
        mode === 'zh' ||
        mode === 'bilingual';

    const showEn =
        mode === 'en' ||
        mode === 'bilingual';

    const hasEnglish =
        storyEn.trim().length > 0;

    const hasEnglishSource =
        sourceEn.trim().length > 0;

    // Chinese
    mainMessage.style.display =
        showZh
            ? ''
            : 'none';

    storySource.style.display =
        showZh
            ? ''
            : 'none';

    // English
    englishMessage.style.display =
        showEn &&
        hasEnglish
            ? ''
            : 'none';

    englishSource.style.display =
        showEn &&
        hasEnglishSource
            ? ''
            : 'none';

    // If English is requested but
    // this item has no English version,
   // safely fall back to Chinese.
    if (
        mode === 'en' &&
        !hasEnglish
    ) {
        mainMessage.style.display =
            '';

        storySource.style.display =
            '';

        mainMessage.textContent =
            story;

        storySource.textContent =
            source;
    }

    return true;
}

// ============================================================
// Card Language
// ============================================================

function setCardLanguage(
    language
) {
    if (
        !VALID_CARD_LANGUAGES.includes(
            language
        )
    ) {
        language = 'zh';
    }

    state.cardLanguage =
        language;

    setStoredValue(
        'cardLanguage',
        language
    );

    cardLanguageOptions.forEach(
        option => {
            option.classList.toggle(
                'active',
                option.dataset
                    .cardLanguage ===
                    language
            );
        }
    );

    showCurrentContent();
}

function handleCardLanguageClick(
    e
) {
    e.stopPropagation();

    const language =
        e.currentTarget.dataset
            .cardLanguage;

    setCardLanguage(
        language
    );
}

// ============================================================
// Card Visibility
// ============================================================

function showCard() {
    messageCard.classList.add(
        'visible'
    );

    cardLanguageSelector.classList.add(
        'visible'
    );
}

function hideCard() {
    messageCard.classList.remove(
        'visible'
    );

    cardLanguageSelector.classList.remove(
        'visible'
    );
}

// ============================================================
// Navigate Content
// ============================================================

function navigateContent(
    direction
) {
    if (
        state.isAnimating
    ) {
        return;
    }

    if (
        !messageCard.classList.contains(
            'visible'
        )
) {
        return;
    }

    if (
        !ensureContentPool()
    ) {
        return;
    }

    if (
        direction !== 'prev' &&
        direction !== 'next'
    ) {
        return;
    }

    state.isAnimating =
        true;

    hideCard();

    messageCard.classList.remove(
        'slide-left',
        'slide-right'
    );

    if (
        direction === 'prev'
    ) {
        messageCard.classList.add(
            'slide-left'
        );
    } else {
        messageCard.classList.add(
            'slide-right'
        );
    }

    playSound();

    window.setTimeout(
        () => {
            if (
                direction ===
                'prev'
            ) {
                state.currentIndex =
                    (
                        state.currentIndex -
                        1 +
                        state.contentPool.length
                    ) %
                    state.contentPool.length;
            } else {
                state.currentIndex =
                    (
                        state.currentIndex +
                        1
                    ) %
                    state.contentPool.length;
            }

            showCurrentContent();

            messageCard.classList.remove(
                'slide-left',
                'slide-right'
            );

            showCard();

            state.isAnimating =
                false;
        },
        NAVIGATION_DURATION
    );
}

// ============================================================
// Activate
// ============================================================

function activateButton(e) {
    if (
        state.isAnimating
    ) {
        return;
    }

    // If the card is already open,
    // do not restart the activation animation.
    if (
        messageCard.classList.contains(
            'visible'
        )
    ) {
        return;
    }

    state.isAnimating =
        true;

    createRipple(e);

    playSound();

    flashOverlay.classList.add(
        'active'
    );

    createParticles();

    prepareContentPool();

    showCurrentContent();

    window.setTimeout(
        () => {
            playSuccessChime();
        },
        400
    );

    window.setTimeout(
        () => {
            flashOverlay.classList.remove(
                'active'
            );

            messageCard.classList.remove(
                'slide-left',
                'slide-right'
            );

            showCard();

            state.activated =
                true;

            state.isAnimating =
                false;
        },
        ACTIVATION_DURATION
    );
}

// ============================================================
// Close Message
// ============================================================

function closeMessage(e) {
    if (
        !e ||
        !e.target
    ) {
        return;
    }

    const target =
        e.target;

    if (
        !(target instanceof
            Element)
    ) {
        return;
    }

    // --------------------------------------------------------
    // Navigation hints
    // --------------------------------------------------------

    const leftHint =
        target.closest(
            '.hint-left'
        );

    if (leftHint) {
        e.stopPropagation();

        navigateContent(
            'prev'
        );

        return;
    }

    const rightHint =
        target.closest(
            '.hint-right'
        );

    if (rightHint) {
        e.stopPropagation();

        navigateContent(
            'next'
        );

        return;
    }

    // --------------------------------------------------------
    // Card itself
    // --------------------------------------------------------

    if (
        messageCard.contains(
            target
        )
    ) {
        return;
    }

    // --------------------------------------------------------
    // Language selector
    // --------------------------------------------------------

    if (
        cardLanguageSelector.contains(
            target
        )
    ) {
        return;
    }

    // --------------------------------------------------------
    // Sound UI
    // --------------------------------------------------------

    if (
soundBtn.contains(
            target
        ) ||
        soundMenu.contains(
            target
        )
    ) {
        return;
    }

    // --------------------------------------------------------
    // Theme button
    // --------------------------------------------------------

    if (
        themeToggle.contains(
            target
        )
    ) {
        return;
    }

    // --------------------------------------------------------
    // Anchor button
    // --------------------------------------------------------

    if (
        anchorButton.contains(
            target
        )
    ) {
        return;
    }

    // --------------------------------------------------------
    // Close
    // --------------------------------------------------------

    if (
        messageCard.classList.contains(
            'visible'
        )
    ) {
        hideCard();

        window.setTimeout(
            () => {
                clearParticles();

                state.activated =
                    false;

                state.isAnimating =
                    false;
            },
            CLOSE_DURATION
        );
    }
}

// ============================================================
// Touch Handling
// ============================================================

function handleTouchStart(e) {
    if (
        !e.changedTouches ||
        !e.changedTouches.length
    ) {
        return;
    }

    const touch =
        e.changedTouches[0];

    state.touchStartX =
        touch.screenX;

    state.touchStartY =
        touch.screenY;

    state.touchEndX =
        touch.screenX;

    state.touchEndY =
        touch.screenY;

    state.isTouching =
        true;
}

function handleTouchEnd(e) {
    if (
        !state.isTouching
    ) {
        return;
    }

    state.isTouching =
        false;

    if (
        !e.changedTouches ||
        !e.changedTouches.length
    ) {
        return;
    }

    const touch =
        e.changedTouches[0];

    state.touchEndX =
        touch.screenX;

    state.touchEndY =
        touch.screenY;

    handleSwipe();
}

function handleSwipe() {
    if (
        !messageCard.classList.contains(
            'visible'
        )
    ) {
        return;
    }

    const diffX =
        state.touchStartX -
        state.touchEndX;

    const diffY =
        state.touchStartY -
        state.touchEndY;

    // Ignore vertical gestures.
    if (
        Math.abs(diffY) >
        SWIPE_VERTICAL_LIMIT
    ) {
        return;
    }

    if (
        Math.abs(diffX) <=
        SWIPE_THRESHOLD
    ) {
        return;
    }

    if (
        diffX > 0
    ) {
        // Swipe left → next
        navigateContent(
            'next'
        );
    } else {
        // Swipe right → previous
        navigateContent(
            'prev'
        );
    }
}

// ============================================================
// Keyboard
// ============================================================

function handleKeyDown(e) {
    if (
        !messageCard.classList.contains(
            'visible'
        )
    ) {
        return;
    }

    if (
        e.key === 'ArrowLeft'
    ) {
        e.preventDefault();

        navigateContent(
            'prev'
        );

        return;
    }

    if (
        e.key === 'ArrowRight'
    ) {
        e.preventDefault();

        navigateContent(
            'next'
        );

        return;
    }

    if (
        e.key === 'Escape'
    ) {
        e.preventDefault();

        hideCard();

        window.setTimeout(
            () => {
                clearParticles();

                state.activated =
                    false;

                state.isAnimating =
                    false;
            },
            CLOSE_DURATION
        );
    }
}

// ============================================================
// Global Click
// ============================================================

function handleDocumentClick(e) {
    const target =
        e.target;

    if (
        !(target instanceof
            Element)
    ) {
        return;
    }

    // Sound menu closes when clicking elsewhere.
    if (
        !soundBtn.contains(
            target
        ) &&
        !soundMenu.contains(
            target
        )
    ) {
        soundMenu.classList.remove(
            'show'
        );
    }

    closeMessage(e);
}

// ============================================================
// Initial Fade
// ============================================================

function initPageFade() {
    const reveal =
        () => {
            document.body.style.opacity =
                '0';

            window.requestAnimationFrame(
                () => {
                    document.body.style.transition =
                        'opacity 1s ease';

                    window.setTimeout(
                        () => {
                            document.body.style.opacity =
                                '1';
                        },
                        100
                    );
                }
            );
        };

    // If DOMContentLoaded has already fired,
    // execute immediately.
    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            reveal,
            {
                once: true
            }
        );
    } else {
        reveal();
    }
}

// ============================================================
// Event Binding
// ============================================================

function bindEvents() {
    if (
        !isDOMReady()
    ) {
        return;
    }

    // Theme
    themeToggle.addEventListener(
        'click',
        toggleTheme
    );

    // Main button
    anchorButton.addEventListener(
        'click',
        activateButton
    );

    // Sound menu
    soundBtn.addEventListener(
        'click',
        toggleSoundMenu
    );

    document
        .querySelectorAll(
            '.sound-option'
        )
        .forEach(option => {
            option.addEventListener(
                'click',
                selectSound
            );
        });

    // Card language
    cardLanguageOptions.forEach(
        option => {
            option.addEventListener(
                'click',
                handleCardLanguageClick
            );
        }
    );

    // Global click
    document.addEventListener(
        'click',
        handleDocumentClick
    );

    // Touch
    document.addEventListener(
        'touchstart',
        handleTouchStart,
        {
            passive: true
        }
    );

    document.addEventListener(
        'touchend',
        handleTouchEnd,
        {
            passive: true
        }
    );

    // Keyboard
    document.addEventListener(
        'keydown',
        handleKeyDown
    );
}

// ============================================================
// Initialization
// ============================================================

function initializeApp() {
    cacheDOM();

    if (
        !isDOMReady()
    ) {
        console.error(
            'Life Anchor: required DOM elements are missing.'
        );

        return;
    }

    initTheme();

    initI18n();

    initSound();

    setCardLanguage(
        state.cardLanguage
    );

    bindEvents();

    initPageFade();
}

// ============================================================
// Start
// ============================================================

if (
    document.readyState ===
    'loading'
) {
    document.addEventListener(
        'DOMContentLoaded',
        initializeApp,
        {
            once: true
        }
    );
} else {
    initializeApp();
}