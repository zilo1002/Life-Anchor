const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// 1. 初始化 Google GenAI 客户端（自动读取环境变量 GEMINI_API_KEY）
const ai = new GoogleGenAI();

// 2. 定位数据文件路径：从 scripts/ 目录指向根目录的 data/quotes.json
const JSON_PATH = path.join(__dirname, '../data/quotes.json');

// 3. 自动化生成 Prompt，注入严格真实性与多形态规则
const PROMPT = `
你是一个严谨的哲学、心理学与文学内容编辑。请生成 30 条用于心灵沉淀与生命思考的内容（JSON 格式）。

要求与标准：
1. 严谨真实性（至关重要）：
   - 如果 contentType 是 "quote"，必须是现实中真实存在的原话，准确对应作者和作品，严禁捏造或张冠李戴。
   - 如果是 "text"（思想改写）或 "dialogue"（短对话）或 "story"（思想实验/寓言），sourceZh 与 sourceEn 必须标明思考视角（如：关于慢下来的思考 / 现代心理学视角），绝不伪造名人名字。
2. 内容多形态：
   - 涵盖人生、时间、孤独、爱、自我、选择、成长、失去、希望、自由、命运、意义等维度。
   - 包含一句话名言、两三句话思考、短对话、思想实验等多种形态。
3. 纯净 JSON 输出：
   必须只输出符合以下结构的纯 JSON 数组（不要包含任何 markdown 语法标记，如 \`\`\`json）：
   [
     {
       "id": "gen_时间戳_序号",
       "contentType": "quote|text|dialogue|story",
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

        // 调用 SDK 最新 API，使用最新支持的模型 gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: PROMPT,
            config: {
                responseMimeType: "application/json"
            }
        });

        // 容错处理：过滤 AI 可能附带的 markdown 格式化标记
        const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const newQuotes = JSON.parse(rawText);

        // 读取现有的 quotes.json，如果不存在则自动新建
        let existingQuotes = [];
        if (fs.existsSync(JSON_PATH)) {
            const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
            existingQuotes = JSON.parse(fileData);
        } else {
            console.warn('⚠️ 未找到 quotes.json，将自动初始化新文件...');
            const dataDir = path.dirname(JSON_PATH);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
        }

        // 规范化生成唯一 ID 并追加到现有列表
        const timestamp = Date.now();
        const formattedNewQuotes = newQuotes.map((item, index) => ({
            ...item,
            id: `gen_${timestamp}_${index + 1}`
        }));

        const updatedQuotes = [...existingQuotes, ...formattedNewQuotes];

        // 写入 data/quotes.json
        fs.writeFileSync(JSON_PATH, JSON.stringify(updatedQuotes, null, 2), 'utf-8');
        console.log(`✅ 成功追加 ${formattedNewQuotes.length} 条新内容！当前数据库总计: ${updatedQuotes.length} 条。`);

    } catch (error) {
        console.error('❌ 生成失败:', error);
        process.exit(1); // 抛出非零状态码，确保 GitHub Action 能捕捉到异常并记录 log
    }
}

generateDailyQuotes();
