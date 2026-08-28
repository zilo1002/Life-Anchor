const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI();
const JSON_PATH = path.join(__dirname, '../data/quotes.json');

const PROMPT = `
你是一个严谨的哲学与文学内容编辑。请生成 30 条用于心灵沉淀与生命思考的内容（JSON 格式）。

要求与标准：
1. 严格真实性（至关重要）：
   - 如果 contentType 是 "quote"，必须是现实中真实存在的原话，准确对应作者和作品，严禁捏造或张冠李戴。
   - 如果是 "text" (思想改写/思考) 或 "dialogue" (短对话) 或 "story" (思想实验/寓言)，sourceZh/sourceEn 必须明确注明思考视角（如：关于慢下来的思考 / 现代心理学视角），绝不伪造名人名字。
2. 表达多形态：包含一句话、两三句话、思想实验、反常识观点、短对话等。
3. 纯净 JSON 输出：
   必须只输出符合以下结构的纯 JSON 数组（不要包含任何 markdown 语法说明）：
   [
     {
       "id": "gen_时间戳_序号",
       "contentType": "quote" | "text" | "dialogue" | "story",
       "zh": "中文内容",
       "en": "English content",
       "sourceZh": "中文出处/视角",
       "sourceEn": "English source/perspective"
     }
   ]
`;

async function generateDailyQuotes() {
    try {
        console.log('⏳ 正在调用 API 生成 30 条每日锚点内容...');
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash', // 已修正模型标识名称
            contents: PROMPT,
            config: {
                responseMimeType: "application/json"
            }
        });

        const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const newQuotes = JSON.parse(rawText);

        let existingQuotes = [];
        if (fs.existsSync(JSON_PATH)) {
            const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
            existingQuotes = JSON.parse(fileData);
        }

        const timestamp = Date.now();
        const formattedNewQuotes = newQuotes.map((item, index) => ({
            ...item,
            id: `gen_${timestamp}_${index + 1}`
        }));

        const updatedQuotes = [...existingQuotes, ...formattedNewQuotes];

        fs.writeFileSync(JSON_PATH, JSON.stringify(updatedQuotes, null, 2), 'utf-8');
        console.log(`✅ 成功追加 ${formattedNewQuotes.length} 条新内容！当前数据库总计: ${updatedQuotes.length} 条。`);

    } catch (error) {
        console.error('❌ 生成失败:', error);
        process.exit(1);
    }
}

generateDailyQuotes();
