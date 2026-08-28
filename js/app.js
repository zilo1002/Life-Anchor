// --- 1. Web Audio API 音效生成器 (包含多种机械键盘轴体及风铃声) ---
class AnchorSoundEngine {
    constructor() {
        this.ctx = null;
        this.currentSound = 'blue'; // 默认：青轴 ('blue', 'red', 'brown', 'yellow', 'wind', 'water')
    }

    initCtx() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play() {
        this.initCtx();
        const now = this.ctx.currentTime;

        switch (this.currentSound) {
            case 'blue':
                this.playMechanicalSwitch(now, { clickFreq: 2400, popFreq: 350, clickDecay: 0.015, bodyDecay: 0.04, pitchJump: true });
                break;
            case 'red':
                this.playMechanicalSwitch(now, { clickFreq: 1100, popFreq: 180, clickDecay: 0.02, bodyDecay: 0.05, pitchJump: false });
                break;
            case 'brown':
                this.playMechanicalSwitch(now, { clickFreq: 1600, popFreq: 240, clickDecay: 0.018, bodyDecay: 0.045, pitchJump: true });
                break;
            case 'yellow':
                this.playMechanicalSwitch(now, { clickFreq: 800, popFreq: 120, clickDecay: 0.025, bodyDecay: 0.07, pitchJump: false });
                break;
            case 'wind':
                this.playWindChime(now);
                break;
            case 'water':
                this.playWaterDrop(now);
                break;
            default:
                break;
        }
    }

    playMechanicalSwitch(now, config) {
        const bufferSize = this.ctx.sampleRate * config.clickDecay;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = config.clickFreq;
        noiseFilter.Q.value = 3;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + config.clickDecay);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);

        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();

        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(config.popFreq, now);

        if (config.pitchJump) {
            bodyOsc.frequency.exponentialRampToValueAtTime(config.popFreq * 0.4, now + config.bodyDecay);
        }

        bodyGain.gain.setValueAtTime(0.5, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + config.bodyDecay);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(this.ctx.destination);

        bodyOsc.start(now);
        bodyOsc.stop(now + config.bodyDecay);
    }

    playWindChime(now) {
        const freqs = [1567.98, 2093.00, 2349.32];
        freqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = f;

            const delay = idx * 0.04;
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 1.2);
        });
    }

    playWaterDrop(now) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }
}

const soundEngine = new AnchorSoundEngine();

// --- 2. 去重池与全局状态 ---
let anchorDatabase = []; // 总数据（包含 500+ 基础数据及每日自动新增数据）
let unshownPool = [];    // 未抽取的索引池（核心去重机制）
let historyStack = [];   // 浏览历史（供上一条/下一条导航）
let historyPointer = -1; // 历史记录指针
let cardBilingualMode = 'zh-en';
let touchStartX = 0;
let touchEndX = 0;

// 初始化未抽取池
function resetUnshownPool() {
    unshownPool = anchorDatabase.map((_, index) => index);
}

// 多语言 UI 配置
const uiTranslations = {
    zh: {
        title: "生命的锚点",
        subtitle: "Anchor of Life",
        soundText: { blue: "青轴 (Clicky)", red: "红轴 (线性)", brown: "茶轴 (段落)", yellow: "黄轴 (厚重)", wind: "风铃声", water: "水滴声" },
        closeHint: "点击任意位置关闭",
        prevBtn: "上一条",
        nextBtn: "下一条",
        langSwitchBtn: "中英"
    },
    en: {
        title: "Anchor of Life",
        subtitle: "How you face this state is your true existence",
        soundText: { blue: "Blue Switch", red: "Red Switch", brown: "Brown Switch", yellow: "Yellow Switch", wind: "Wind Chime", water: "Water Drop" },
        closeHint: "Click anywhere to close",
        prevBtn: "Prev",
        nextBtn: "Next",
        langSwitchBtn: "Bilingual"
    }
};

function getSystemLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('zh') ? 'zh' : 'en';
}

const currentUILang = getSystemLanguage();

function applyUILanguage() {
    const texts = uiTranslations[currentUILang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key === 'soundText') {
            el.textContent = texts.soundText[soundEngine.currentSound] || texts.soundText.blue;
        } else if (texts[key]) {
            el.textContent = texts[key];
        }
    });
}

function renderCard(item) {
    const messageCard = document.getElementById('messageCard');
    const contentBox = messageCard.querySelector('.card-content');

    contentBox.innerHTML = '';

    let bodyHtml = '';
    const isDialogue = item.contentType === 'dialogue';
    const textStyleClass = isDialogue ? 'dialogue-style' : '';

    if (cardBilingualMode === 'zh') {
        bodyHtml = `
            ${item.titleZh ? `<h4 class="card-title">${item.titleZh}</h4>` : ''}
            <p class="main-message ${textStyleClass}">${item.zh.replace(/\n/g, '<br>')}</p>
            <span class="source">— ${item.sourceZh}</span>
        `;
    } else if (cardBilingualMode === 'en') {
        bodyHtml = `
            ${item.titleEn ? `<h4 class="card-title">${item.titleEn}</h4>` : ''}
            <p class="main-message ${textStyleClass}">${item.en.replace(/\n/g, '<br>')}</p>
            <span class="source">— ${item.sourceEn}</span>
        `;
    } else {
        bodyHtml = `
            <div class="bilingual-wrapper">
                ${item.titleZh ? `<h4 class="card-title">${item.titleZh} / ${item.titleEn}</h4>` : ''}
                <p class="main-message zh ${textStyleClass}">${item.zh.replace(/\n/g, '<br>')}</p>
                <p class="main-message en ${textStyleClass}">${item.en.replace(/\n/g, '<br>')}</p>
            </div>
            <span class="source">— ${item.sourceZh} / ${item.sourceEn}</span>
        `;
    }

    contentBox.innerHTML = bodyHtml;
    messageCard.classList.add('visible');
    updateNavButtonsState();
}

