const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI();
const TARGET_COUNT = 500;
const BATCH_SIZE = 50;
const JSON_PATH = path.join(__dirname, '../data/quotes.json');

// 候选模型列表，防止单一模型因端点变更而 404
const CANDIDATE_MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-3.6-flash'
];

const BATCH_PROMPT = (count, currentTotal) => `
你是一个严谨的哲学、心理学与文学内容编辑。请生成 ${count} 条用于心灵沉淀与生命思考的内容（JSON 格式）。

要求与标准：
1. 严谨真实性（至关重要）：
   - 如果 contentType 是 "quote"，必须是现实中真实存在的原话，准确对应作者和作品，严禁捏造或张冠李戴。
   - 如果是 "text"（思想改写）或 "dialogue"（短对话）或 "story"（思想实验/寓言），sourceZh 与 sourceEn 必须标明思考视角（如：关于慢下来的思考 / 现代心理学视角），绝不伪造名人名字。
2. 内容多样性：
   - 涵盖人生、时间、孤独、爱、自我、选择、成长、失去、希望、自由、死亡、命运、意义等维度。
   - 包含一句话名言、两三句话思考、短对话、思想实验等多种形态。
3. 纯净 JSON 输出（严格遵守）：
   必须只输出符合以下结构的 JSON 数组（不要添加任何 markdown 格式标记，如 \`\`\`json）：
   [
     {
       "id": "base_${currentTotal + 1}",
       "contentType": "quote|text|dialogue|story",
       "zh": "中文内容",
       "en": "English translation/content",
       "sourceZh": "中文出处/视角",
       "sourceEn": "English source/perspective"
     }
   ]
`;

async function ensureDataDirExists() {
    const dir = path.dirname(JSON_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadExistingQuotes() {
    if (fs.existsSync(JSON_PATH)) {
        try {
            const content = fs.readFileSync(JSON_PATH, 'utf-8');
            return JSON.parse(content);
        } catch (e) {
            console.warn('⚠️ 现有 quotes.json 解析失败，将重新初始化');
            return [];
        }
    }
    return [];
}

async function generateBatchWithFallback(count, currentTotal) {
    for (const modelName of CANDIDATE_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: BATCH_PROMPT(count, currentTotal),
                config: {
                    responseMimeType: "application/json"
                }
            });

            const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (err) {
            console.warn(`⚠️ 本批次使用模型 [${modelName}] 调用失败 (${err.status || err.message})，尝试下一个模型...`);
        }
    }
    throw new Error('所有候选 Gemini 模型均调用失败，请检查 API Key 或网络连通性。');
}

