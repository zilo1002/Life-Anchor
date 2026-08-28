const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI();
const TARGET_COUNT = 500;
const BATCH_SIZE = 50;
const JSON_PATH = path.join(__dirname, '../data/quotes.json');

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

async function generateBatch(count, currentTotal) {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: BATCH_PROMPT(count, currentTotal),
        config: {
            responseMimeType: "application/json"
        }
    });

    const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
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
            const batchData = await generateBatch(currentBatchSize, quotes.length);
            
            // 为生成数据补全唯一 ID
            const formattedBatch = batchData.map((item, index) => ({
                ...item,
                id: `base_${quotes.length + index + 1}`
            }));

            quotes = quotes.concat(formattedBatch);
            
            // 实时保存，防止中断 loss
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