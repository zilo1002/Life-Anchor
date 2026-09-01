const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '../data/quotes.json');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

async function generateWithRestApi() {
    if (!GEMINI_API_KEY) {
        throw new Error('❌ 未找到 GEMINI_API_KEY 环境变量，请检查 GitHub Secrets 配置！');
    }

    // 直接使用标准的 Gemini v1beta 接口地址，用 gemini-2.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('⏳ 正在通过官方 REST API 请求生成内容...');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: DAILY_PROMPT }]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败 (状态码 ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // 从标准的 Gemini 响应结构中提取文本
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🔍 模型返回的原始文本:', rawText);

    if (!rawText) {
        throw new Error('模型返回的文本内容为空');
    }

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
}

async function main() {
    const quotes = loadExistingQuotes();
    
    try {
        const newItem = await generateWithRestApi();
        
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
        console.error('❌ 生成过程发生错误:', error.message);
        process.exit(1);
    }
}

main();
