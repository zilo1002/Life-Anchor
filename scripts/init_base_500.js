const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// 初始化 SDK (会自动读取 GEMINI_API_KEY 环境变量)
const ai = new GoogleGenAI();
const TARGET_COUNT = 500;
const BATCH_SIZE = 50;
const JSON_PATH = path.join(__dirname, '../data/quotes.json');

// 候选模型列表 (优先尝试 stable 模型，兼顾 fallback)
const CANDIDATE_MODELS = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

const BATCH_PROMPT = (count, currentTotal) => `
你是一个严谨的哲学、心理学与文学内容编辑。请生成 ${count} 条用于心灵沉淀与生命思考的内容（JSON 格式）。

要求与标准：
1. 严谨真实性（至关重要）：
   - 如果 contentType 是 "quote"，必须是现实中真实存在的原话，准确对应作者和作品，严禁捏造或张冠李戴。
   - 如果是 "text"（思想改写）或 "dialogue"（短对话）或 "story"（思想实验/寓言），sourceZh 与 sourceEn 必须标明思考视角（如：关于慢下来的思考 / 现代心理学视角），绝不伪造名人名字。
2. 内容多样性：
   - 涵盖人生、时间、孤独、爱、自我、选择、成长、失去、希望、自由、命运、意义等维度。
   - 包含一句话名言、两三句话思考、短对话、思想实验等多种形态。
3. 纯净 JSON 输出（严格遵守）：
   必须只输出符合以下结构的 JSON 数组（不要添加任何 markdown 格式标记，如 \`\`\`json）：
   [
     {
       "id": "base_${currentTotal + 1}",
       "contentType": "quote",
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
            const data = JSON.parse(content);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.warn('⚠️ 现有 quotes.json 解析失败，将重新初始化数据库。');
            return [];
        }
    }
    return [];
}

async function generateBatchWithFallback(count, currentTotal) {
    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: BATCH_PROMPT(count, currentTotal),
                config: {
                    responseMimeType: "application/json"
                }
            });

            // 检查响应文本是否存在，防止 undefined.replace 报错
            const rawText = response?.text || '';
            if (!rawText) {
                throw new Error('模型返回的文本内容为空');
            }

            // 清理 Markdown 代码块标记
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            let parsedData = JSON.parse(cleanText);

            // 兜底处理：若模型返回了 { data: [...] } 或 { quotes: [...] } 等包裹对象
            if (!Array.isArray(parsedData) && typeof parsedData === 'object') {
                const arrayKey = Object.keys(parsedData).find(key => Array.isArray(parsedData[key]));
                if (arrayKey) {
                    parsedData = parsedData[arrayKey];
                }
            }

            if (!Array.isArray(parsedData)) {
                throw new Error('解析后的数据格式并非预期数组');
            }

            return parsedData;
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ 模型 [${modelName}] 调用失败 (${err.status || err.message})，尝试切换下一个备选模型...`);
        }
    }

    throw new Error(`所有候选 Gemini 模型均调用失败: ${lastError?.message || '未知错误'}`);
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
            
            // 严谨校验与 ID 格式化拼接
            const formattedBatch = batchData.map((item, index) => {
                const globalIndex = quotes.length + index + 1;
                return {
                    id: `base_${String(globalIndex).padStart(3, '0')}`,
                    contentType: item.contentType || 'quote',
                    zh: String(item.zh || item.content || '').trim(),
                    en: String(item.en || '').trim(),
                    sourceZh: String(item.sourceZh || item.source || '未知').trim(),
                    sourceEn: String(item.sourceEn || 'Unknown').trim()
                };
            });

            quotes = quotes.concat(formattedBatch);
            
            // 断点续传保存
            fs.writeFileSync(JSON_PATH, JSON.stringify(quotes, null, 2), 'utf-8');
            console.log(`✅ 已成功保存！当前进度：${quotes.length}/${TARGET_COUNT}`);

            // 防频控保护：成功获取一批后主动休眠 1.5 秒
            await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
            console.error(`❌ 本批次生成失败，等待 4 秒后重试... 原因:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }

    console.log(`\n🎉 🎉 🎉 成功完成！基础 500 条 Quotes 数据库已准备完毕并写入到：${JSON_PATH}`);
}

main();
