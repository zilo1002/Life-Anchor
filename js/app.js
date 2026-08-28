// --- 1. 高维度结构化“锚点”数据库 ---
// 严格区分：quote (真实引文), text (思想改写/反思), story (故事/思想实验), dialogue (短对话)
const anchorDatabase = [
    // 【迷茫 / 意义 / 提醒 / 真实引文 / 深层】
    {
        id: "a001",
        contentType: "quote", // 真实引文
        themes: ["意义", "人生"],
        emotions: ["迷茫时", "焦虑时"],
        functions: ["提醒", "安定"],
        depth: "深层",
        zh: "知道为什么而活的人，便能生存于任何处境。",
        en: "He who has a why to live can bear almost any how.",
        sourceZh: "弗里德里希·尼采 《偶像的黄昏》",
        sourceEn: "Friedrich Nietzsche, Twilight of the Idols",
        school: "存在主义"
    },
    // 【疲惫 / 自我 / 陪伴 / 思想改写 / 浅层】
    {
        id: "a002",
        contentType: "text", // 思想改写 / 思考
        themes: ["自我", "人生"],
        emotions: ["疲惫时", "难过时"],
        functions: ["陪伴", "释然"],
        depth: "浅层",
        zh: "有些事情，急着想明白，反而更想不明白。",
        en: "Some things only become clear when you stop forcing yourself to understand them.",
        sourceZh: "关于慢下来的思考",
        sourceEn: "Reflections on Slowing Down",
        school: "心理学视角"
    },
    // 【迷茫 / 意义 / 启发 / 反常识观点 / 中层】
    {
        id: "a003",
        contentType: "text",
        themes: ["意义", "选择"],
        emotions: ["迷茫时", "犹豫时"],
        functions: ["启发", "反思"],
        depth: "深层",
        zh: "人并不总是在寻找客观答案。很多时候，我们真正想要的是一个能够让自己继续生活下去的解释。",
        en: "People aren't always searching for absolute truth; often, we just need an explanation that gives us a reason to keep going.",
        sourceZh: "关于意义建构的思考",
        sourceEn: "Reflections on Meaning Making",
        school: "现代哲学"
    },
    // 【孤独 / 自由 / 安定 / 真实引文 / 深层】
    {
        id: "a004",
        contentType: "quote",
        themes: ["孤独", "自由", "死亡"],
        emotions: ["孤独时", "平静时"],
        functions: ["安定", "陪伴"],
        depth: "深层",
        zh: "人是被抛到这个世界上来的。如何面对这种状态，才是你真正的存在。",
        en: "Man is thrown into the world. How you face this state is your true existence.",
        sourceZh: "让-保罗·萨特 《存在与虚无》",
        sourceEn: "Jean-Paul Sartre, Being and Nothingness",
        school: "存在主义"
    },
    // 【犹豫 / 行动 / 警醒 / 思想实验 / 中层】
    {
        id: "a005",
        contentType: "story", // 思想实验
        themes: ["选择", "时间", "命运"],
        emotions: ["犹豫时", "想重新开始时"],
        functions: ["警醒", "行动"],
        depth: "中层",
        titleZh: "【思想实验：拉普拉斯妖与选择】",
        titleEn: "[Thought Experiment: Laplace's Demon]",
        zh: "如果有一个智者知道宇宙这一刻所有粒子位置，就能推算出你未来所有的决定。但这不重要——在你做决定的这一刻，主观上的选择权依然完全在你手里。",
        en: "Even if physical laws were predetermined, the conscious experience of choice in this moment remains uniquely yours to execute.",
        sourceZh: "物理学与决定论思考",
        sourceEn: "Reflections on Physics & Free Will",
        school: "现代哲学"
    },
    // 【焦虑 / 欲望 / 释然 / 真实引文 / 中层】
    {
        id: "a006",
        contentType: "quote",
        themes: ["欲望", "平静"],
        emotions: ["焦虑时", "疲惫时"],
        functions: ["释然", "安定"],
        depth: "中层",
        zh: "我们感受到的痛苦，往往不是来自事物本身，而是来自我们对事物的判断。",
        en: "You have power over your mind - not outside events. Realize this, and you will find strength.",
        sourceZh: "马可·奥勒留 《沉思录》",
        sourceEn: "Marcus Aurelius, Meditations",
        school: "斯多葛主义"
    },
    // 【失意 / 失去 / 陪伴 / 短对话 / 浅层】
    {
        id: "a007",
        contentType: "dialogue", // 短对话
        themes: ["失去", "成长"],
        emotions: ["失望时", "难过时"],
        functions: ["陪伴", "释然"],
        depth: "浅层",
        zh: "“如果最后还是弄丢了怎么办？”\n“那就证明它只是你人生某一段路程的陪同者，而不是终点。”",
        en: "\"What if I end up losing it anyway?\"\n\"Then it proves it was a companion for part of the journey, not the destination.\"",
        sourceZh: "对白对话录",
        sourceEn: "Short Dialogue",
        school: "文学性思考"
    },
    // 【迷茫 / 欲望 / 警醒 / 真实引文 / 深层】
    {
        id: "a008",
        contentType: "quote",
        themes: ["欲望", "希望"],
        emotions: ["焦虑时", "迷茫时"],
        functions: ["警醒", "反思"],
        depth: "深层",
        zh: "满地都是六便士，他却抬头看到了月亮。",
        en: "He was so busy looking at the moon that he did not see the sixpence at his feet.",
        sourceZh: "威廉·萨默塞特·毛姆 《月亮与六便士》",
        sourceEn: "W. Somerset Maugham, The Moon and Sixpence",
        school: "文学性思考"
    },
    // 【想重新开始 / 时间 / 提醒 / 真实引文 / 浅层】
    {
        id: "a009",
        contentType: "quote",
        themes: ["时间", "成长"],
        emotions: ["想重新开始时", "犹豫时"],
        functions: ["提醒", "行动"],
        depth: "浅层",
        zh: "凡是过往，皆为序章。",
        en: "What's past is prologue.",
        sourceZh: "威廉·莎士比亚 《暴风雨》",
        sourceEn: "William Shakespeare, The Tempest",
        school: "文学性思考"
    },
    // 【平静 / 自我 / 安定 / 东方智慧 / 中层】
    {
        id: "a010",
        contentType: "quote",
        themes: ["自我", "平静"],
        emotions: ["平静时", "疲惫时"],
        functions: ["安定", "释然"],
        depth: "中层",
        zh: "天地有大美而不言，四时有明法而不议，万物有成理而不说。",
        en: "The universe possesses great beauty without speaking; the four seasons follow eternal laws without debate.",
        sourceZh: "庄子 《知北游》",
        sourceEn: "Zhuangzi",
        school: "道家"
    }
];

