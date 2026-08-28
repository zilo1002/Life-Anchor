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
            case 'blue': // 青轴 (Clicky)：高调段落感，清脆 Click 声 + 弹簧底噪
                this.playMechanicalSwitch(now, { clickFreq: 2400, popFreq: 350, clickDecay: 0.015, bodyDecay: 0.04, pitchJump: true });
                break;

            case 'red': // 红轴 (Linear)：轻盈直上直下，软润触底声
                this.playMechanicalSwitch(now, { clickFreq: 1100, popFreq: 180, clickDecay: 0.02, bodyDecay: 0.05, pitchJump: false });
                break;

            case 'brown': // 茶轴 (Tactile)：微弱段落感，温和沉稳
                this.playMechanicalSwitch(now, { clickFreq: 1600, popFreq: 240, clickDecay: 0.018, bodyDecay: 0.045, pitchJump: true });
                break;

            case 'yellow': // 黄轴 (Heavy Linear)：重触底，木质沉闷厚重声
                this.playMechanicalSwitch(now, { clickFreq: 800, popFreq: 120, clickDecay: 0.025, bodyDecay: 0.07, pitchJump: false });
                break;

            case 'wind': // 风铃声：清亮双音延音
                this.playWindChime(now);
                break;

            case 'water': // 水滴声：向上滑音
                this.playWaterDrop(now);
                break;

            default:
                break;
        }
    }

    // 机械轴体模拟算法：噪声冲激（弹簧/接触点） + 低频正弦波（定位板触底震动）
    playMechanicalSwitch(now, config) {
        // 1. 高频 Click / 触底摩擦噪声
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

        // 2. 外壳/定位板触底低频闷音 (Thock)
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

    // 风铃音效
    playWindChime(now) {
        const freqs = [1567.98, 2093.00, 2349.32]; // G6, C7, D7
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

    // 水滴音效
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

// --- 2. 静心“锚点”数据库 ---
const anchorDatabase = [
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
    },
    {
        id: "a003",
        contentType: "text",
        zh: "人并不总是在寻找客观答案。很多时候，我们真正想要的是一个能够让自己继续生活下去的解释。",
        en: "People aren't always searching for absolute truth; often, we just need an explanation that gives us a reason to keep going.",
        sourceZh: "关于意义建构的思考",
        sourceEn: "Reflections on Meaning Making"
    },
    {
        id: "a004",
        contentType: "quote",
        zh: "人是被抛到这个世界上来的。如何面对这种状态，才是你真正的存在。",
        en: "Man is thrown into the world. How you face this state is your true existence.",
        sourceZh: "让-保罗·萨特 《存在与虚无》",
        sourceEn: "Jean-Paul Sartre, Being and Nothingness"
    },
    {
        id: "a005",
        contentType: "story",
        titleZh: "【思想实验：拉普拉斯妖】",
        titleEn: "[Thought Experiment: Laplace's Demon]",
        zh: "即便物理规律早已预设好一切轨迹，在你做出选择的那一刻，主观体验上的决定权依然完全属于你自己。",
        en: "Even if physical laws were predetermined, the conscious experience of choice in this moment remains uniquely yours.",
        sourceZh: "物理学与自由意志思考",
        sourceEn: "Reflections on Physics & Free Will"
    },
    {
        id: "a006",
        contentType: "quote",
        zh: "我们感受到的痛苦，往往不是来自事物本身，而是来自我们对事物的判断。",
        en: "You have power over your mind - not outside events. Realize this, and you will find strength.",
        sourceZh: "马可·奥勒留 《沉思录》",
        sourceEn: "Marcus Aurelius, Meditations"
    },
    {
        id: "a007",
        contentType: "dialogue",
        zh: "“如果最后还是弄丢了怎么办？”\n“那就证明它只是你人生某一段路程的陪同者，而不是终点。”",
        en: "\"What if I end up losing it anyway?\"\n\"Then it proves it was a companion for part of the journey, not the destination.\"",
        sourceZh: "对白对话录",
        sourceEn: "Short Dialogue"
    },
    {
        id: "a008",
        contentType: "quote",
        zh: "满地都是六便士，他却抬头看到了月亮。",
        en: "He was so busy looking at the moon that he did not see the sixpence at his feet.",
        sourceZh: "威廉·萨默塞特·毛姆 《月亮与六便士》",
        sourceEn: "W. Somerset Maugham, The Moon and Sixpence"
    },
    {
        id: "a009",
        contentType: "quote",
        zh: "凡是过往，皆为序章。",
        en: "What's past is prologue.",
        sourceZh: "威廉·莎士比亚 《暴风雨》",
        sourceEn: "William Shakespeare, The Tempest"
    },
    {
        id: "a010",
        contentType: "quote",
        zh: "天地有大美而不言，四时有明法而不议，万物有成理而不说。",
        en: "The universe possesses great beauty without speaking; the four seasons follow eternal laws without debate.",
        sourceZh: "庄子 《知北游》",
        sourceEn: "Zhuangzi"
    }
];

// --- 3. 应用核心交互逻辑 ---
let currentIndex = -1;
let historyStack = [];
let historyPointer = -1;
let cardBilingualMode = 'zh-en'; 
let touchStartX = 0;
let touchEndX = 0;

// 多语言 UI 配置
const uiTranslations = {
    zh: {
        title: "生命的锚点",
        subtitle: "Anchor of Life",
        soundText: { blue: "青轴 (Clicky)", red: "红轴 (线性)", brown: "茶轴 (段落)", yellow: "黄轴 (厚重)", wind: "风铃声", water: "水滴声" },
        closeHint: "点击任意位置关闭",
        prevBtn: "上一条",
        nextBtn: "下一条",
        langSwitchBtn: "中英",
        footerQuote: "人是被抛到这个世界上来的。如何面对这种状态，才是你真正的存在。"
    },
    en: {
        title: "Anchor of Life",
        subtitle: "How you face this state is your true existence",
        soundText: { blue: "Blue Switch", red: "Red Switch", brown: "Brown Switch", yellow: "Yellow Switch", wind: "Wind Chime", water: "Water Drop" },
        closeHint: "Click anywhere to close",
        prevBtn: "Prev",
        nextBtn: "Next",
        langSwitchBtn: "Bilingual",
        footerQuote: "Man is thrown into the world. How you face this state is your true existence."
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

function drawRandomCard() {
    soundEngine.play(); // 播放所选轴体/音效

    const randomIndex = Math.floor(Math.random() * anchorDatabase.length);
    const item = anchorDatabase[randomIndex];

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

// 触摸手势
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    applyUILanguage();
    setupTouchEvents();

    // 重新填充声音菜单选项
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

    // 绑定主要抽取按钮
    document.getElementById('mainAnchorBtn')?.addEventListener('click', drawRandomCard);

    // 绑定导航与功能按钮
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

    // 声音菜单逻辑
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
            
            // 试听音效
            soundEngine.play();

            // 更新文本
            const texts = uiTranslations[currentUILang].soundText;
            if (soundText) soundText.textContent = texts[selectedSound] || opt.textContent;

            soundMenu.classList.remove('show');
        });
    });

    // 点击空白关闭菜单或卡片
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

    // 主题切换
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
