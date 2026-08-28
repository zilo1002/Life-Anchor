const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI();

const PROMPT = `
你是一个严谨的哲学与文学内容编辑。请生成 30 条用于心灵沉淀与生命思考的内容（JSON 格式）。

请围绕以下核心规则：
1. 真实性与来源标明：
   - 如果 contentType 是 "quote"，必须是现实中真实存在的原话，准确对应作者和作品，严禁捏造。
   - 如果是 "text" (思想改写/思考) 或 "dialogue" (短对话) 或 "story" (思想实验/寓言)，sourceZh/sourceEn 必须明确注明思考视角（如：关于慢下来的思考 / 现代心理学视角），严禁伪造名人名字。
2. 表达多形态：包含一句话、两三句话、思想实验、反常识观点、短对话等。
3. 输出纯 JSON 数组（不要 markdown 标记）：
   [
     {
       "id": "gen_xxx",
       "contentType": "quote" | "text" | "dialogue" | "story",
       "zh": "...",
       "en": "...",
       "sourceZh": "...",
       "sourceEn": "..."
     }
   ]
`;

async function generateDailyQuotes() {
    try {
        console.log('正在调用 API 生成 30 条真实锚点内容...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: PROMPT,
            config: {
                responseMimeType: "application/json"
            }
        });

        const newQuotes = JSON.parse(response.text);

        const jsonPath = path.join(__dirname, '../data/quotes.json');
        let existingQuotes = [];

        if (fs.existsSync(jsonPath)) {
            const rawData = fs.readFileSync(jsonPath, 'utf-8');
            existingQuotes = JSON.parse(rawData);
        }

        const timestamp = Date.now();
        const formattedNewQuotes = newQuotes.map((item, index) => ({
            ...item,
            id: `gen_${timestamp}_${index + 1}`
        }));

        const updatedQuotes = [...existingQuotes, ...formattedNewQuotes];

        fs.writeFileSync(jsonPath, JSON.stringify(updatedQuotes, null, 2), 'utf-8');
        console.log(`✅ 成功添加 ${formattedNewQuotes.length} 条新内容！当前数据库总条数：${updatedQuotes.length}`);

    } catch (error) {
        console.error('❌ 生成失败:', error);
        process.exit(1);
    }
}

generateDailyQuotes();