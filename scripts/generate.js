const fs = require('fs');
const path = require('path');

// 兼容 Node.js 基础环境下的 fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 1. 获取并清洗 API Key
const apiKey = (process.env.GEMINI_API_KEY || '').trim();

if (!apiKey) {
    console.error('❌ 致命错误: 环境变量 GEMINI_API_KEY 为空！请检查 Workflow yml 文件的 env 配置及 GitHub Secrets！');
    process.exit(1);
}

// 2. 备选模型列表
const MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

// 3. Prompt 设定
const PROMPT = `
请生成 15 条能够震撼人心、给人生活力量、引发深度思考的金句或名言（包含哲学、文学、历史及当代治愈系文字）。
请严格按照以下 JSON 数组格式返回，不要包含任何额外的 Markdown 标记（如 \`\`\`json ）或解释性文字：

[
  {
    "id": "q_001",
    "zh": "中文句子内容",
    "en": "English quote text",
    "sourceZh": "作者/出处中文",
    "sourceEn": "Author/Source English",
    "contentType": "single"
  }
]
`;

async function callGeminiAPI(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: PROMPT }]
            }]
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// 4. 数据清洗与格式转换
function parseAndCleanQuotes(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        throw new Error('API 返回的数据内容为空');
    }

    // 剔除 markdown 语法标记
    const cleanedJsonString = rawText
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();

    const parsedData = JSON.parse(cleanedJsonString);

    if (!Array.isArray(parsedData)) {
        throw new Error('解析后的数据不是数组格式');
    }

    // 遍历清洗，补充缺省字段，防止客户端渲染报错
    return parsedData.map((item, index) => {
        const textZh = item.zh || item.story || item.content || '';
        const textEn = item.en || item.contentEn || '';
        const srcZh = item.sourceZh || item.source || '';
        const srcEn = item.sourceEn || '';

        return {
            id: item.id || `gen_${Date.now()}_${index}`,
            zh: textZh ? String(textZh).trim() : '',
            en: textEn ? String(textEn).trim() : '',
            sourceZh: srcZh ? String(srcZh).trim() : '未知',
            sourceEn: srcEn ? String(srcEn).trim() : 'Unknown',
            contentType: item.contentType || 'single'
        };
    });
}

// 5. 主执行逻辑
async function generateDailyQuotes() {
    let rawContent = '';

    for (const model of MODELS) {
        try {
            console.log(`⏳ 尝试使用模型 [${model}] 生成内容...`);
            rawContent = await callGeminiAPI(model);
            if (rawContent) {
                console.log(`🎉 成功使用 [${model}] 完成请求！`);
                break;
            }
        } catch (err) {
            console.warn(`⚠️ 模型 [${model}] 调用失败: ${err.message}，正在尝试下一个备用模型...`);
        }
    }

    if (!rawContent) {
        console.error('❌ 所有模型均调用失败！请检查 GEMINI_API_KEY 是否在 GitHub Secrets 中配置正确且有效！');
        process.exit(1);
    }

    try {
        const newQuotes = parseAndCleanQuotes(rawContent);

        if (newQuotes.length === 0) {
            throw new Error('生成的有效句子数量为 0');
        }

        const outputDir = path.join(__dirname, '../data');
        const outputFile = path.join(outputDir, 'quotes.json');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputFile, JSON.stringify(newQuotes, null, 2), 'utf-8');
        console.log(`✅ 成功生成并写入 ${newQuotes.length} 条数据到 ${outputFile}`);

    } catch (err) {
        console.error(`❌ 数据解析或写入失败:`, err.message);
        process.exit(1);
    }
}

generateDailyQuotes();
