// ==========================================
// 1. 全局状态与配置
// ==========================================
let anchorDatabase = [];
let unshownPool = [];
let historyStack = [];
let historyPointer = -1;

// 卡片双语模式: 'zh' | 'en' | 'bilingual'
let cardBilingualMode = 'zh';

// 声音开关与 Web Audio API 资源
let soundEnabled = true;
let audioCtx = null;

// 手势滑动与 DOM 记录
let startY = 0;
let currentY = 0;
let isDragging = false;

// ==========================================
// 2. 音效生成器 (Web Audio API 纯算法合成)
// ==========================================
function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playCardDrawSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
}

function playClickSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    } catch (e) {
        console.warn('Click audio failed:', e);
    }
}

// ==========================================
// 3. 数据读取与池管理
// ==========================================
async function loadQuotesData() {
    try {
        const response = await fetch('./data/quotes.json');
        if (!response.ok) throw new Error("HTTP error " + response.status);
        anchorDatabase = await response.json();
    } catch (err) {
        console.warn('加载 ./data/quotes.json 失败，降级使用内建数据:', err);
        anchorDatabase = [
            { id: "a001", zh: "知道为什么而活的人，可以忍受任何一种生活。", sourceZh: "尼采", en: "He who has a why to live for can bear almost any how.", sourceEn: "Friedrich Nietzsche" },
            { id: "a002", zh: "有些事情，急着想明白，反而会离答案越来越远。", sourceZh: "村上春树", en: "Some things, if you try too hard to understand them, you will only get further from the answer.", sourceEn: "Haruki Murakami" }
        ];
    }
}

function resetUnshownPool() {
    unshownPool = Array.from({ length: anchorDatabase.length }, (_, i) => i);
}

function getRandomIndex() {
    if (unshownPool.length === 0) {
        resetUnshownPool();
    }
    const randomIndexWithinPool = Math.floor(Math.random() * unshownPool.length);
    const dbIndex = unshownPool[randomIndexWithinPool];
    unshownPool.splice(randomIndexWithinPool, 1);
    return dbIndex;
}