// --- 2. 应用核心逻辑 ---
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

// 格式化不同内容类型的标签展示（真实引文 vs 思想思考 vs 故事对话）
function getTypeBadge(type) {
    switch (type) {
        case 'quote': return '<span class="badge badge-quote">真实引文</span>';
        case 'story': return '<span class="badge badge-story">思想实验/故事</span>';
        case 'dialogue': return '<span class="badge badge-dialogue">短对话</span>';
        case 'text': default: return '<span class="badge badge-text">思想反思</span>';
    }
}

function renderCard(item) {
    const messageCard = document.getElementById('messageCard');
    const contentBox = messageCard.querySelector('.card-content');

    contentBox.innerHTML = '';

    // 构建元数据标签栏 (功能标签 + 情绪状态 + 内容类型)
    const tagsHtml = `
        <div class="card-tags-header">
            ${getTypeBadge(item.contentType)}
            <span class="tag-item function-tag">【${item.functions[0]}】</span>
            <span class="tag-item emotion-tag">${item.emotions[0]}</span>
            <span class="tag-item depth-tag">${item.depth}</span>
        </div>
    `;

    let bodyHtml = '';
    const isDialogue = item.contentType === 'dialogue';
    const textStyleClass = isDialogue ? 'dialogue-style' : '';

    if (cardBilingualMode === 'zh') {
        bodyHtml = `
            ${item.titleZh ? `<h4 class="card-title">${item.titleZh}</h4>` : ''}
            <p class="main-message ${textStyleClass}">${item.zh.replace(/\n/g, '<br>')}</p>
            <span class="source">— ${item.sourceZh} (${item.school})</span>
        `;
    } else if (cardBilingualMode === 'en') {
        bodyHtml = `
            ${item.titleEn ? `<h4 class="card-title">${item.titleEn}</h4>` : ''}
            <p class="main-message ${textStyleClass}">${item.en.replace(/\n/g, '<br>')}</p>
            <span class="source">— ${item.sourceEn} (${item.school})</span>
        `;
    } else {
        bodyHtml = `
            <div class="bilingual-wrapper">
                ${item.titleZh ? `<h4 class="card-title">${item.titleZh} / ${item.titleEn}</h4>` : ''}
                <p class="main-message zh ${textStyleClass}">${item.zh.replace(/\n/g, '<br>')}</p>
                <p class="main-message en ${textStyleClass}">${item.en.replace(/\n/g, '<br>')}</p>
            </div>
            <span class="source">— ${item.sourceZh} / ${item.sourceEn} (${item.school})</span>
        `;
    }

    contentBox.innerHTML = tagsHtml + bodyHtml;
    messageCard.classList.add('visible');
    updateNavButtonsState();
}

function drawRandomCard() {
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
        historyPointer--;
        renderCard(historyStack[historyPointer]);
    }
}

function showNextCard() {
    if (historyPointer < historyStack.length - 1) {
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

    document.addEventListener('click', (e) => {
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
