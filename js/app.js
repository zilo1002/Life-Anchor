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
let currentTranslate = 0;
let prevTranslate = 0;

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
            { id: "a001", zh: "知道为什么而活的人，可以忍受任何一种生活。", sourceZh: "尼采" },
            { id: "a002", zh: "有些事情，急着想明白，反而会离答案越来越远。", sourceZh: "村上春树" }
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
// 4. 卡片渲染与 HTML 拼接
// ==========================================
function renderCardHTML(item) {
    if (!item) return '<div class="card-content-inner"><p class="main-message">暂无数据</p></div>';

    const textZh = item.zh || item.story || item.content || '';
    const textEn = item.en || item.contentEn || '';
    const srcZh = item.sourceZh || item.source || '';
    const srcEn = item.sourceEn || '';

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

function renderSlider() {
    const sliderTrack = document.getElementById('sliderTrack');
    if (!sliderTrack) return;

    sliderTrack.innerHTML = '';

    if (historyStack.length === 0) {
        updateNavButtonsState();
        return;
    }

    // 已修复：去掉了 this.
    const prevIdx = historyPointer > 0 ? historyPointer - 1 : null;
    const currIdx = historyPointer;
    const nextIdx = historyPointer < historyStack.length - 1 ? historyPointer + 1 : null;

    const indices = [prevIdx, currIdx, nextIdx];

    indices.forEach((hIdx, slotIndex) => {
        const cardSlot = document.createElement('div');
        cardSlot.className = 'card-slot';
        if (slotIndex === 1) cardSlot.classList.add('active');

        if (hIdx !== null && hIdx >= 0 && hIdx < historyStack.length) {
            const dbIndex = historyStack[hIdx];
            const item = anchorDatabase[dbIndex];
            cardSlot.innerHTML = renderCardHTML(item);
        } else {
            cardSlot.innerHTML = '';
        }

        sliderTrack.appendChild(cardSlot);
    });

    sliderTrack.style.transition = 'none';
    sliderTrack.style.transform = 'translateY(-100%)';

    updateNavButtonsState();
}

function updateNavButtonsState() {
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');

    if (btnPrev) {
        btnPrev.disabled = (historyPointer <= 0);
    }
    if (btnNext) {
        btnNext.disabled = false;
    }
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
// 7. 语言与声音控制
// ==========================================
function setupControls() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundToggle.classList.toggle('active', soundEnabled);
            playClickSound();
        });
    }

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

    drawNewCard();
});