// ==========================================
// 4. 卡片渲染与 HTML 拼接 (完美匹配你的 JSON 结构)
// ==========================================
function renderCardHTML(item) {
    if (!item) return '<div class="card-content-inner"><p class="main-message">暂无数据</p></div>';

    // 适配你的 JSON 字段名（保留了多字段兜底）
    const textZh = item.zh || item.story || item.content || '';
    const textEn = item.en || item.contentEn || '';
    const srcZh = item.sourceZh || item.source || '';
    const srcEn = item.sourceEn || '';

    // 判断内容类型（对话类型可以加个特殊样式）
    const isDialogue = item.contentType === 'dialogue';
    const textStyleClass = isDialogue ? 'dialogue-style' : '';

    let bodyHtml = '';

    if (cardBilingualMode === 'zh') {
        bodyHtml = `
            ${item.titleZh ? `<h4 class="card-title">${item.titleZh}</h4>` : ''}
            <p class="main-message ${textStyleClass}">${textZh ? textZh.replace(/\n/g, '<br>') : ''}</p>
            ${srcZh ? `<span class="source">— ${srcZh}</span>` : ''}
        `;
    } else if (cardBilingualMode === 'en') {
        bodyHtml = `
            ${item.titleEn ? `<h4 class="card-title">${item.titleEn}</h4>` : ''}
            <p class="main-message ${textStyleClass}">${textEn ? textEn.replace(/\n/g, '<br>') : ''}</p>
            ${srcEn ? `<span class="source">— ${srcEn}</span>` : ''}
        `;
    } else {
        // 双语模式
        bodyHtml = `
            <div class="bilingual-wrapper">
                ${(item.titleZh || item.titleEn) ? `<h4 class="card-title">${item.titleZh || ''} / ${item.titleEn || ''}</h4>` : ''}
                <p class="main-message zh ${textStyleClass}">${textZh ? textZh.replace(/\n/g, '<br>') : ''}</p>
                ${textEn ? `<p class="main-message en ${textStyleClass}">${textEn.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
            <span class="source">— ${srcZh} ${srcEn ? '/ ' + srcEn : ''}</span>
        `;
    }

    return `<div class="card-content-inner">${bodyHtml}</div>`;
}
// ==========================================
// 5. 交互逻辑 (抽卡/前翻/后翻)
// ==========================================
function drawNewCard() {
    if (anchorDatabase.length === 0) return;

    const dbIndex = getRandomIndex();
    historyStack.push(dbIndex);
    historyPointer = historyStack.length - 1;

    renderSlider();
    playCardDrawSound();

    // 核心修复：确保抽卡时卡片弹出显示
    const sliderContainer = document.getElementById('sliderContainer');
    if (sliderContainer) {
        sliderContainer.classList.add('visible');
    }
}

function showPrevCard() {
    if (historyPointer > 0) {
        historyPointer--;
        renderSlider();
        playClickSound();
    }
}

function showNextCard() {
    if (historyPointer < historyStack.length - 1) {
        historyPointer++;
        renderSlider();
        playClickSound();
    } else {
        drawNewCard();
    }
}

// ==========================================
// 6. 触摸与手势滑动处理
// ==========================================
function setupGestureListeners() {
    const sliderContainer = document.getElementById('sliderContainer');
    const sliderTrack = document.getElementById('sliderTrack');
    if (!sliderContainer || !sliderTrack) return;

    sliderContainer.addEventListener('touchstart', touchStart, { passive: true });
    sliderContainer.addEventListener('touchmove', touchMove, { passive: true });
    sliderContainer.addEventListener('touchend', touchEnd);

    sliderContainer.addEventListener('mousedown', touchStart);
    sliderContainer.addEventListener('mousemove', touchMove);
    sliderContainer.addEventListener('mouseup', touchEnd);
    sliderContainer.addEventListener('mouseleave', touchEnd);

    function touchStart(event) {
        isDragging = true;
        startY = getPositionY(event);
        sliderTrack.style.transition = 'none';
    }

    function touchMove(event) {
        if (!isDragging) return;
        const currentPositionY = getPositionY(event);
        currentY = currentPositionY - startY;
        sliderTrack.style.transform = `translateY(calc(-100% + ${currentY}px))`;
    }

    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const threshold = 50;
        if (currentY < -threshold) {
            showNextCard();
        } else if (currentY > threshold) {
            showPrevCard();
        } else {
            sliderTrack.style.transition = 'transform 0.3s ease';
            sliderTrack.style.transform = 'translateY(-100%)';
        }
        currentY = 0;
    }

    function getPositionY(event) {
        return event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    }
}

// ==========================================
// 7. 语言、声音与主题控制
// ==========================================
function setupControls() {
    // 主题切换
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            playClickSound();
        });
    }

    // 声音开关
    const soundToggle = document.getElementById('soundToggle');
    const soundStatusText = document.getElementById('soundStatusText');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (soundStatusText) {
                soundStatusText.textContent = soundEnabled ? '音效已开' : '音效已关';
            }
            playClickSound();
        });
    }

    // 语言切换
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            if (cardBilingualMode === 'zh') cardBilingualMode = 'en';
            else if (cardBilingualMode === 'en') cardBilingualMode = 'bilingual';
            else cardBilingualMode = 'zh';

            langToggle.textContent = cardBilingualMode.toUpperCase();
            renderSlider();
            playClickSound();
        });
    }

    // 底部导航按钮
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnDraw = document.getElementById('btnDraw');

    if (btnPrev) btnPrev.addEventListener('click', showPrevCard);
    if (btnNext) btnNext.addEventListener('click', showNextCard);
    if (btnDraw) btnDraw.addEventListener('click', drawNewCard);
}

// ==========================================
// 8. 页面初始化
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadQuotesData();
    resetUnshownPool();
    setupGestureListeners();
    setupControls();
});
