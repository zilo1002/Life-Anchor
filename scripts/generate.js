// 修改前
const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    ...
});

// 修改后
const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    ...
});
