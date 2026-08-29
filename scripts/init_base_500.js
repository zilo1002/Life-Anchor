const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// 自动读取环境变量 GEMINI_API_KEY
const ai = new GoogleGenAI();
const TARGET_COUNT = 500;
const BATCH_SIZE = 50;
const JSON_PATH = path.join(__dirname, '../data/quotes.json');

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
   - 避免生成过于同质化的名言（如不要重复加缪、尼采、加缪《夏天集》等已被高频使用的句子）。
3. 纯净 JSON 输出（严格遵守）：
   必须只输出符合以下结构的 JSON 数组（不要添加任何 markdown 格式标记，如 \`\`\`json）：
   [
     {
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

// 加载现有数据并进行强力去重与格式重整
function loadAndDeduplicateQuotes() {
    if (!fs.existsSync(JSON_PATH)) return [];

    try {
        const rawContent = fs.readFileSync(JSON_PATH, 'utf-8');
        // 处理文件不完整或格式有误的情况
        let cleanContent = rawContent.trim();
        if (cleanContent.endsWith(',')) {
            cleanContent = cleanContent.slice(0, -1) + ']';
        } else if (!cleanContent.endsWith(']')) {
            cleanContent = cleanContent + ']';
        }

        const data = JSON.parse(cleanContent);
        if (!Array.isArray(data)) return [];

        const seenZh = new Set();
        const deduplicated = [];

        for (const item of data) {
            if (!item || !item.zh) continue;
            
            // 取前 15 个字符做简化对比，防止仅因标点符号微调导致的重复
            const key = item.zh.trim().substring(0, 15);
            if (!seenZh.has(key)) {
                seenZh.add(key);
                deduplicated.push(item);
            }
        }

        console.log(`🧹 已对现有数据清洗去重：原数据件数 -> 精简后剩余 ${deduplicated.length} 条有效独特数据。`);
        return deduplicated;
    } catch (e) {
        console.warn('⚠️ 读取现有 quotes.json 失败或格式损坏，将从空数据库开始生成。');
        return [];
    }
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

            const rawText = response?.text || '';
            if (!rawText) throw new Error('模型返回文本为空');

            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            let parsedData = JSON.parse(cleanText);

            if (!Array.isArray(parsedData) && typeof parsedData === 'object') {
                const arrayKey = Object.keys(parsedData).find(key => Array.isArray(parsedData[key]));
                if (arrayKey) parsedData = parsedData[arrayKey];
            }

            if (!Array.isArray(parsedData)) throw new Error('解析后不是数组');

            return parsedData;
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ 模型 [${modelName}] 失败 (${err.message})，尝试切换备选...`);
        }
    }

    throw new Error(`所有候选 Gemini 模型均调用失败: ${lastError?.message || '未知错误'}`);
}

async function main() {
    await ensureDataDirExists();
    let quotes = loadAndDeduplicateQuotes();
    
    // 初始化重新编号
    quotes = quotes.map((item, idx) => ({
        ...item,
        id: `base_${String(idx + 1).padStart(3, '0')}`
    }));

    console.log(`📊 准备工作就绪！当前有效数据：${quotes.length} 条，目标：${TARGET_COUNT} 条。`);

    while (quotes.length < TARGET_COUNT) {
        const remaining = TARGET_COUNT - quotes.length;
        const currentBatchSize = Math.min(BATCH_SIZE, remaining);
        
        console.log(`\n⏳ 正在生成第 ${quotes.length + 1} 至 ${quotes.length + currentBatchSize} 条数据...`);

        try {
            const batchData = await generateBatchWithFallback(currentBatchSize, quotes.length);
            
            let addedCount = 0;
            for (const item of batchData) {
                if (quotes.length >= TARGET_COUNT) break;
                if (!item.zh) continue;

                // 再次全局查重，确保新生成的不与已有重复
                const key = item.zh.trim().substring(0, 15);
                const isDuplicate = quotes.some(q => q.zh.trim().substring(0, 15) === key);

                if (!isDuplicate) {
                    quotes.push({
                        id: `base_${String(quotes.length + 1).padStart(3, '0')}`,
                        contentType: item.contentType || 'quote',
                        zh: String(item.zh).trim(),
                        en: String(item.en || '').trim(),
                        sourceZh: String(item.sourceZh || '未知').trim(),
                        sourceEn: String(item.sourceEn || 'Unknown').trim()
                    });
                    addedCount++;
                }
            }

            // 实时更新并写回本地 json 磁盘
            fs.writeFileSync(JSON_PATH, JSON.stringify(quotes, null, 2), 'utf-8');
            console.log(`✅ 本批次成功新增 ${addedCount} 条独特数据！当前进度：${quotes.length}/${TARGET_COUNT}`);

            // 停顿 1.5 秒避开限流
            await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
            console.error(`❌ 生成失败，4秒后重试... 原因:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }

    console.log(`\n🎉 🎉 🎉 成功！去重并补齐完毕！干净整洁的 500 条数据已保存至：${JSON_PATH}`);
}

main();
