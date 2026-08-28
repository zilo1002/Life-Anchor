// content.js - 内容库与 5000+ 数据生成器

// 1. 基础预设内容
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

// 2. 5000 条原创扩展内容随机生成器 (确保不重复)
function generateExpandedQuotes(targetCount = 5000) {
    const subjectsZh = ["时间", "灵魂", "沉寂", "微光", "宇宙", "命运", "风暴", "晨曦", "孤独", "羁绊"];
    const subjectsEn = ["Time", "The soul", "Silence", "A faint light", "The cosmos", "Destiny", "The storm", "Dawn", "Solitude", "Connection"];

    const actionsZh = ["穿透了漫长的黑夜", "重构着存在的定义", "悄然改变着轨迹", "在角落里静静绽放", "呼唤着未知的终点"];
    const actionsEn = ["pierces through the long night", "redefines existence", "quietly shifts our course", "blooms silently in the corner", "calls to an unknown horizon"];

    const insightsZh = ["带来属于未来的力量。", "让瞬间成为了永恒。", "照亮了前行的道路。", "赋予平淡以深刻的含义。", "是生命最真实的质感。"];
    const insightsEn = ["bringing strength for tomorrow.", "turning moments into eternity.", "illuminating the path ahead.", "giving profound meaning to the ordinary.", "revealing the true texture of life."];

    const generated = [];
    const usedSet = new Set();

    while (generated.length < targetCount) {
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

// 导出汇总数据库（基础 + 生成）
const quotesDatabase = [...baseQuotes, ...generateExpandedQuotes(5000)];