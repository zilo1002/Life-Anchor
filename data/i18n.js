const i18n = {
    zh: {
        title: "活下去的理由",
        closeHint: "点击任意处关闭",
        footerQuote: "人是被抛入世界的。但如何面对被抛入的状态，才是你真正的存在。",
        soundWater: "水滴声",
        soundClick: "轻柔点击",
        soundRed: "机械红轴",
        soundBlue: "机械青轴",
        soundBrown: "机械茶轴",
        soundSilent: "静音红轴",
        soundBell: "风铃"
    },
    en: {
        title: "Life Anchor",
        closeHint: "Click anywhere to close",
        footerQuote: "Man is thrown into the world. How you face this state is your true existence.",
        soundWater: "Water Drop",
        soundClick: "Soft Click",
        soundRed: "Linear Red",
        soundBlue: "Clicky Blue",
        soundBrown: "Tactile Brown",
        soundSilent: "Silent Red",
        soundBell: "Chime Bell"
    }
};

function getLanguage() {
    const lang = navigator.language || navigator.userLanguage || 'zh';
    return lang.startsWith('zh') ? 'zh' : 'en';
}