async function main() {
    await ensureDataDirExists();
    let quotes = loadExistingQuotes();
    console.log(`📊 当前已装载 ${quotes.length} 条数据，目标数量：${TARGET_COUNT} 条。`);

    while (quotes.length < TARGET_COUNT) {
        const remaining = TARGET_COUNT - quotes.length;
        const currentBatchSize = Math.min(BATCH_SIZE, remaining);
        
        console.log(`\n⏳ 正在生成第 ${quotes.length + 1} 至 ${quotes.length + currentBatchSize} 条数据...`);

        try {
            const batchData = await generateBatchWithFallback(currentBatchSize, quotes.length);
            
            // 为生成数据补全唯一 ID
            const formattedBatch = batchData.map((item, index) => ({
                ...item,
                id: `base_${quotes.length + index + 1}`
            }));

            quotes = quotes.concat(formattedBatch);
            
            // 实时保存，防止中途网络打断丢失进度
            fs.writeFileSync(JSON_PATH, JSON.stringify(quotes, null, 2), 'utf-8');
            console.log(`✅ 已成功保存！当前进度：${quotes.length}/${TARGET_COUNT}`);

        } catch (error) {
            console.error(`❌ 本批次生成失败，等待 3 秒后重试...`, error.message);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    console.log(`\n🎉 🎉 🎉 成功完成！基础 500 条 Quotes 数据库已准备完毕并写入到：${JSON_PATH}`);
}

main();
const fs = require('fs');
const path = require('path');

// 兼容 node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 读取 API Key
const apiKey = (process.env.GEMINI_API_KEY || '').trim();

if (!apiKey) {
    console.error('❌ 错误: 未检测到环境变量 GEMINI_API_KEY！请在终端设置: export GEMINI_API_KEY="your_key"');
    process.exit(1);
}

const MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

const TARGET_TOTAL = 500;
const BATCH_SIZE = 50; // 每批获取 50 条

// 动态主题，防止多次请求生成重复内容
const CATEGORIES = [
    "人生哲学与存在主义",
    "文学经典与诗意句子",
    "治愈、内心平静与情绪锚点",
    "勇气、逆境与自我重塑",
    "时间、记忆与孤独",
    "自然、宇宙与生活美学"
];

function buildPrompt(count, categoryIndex) {
    const category = CATEGORIES[categoryIndex % CATEGORIES.length];
    return `
请生成 ${count} 条关于【${category}】领域的经典名言、金句或深度思考文字。
要求：
1. 包含中英文双语及出处。
2. 严格按照 JSON 数组格式返回，不要包含任何额外的 Markdown 标记（如 \`\`\`json ）或解释性文字。

格式范例：
[
  {
    "zh": "中文句子内容",
    "en": "English quote text",
    "sourceZh": "作者/出处中文",
    "sourceEn": "Author/Source English",
    "contentType": "single"
  }
]
`;
}

async function callGemini(modelName, promptText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function cleanAndParse(rawText) {
    if (!rawText) return [];
    const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();
    try {
        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

async function initBase500() {
    console.log(`🚀 开始生成 500 条基础数据库文件...`);
    const allQuotes = [];
    let batchCounter = 0;

    while (allQuotes.length < TARGET_TOTAL) {
        const remaining = TARGET_TOTAL - allQuotes.length;
        const currentFetchCount = Math.min(BATCH_SIZE, remaining);

        console.log(`⏳ [进度 ${allQuotes.length}/${TARGET_TOTAL}] 正在请求第 ${batchCounter + 1} 批数据...`);

        const prompt = buildPrompt(currentFetchCount, batchCounter);
        let rawResult = '';

        for (const model of MODELS) {
            try {
                rawResult = await callGemini(model, prompt);
                if (rawResult) break;
            } catch (err) {
                console.warn(`  ⚠️ 模型 ${model} 请求失败，切换备用...`);
            }
        }

        const items = cleanAndParse(rawResult);

        if (items.length > 0) {
            items.forEach(item => {
                if (item.zh && allQuotes.length < TARGET_TOTAL) {
                    allQuotes.push({
                        id: `a_${String(allQuotes.length + 1).padStart(3, '0')}`,
                        zh: String(item.zh).trim(),
                        en: item.en ? String(item.en).trim() : '',
                        sourceZh: item.sourceZh ? String(item.sourceZh).trim() : '未知',
                        sourceEn: item.sourceEn ? String(item.sourceEn).trim() : 'Unknown',
                        contentType: item.contentType || 'single'
                    });
                }
            });
            console.log(`  ✅ 本批次成功添加 ${items.length} 条，当前总计 ${allQuotes.length} 条`);
        } else {
            console.warn(`  ⚠️ 本批次未获取到有效 JSON，稍后重试...`);
        }

        batchCounter++;
        // 停顿 1 秒避开 API Rate Limit
        await new Promise(r => setTimeout(r, 1000));
    }

    // 写入文件
    const outputDir = path.join(__dirname, '../data');
    const outputFile = path.join(outputDir, 'quotes.json');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(allQuotes, null, 2), 'utf-8');
    console.log(`\n🎉 写入完成！成功在 ${outputFile} 生成 ${allQuotes.length} 条基础数据！`);
}

initBase500();