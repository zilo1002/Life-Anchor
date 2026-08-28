/*
 * Life Anchor — UI language
 * Follows the browser/system preferred language.
 * Chinese is the default; English is provided as the fallback translation.
 */
const LifeAnchorI18n = (() => {
    const translations = {
        zh: {
            title: "活下去的理由",
            subtitle: "LIFE ANCHOR",
            sound: "声音",
            soundOff: "关闭声音",
            ambient: "环境音",
            rain: "雨声",
            forest: "森林",
            waves: "海浪",
            prev: "上一条",
            next: "下一条",
            close: "点击任意处关闭",
            anchor: "活下去的理由",
            held: "你被接住了", cardZh: "中文", cardEn: "English", cardBi: "中英"
        },
        en: {
            title: "A Reason to Stay",
            subtitle: "LIFE ANCHOR",
            sound: "Sound",
            soundOff: "Sound Off",
            ambient: "Ambient",
            rain: "Rain",
            forest: "Forest",
            waves: "Waves",
            prev: "Previous",
            next: "Next",
            close: "Tap anywhere to close",
            anchor: "A Reason to Stay",
            held: "You are held", cardZh: "Chinese", cardEn: "English", cardBi: "Bilingual"
        }
    };

    function getLanguage() {
        const languages = Array.isArray(navigator.languages) && navigator.languages.length
            ? navigator.languages
            : [navigator.language || "zh-CN"];

        return languages.some(lang => String(lang).toLowerCase().startsWith("zh"))
            ? "zh"
            : "en";
    }

    function get(key) {
        const lang = getLanguage();
        return translations[lang][key] ?? translations.en[key] ?? key;
    }

    function apply(root = document) {
        const lang = getLanguage();
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        document.documentElement.dataset.language = lang;

        root.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.dataset.i18n;
            const value = get(key);
            if (element.hasAttribute("data-i18n-aria")) {
                element.setAttribute("aria-label", value);
            } else {
                element.textContent = value;
            }
        });

        root.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            element.placeholder = get(element.dataset.i18nPlaceholder);
        });
    }

    return { getLanguage, get, apply };
})();
