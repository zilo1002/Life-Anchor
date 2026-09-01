const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// 自动读取环境变量 GEMINI_API_KEY
const ai = new GoogleGenAI();
const JSON_PATH = path.join(__dirname, '../data/quotes.json');

// 经官方标准确认的可用模型列表
const CANDIDATE_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash'
];

const DAILY_PROMPT = `
你是一个严谨的哲学、心理学与文学内容编辑。请生成 1 条用于心灵沉淀与生命思考的新内容（JSON 格式）。

要求与标准：
1. 严谨真实性：
   - 如果 contentType 是 "quote"，必须是现实中真实存在的原话，准确对应作者和作品，严禁捏造。
   - 如果是 "text"、"dialogue" 或 "story"，sourceZh 与 sourceEn 必须标明思考视角，绝不伪造名人名字。
2. 纯净 JSON 输出：
   必须只输出符合以下结构的 JSON 对象（不要添加任何 markdown 格式标记，如 \`\`\`json）：
   {
     "contentType": "quote",
     "zh": "中文内容",
     "en": "English content",
     "sourceZh": "中文出处/视角",
     "sourceEn": "English source/perspective"
   }
`;

function loadExistingQuotes() {
    if (!fs.existsSync(JSON_PATH)) return [];
    try {
        const rawContent = fs.readFileSync(JSON_PATH, 'utf-8').trim();
        return JSON.parse(rawContent);
    } catch (e) {
        console.warn('⚠️ 读取现有 quotes.json 失败，将创建新数组。');
        return [];
    }
}

async function generateWithFallback() {
    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
        try {
            console.log(`⏳ 尝试使用模型 [${modelName}] 生成内容...`);
            const response = await ai.models.generateContent({
                model: modelName,
                contents: DAILY_PROMPT,
                config: {
                    responseMimeType: "application/json"
                }
            });

            const rawText = response?.text || '';
            console.log(`🔍 模型 [${modelName}] 返回的内容:`, rawText);

            if (!rawText) throw new Error('模型返回文本为空');

            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanText);

            return parsedData;
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ 模型 [${modelName}] 调用失败: ${err.message}，正在尝试下一个备用模型...`);
        }
    }

    throw new Error(`❌ 所有模型均调用失败！请检查 GEMINI_API_KEY 是否在 GitHub Secrets 中配置正确且有效！\n详细错误: ${lastError?.message}`);
}

async function main() {
    const quotes = loadExistingQuotes();
    
    try {
        const newItem = await generateWithFallback();
        
        const newIndex = quotes.length + 1;
        const newId = `base_${String(newIndex).padStart(3, '0')}`;

        const formattedItem = {
            id: newId,
            contentType: newItem.contentType || 'quote',
            zh: String(newItem.zh || '').trim(),
            en: String(newItem.en || '').trim(),
            sourceZh: String(newItem.sourceZh || '未知').trim(),
            sourceEn: String(newItem.sourceEn || 'Unknown').trim()
        };

        quotes.push(formattedItem);

        const dir = path.dirname(JSON_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(JSON_PATH, JSON.stringify(quotes, null, 2), 'utf-8');
        console.log(`🎉 成功生成并追加新条目 [${newId}] 至 quotes.json！当前总计: ${quotes.length} 条。`);

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();