// --- 核心抽取算法：绝对不重复 ---
function drawRandomCard() {
    if (anchorDatabase.length === 0) return;

    soundEngine.play();

    // 如果未抽取池为空（所有句子已看一遍），重置池子重新开始
    if (unshownPool.length === 0) {
        resetUnshownPool();
    }

    // 从未抽取池中随机挑选一个索引
    const randomIndexInPool = Math.floor(Math.random() * unshownPool.length);
    const targetDatabaseIndex = unshownPool[randomIndexInPool];

    // 从池中剔除该句子，保证后续不再出现
    unshownPool.splice(randomIndexInPool, 1);

    const item = anchorDatabase[targetDatabaseIndex];

    // 维护历史浏览栈
    if (historyPointer < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyPointer + 1);
    }

    historyStack.push(item);
    historyPointer = historyStack.length - 1;

    renderCard(item);
}

function showPrevCard() {
    if (historyPointer > 0) {
        soundEngine.play();
        historyPointer--;
        renderCard(historyStack[historyPointer]);
    }
}

function showNextCard() {
    if (historyPointer < historyStack.length - 1) {
        soundEngine.play();
        historyPointer++;
        renderCard(historyStack[historyPointer]);
    } else {
        drawRandomCard();
    }
}

function updateNavButtonsState() {
    const prevBtn = document.getElementById('cardNavPrev');
    if (prevBtn) prevBtn.disabled = historyPointer <= 0;
}

function cycleCardLanguageMode() {
    if (cardBilingualMode === 'zh-en') cardBilingualMode = 'zh';
    else if (cardBilingualMode === 'zh') cardBilingualMode = 'en';
    else cardBilingualMode = 'zh-en';

    if (historyPointer >= 0 && historyStack[historyPointer]) {
        renderCard(historyStack[historyPointer]);
    }
}

function setupTouchEvents() {
    const card = document.getElementById('messageCard');
    if (!card) return;

    card.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    card.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) showNextCard();
        if (touchEndX > touchStartX + swipeThreshold) showPrevCard();
    }, false);
}

// 动态装载 quotes.json 数据
async function loadQuotesData() {
    try {
        const response = await fetch('./data/quotes.json');
        if (!response.ok) throw new Error("HTTP error " + response.status);
        anchorDatabase = await response.json();
    } catch (err) {
        console.warn('加载 ./data/quotes.json 失败，降级使用内建数据:', err);
        anchorDatabase = [
            {
                id: "a001",
                contentType: "quote",
                zh: "知道为什么而活的人，便能生存于任何处境。",
                en: "He who has a why to live can bear almost any how.",
                sourceZh: "弗里德里希·尼采 《偶像的黄昏》",
                sourceEn: "Friedrich Nietzsche, Twilight of the Idols"
            },
            {
                id: "a002",
                contentType: "text",
                zh: "有些事情，急着想明白，反而更想不明白。",
                en: "Some things only become clear when you stop forcing yourself to understand them.",
                sourceZh: "关于慢下来的思考",
                sourceEn: "Reflections on Slowing Down"
            }
        ];
    } finally {
        resetUnshownPool();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    applyUILanguage();
    setupTouchEvents();

    await loadQuotesData();

    const soundMenu = document.getElementById('soundMenu');
    if (soundMenu) {
        soundMenu.innerHTML = `
            <button class="sound-option active" data-sound="blue">青轴 (Clicky)</button>
            <button class="sound-option" data-sound="red">红轴 (线性)</button>
            <button class="sound-option" data-sound="brown">茶轴 (段落)</button>
            <button class="sound-option" data-sound="yellow">黄轴 (厚重)</button>
            <button class="sound-option" data-sound="wind">风铃声</button>
            <button class="sound-option" data-sound="water">水滴声</button>
        `;
    }

    document.getElementById('mainAnchorBtn')?.addEventListener('click', drawRandomCard);

    document.getElementById('cardNavPrev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevCard();
    });

    document.getElementById('cardNavNext')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextCard();
    });

    document.getElementById('cardLangToggle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleCardLanguageMode();
    });

    const soundBtn = document.getElementById('soundBtn');
    const soundText = document.getElementById('soundText');

    soundBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        soundMenu.classList.toggle('show');
    });

    document.querySelectorAll('.sound-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            
            const selectedSound = opt.getAttribute('data-sound');
            soundEngine.currentSound = selectedSound;
            soundEngine.play();

            const texts = uiTranslations[currentUILang].soundText;
            if (soundText) soundText.textContent = texts[selectedSound] || opt.textContent;

            soundMenu.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (soundMenu && !soundMenu.contains(e.target)) {
            soundMenu.classList.remove('show');
        }

        const card = document.getElementById('messageCard');
        const mainBtn = document.getElementById('mainAnchorBtn');
        if (card.classList.contains('visible') && !card.contains(e.target) && !mainBtn.contains(e.target)) {
            card.classList.remove('visible');
        }
    });

    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'dark');
        }
    });
});
