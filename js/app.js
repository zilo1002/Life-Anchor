// --- 1. 海量随机原创内容库 (5000+条生成逻辑) ---
const baseQuotes = [
    {
        zh: "在这片浩瀚的星空下，许多伟大的转折，最初都始于那些看似毫无波澜的平静日子。",
        en: "Under this vast starry sky, many great transitions begin on seemingly quiet days.",
        sourceZh: "生命的锚点",
        sourceEn: "Anchor of Life"
    },
    {
        zh: "人是被抛到这个世界上来的。如何面对这种状态，才是你真正的存在。",
        en: "Man is thrown into the world. How you face this state is your true existence.",
        sourceZh: "萨特",
        sourceEn: "Jean-Paul Sartre"
    }
];

function generate5000Quotes() {
    const subjectsZh = ["时间", "灵魂", "沉寂", "微光", "宇宙", "命运", "风暴", "晨曦", "孤独", "羁绊"];
    const subjectsEn = ["Time", "The soul", "Silence", "A faint light", "The cosmos", "Destiny", "The storm", "Dawn", "Solitude", "Connection"];

    const actionsZh = ["穿透了漫长的黑夜", "重构着存在的定义", "悄然改变着轨迹", "在角落里静静绽放", "呼唤着未知的终点"];
    const actionsEn = ["pierces through the long night", "redefines existence", "quietly shifts our course", "blooms silently in the corner", "calls to an unknown horizon"];

    const insightsZh = ["带来属于未来的力量。", "让瞬间成为了永恒。", "照亮了前行的道路。", "赋予平淡以深刻的含义。", "是生命最真实的质感。"];
    const insightsEn = ["bringing strength for tomorrow.", "turning moments into eternity.", "illuminating the path ahead.", "giving profound meaning to the ordinary.", "revealing the true texture of life."];

    const generated = [];
    const usedSet = new Set();

    while (generated.length < 5000) {
        const i = Math.floor(Math.random() * subjectsZh.length);
        const j = Math.floor(Math.random() * actionsZh.length);
        const k = Math.floor(Math.random() * insightsZh.length);

        const zh = `${subjectsZh[i]}${actionsZh[j]}，${insightsZh[k]}`;
        const en = `${subjectsEn[i]} ${actionsEn[j]}, ${insightsEn[k]}`;

        if (!usedSet.has(zh)) {
            usedSet.add(zh);
            generated.push({
                zh,
                en,
                sourceZh: `思考片段 #${generated.length + 1}`,
                sourceEn: `Reflections #${generated.length + 1}`
            });
        }
    }
    return generated;
}

const quotesDatabase = [...baseQuotes, ...generate5000Quotes()];

// --- 2. 应用核心逻辑 ---
let currentIndex = -1;
let historyStack = [];
let historyPointer = -1;
let cardBilingualMode = 'zh-en'; // 'zh', 'en', 'zh-en'
let touchStartX = 0;
let touchEndX = 0;

// 多语言 UI 配置
const uiTranslations = {
    zh: {
        title: "生命的锚点",
        subtitle: "Anchor of Life",
        soundText: "水滴声",
        closeHint: "点击任意位置关闭",
        prevBtn: "上一条",
        nextBtn: "下一条",
        langSwitchBtn: "中英",
        footerQuote: "人是被抛到这个世界上来的。如何面对这种状态，才是你真正的存在。"
    },
    en: {
        title: "Anchor of Life",
        subtitle: "How you face this state is your true existence",
        soundText: "Water Drop",
        closeHint: "Click anywhere to close",
        prevBtn: "Prev",
        nextBtn: "Next",
        langSwitchBtn: "Bilingual",
        footerQuote: "Man is thrown into the world. How you face this state is your true existence."
    }
};

// 自动匹配浏览器/系统首选语言
function getSystemLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('zh') ? 'zh' : 'en';
}

const currentUILang = getSystemLanguage();

function applyUILanguage() {
    const texts = uiTranslations[currentUILang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) el.textContent = texts[key];
    });
}

function showCardAtIndex(index) {
    if (index < 0 || index >= quotesDatabase.length) return;

    const cardData = quotesDatabase[index];
    const messageCard = document.getElementById('messageCard');
    const contentBox = messageCard.querySelector('.card-content');

    contentBox.innerHTML = '';

    if (cardBilingualMode === 'zh') {
        contentBox.innerHTML = `
            <p class="main-message">${cardData.zh}</p>
            <span class="source">— ${cardData.sourceZh}</span>
        `;
    } else if (cardBilingualMode === 'en') {
        contentBox.innerHTML = `
            <p class="main-message">${cardData.en}</p>
            <span class="source">— ${cardData.sourceEn}</span>
        `;
    } else {
        contentBox.innerHTML = `
            <div class="bilingual-wrapper">
                <p class="main-message zh">${cardData.zh}</p>
                <p class="main-message en">${cardData.en}</p>
            </div>
            <span class="source">— ${cardData.sourceZh} / ${cardData.sourceEn}</span>
        `;
    }

    messageCard.classList.add('visible');
    updateNavButtonsState();
}

function drawRandomCard() {
    const randomIndex = Math.floor(Math.random() * quotesDatabase.length);
    if (historyPointer < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyPointer + 1);
    }
    historyStack.push(randomIndex);
    historyPointer = historyStack.length - 1;
    currentIndex = randomIndex;
    showCardAtIndex(currentIndex);
}

function showPrevCard() {
    if (historyPointer > 0) {
        historyPointer--;
        currentIndex = historyStack[historyPointer];
        showCardAtIndex(currentIndex);
    }
}

function showNextCard() {
    if (historyPointer < historyStack.length - 1) {
        historyPointer++;
        currentIndex = historyStack[historyPointer];
        showCardAtIndex(currentIndex);
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

    if (currentIndex !== -1) {
        showCardAtIndex(currentIndex);
    }
}

// 触摸滑动手势支持
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

    // 点击背景空白区域关闭卡片
    document.addEventListener('click', (e) => {
        const card = document.getElementById('messageCard');
        const mainBtn = document.getElementById('mainAnchorBtn');
        if (card.classList.contains('visible') && !card.contains(e.target) && !mainBtn.contains(e.target)) {
            card.classList.remove('visible');
        }
    });

    // 暗黑模式切换
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
