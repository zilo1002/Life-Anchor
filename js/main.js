/* ================================
   Life Anchor - 活下去的理由
   Main JavaScript
   ================================ */

// State Management
const state = {
    theme: localStorage.getItem('theme') || 'light',
    activated: false,
    isAnimating: false,
    currentSound: localStorage.getItem('sound') || 'water',
    currentIndex: 0,
    contentPool: [],
    dailyPool: [],
    touchStartX: 0,
    touchEndX: 0,
    language: localStorage.getItem('language') || 'zh',
    lastDate: null
};

// Audio Context
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

// Sound Generators
const sounds = {
    water: () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    },
    click: () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
    },
    'mechanical-red': () => {
        const ctx = getAudioCtx();
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
        noise.buffer = buffer;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(400, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        noise.connect(lowpass).connect(gain).connect(ctx.destination);
        noise.start();
    },
    'mechanical-blue': () => {
        const ctx = getAudioCtx();
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(3500, ctx.currentTime);
        click.frequency.setValueAtTime(0, ctx.currentTime + 0.02);
        clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
        clickGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.02);
        clickGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03);
        click.connect(clickGain).connect(ctx.destination);
        click.start(); click.stop(ctx.currentTime + 0.03);
        const bottom = ctx.createOscillator();
        const bottomGain = ctx.createGain();
        bottom.type = 'sine';
        bottom.frequency.setValueAtTime(120, ctx.currentTime + 0.02);
        bottomGain.gain.setValueAtTime(0, ctx.currentTime + 0.02);
        bottomGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.025);
        bottomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        bottom.connect(bottomGain).connect(ctx.destination);
        bottom.start(ctx.currentTime + 0.02); bottom.stop(ctx.currentTime + 0.1);
    },
    'mechanical-brown': () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
        noise.buffer = buffer;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(600, ctx.currentTime);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        noise.connect(lowpass).connect(noiseGain).connect(ctx.destination);
        osc.connect(gain).connect(ctx.destination);
        noise.start(); osc.start(); osc.stop(ctx.currentTime + 0.06);
    },
    'mechanical-silent': () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain= ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
    },
    bell: () => {
        const ctx = getAudioCtx();
        const frequencies = [1046.5, 1318.5, 1568, 2093];
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 1.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 1.5);
        });
    }
};

const soundNames = {
    water: '水滴声',
    click: '轻柔点击',
    'mechanical-red': '机械红轴',
    'mechanical-blue': '机械青轴',
    'mechanical-brown': '机械茶轴',
    'mechanical-silent': '静音红轴',
    bell: '风铃'
};

const languageNames = {
    zh: '中文',
    en: 'English',
    both: '双语'
};

// ========== 双语内容库 ==========
const bilingualContent = [
    {zh: "存在不是一种状态，而是一种选择。每时每刻，我们都在选择成为什么样的人。", en: "Existence is not a state, but a choice. Every moment, we choose who we become.", source: "萨特《存在与虚无》"},
    {zh: "人是被抛入世界的。但如何面对被抛入的状态，才是你真正的存在。", en: "Man is thrown into the world. But how you face being thrown is your true existence.", source: "海德格尔《存在与时间》"},
    {zh: "存在先于本质。你没有被赋予意义，你创造意义。", en: "Existence precedes essence. You are not given meaning; you create it.", source: "萨特"},
    {zh: "真正严肃的哲学问题只有一个——自杀。然而反抗荒谬，本身就是意义。", en: "There is only one truly serious philosophical problem — suicide. But to rebel against the absurd is meaning itself.", source: "加缪《西西弗斯神话》"},
    {zh: "向死而生。正因为生命有限，每一个当下才如此珍贵。", en: "Being-toward-death. Because life is finite, every present moment is so precious.", source: "海德格尔"},
    {zh: "生命的意义在于承担起生命的责任，在无意义的世界中创造意义。", en: "The meaning of life is to take up the responsibility of life and create meaning in a meaningless world.", source: "加缪"},
    {zh: "我反抗，故我在。你的反抗证明了你的存在。", en: "I rebel, therefore I am. Your rebellion proves your existence.", source: "加缪《反抗者》"},
    {zh: "人被判定为自由，无论处境如何，你永远有选择面对方式的权利。", en: "Man is condemned to be free. No matter the situation, you always have the right to choose how to face it.", source: "萨特"},
    {zh: "对于无限的唯一的反叛，是创造。你正在创造。", en: "The only rebellion against the infinite is creation. You are creating.", source: "加缪"},
    {zh: "人是他自己的造物。懦夫是自己造就的，英雄也是自己造就的。", en: "Man is his own creator. A coward is made by himself, and a hero is also made by himself.", source: "萨特"},
    {zh: "焦虑是自由的眩晕。你感到迷茫，是因为你有选择的自由。", en: "Anxiety is the vertigo of freedom. You feel lost because you have the freedom to choose.", source: "克尔凯郭尔"},
    {zh: "深渊不是终点，而是觉醒的起点。人类始终能够从深渊中救出自己。", en: "The abyss is not the end, but the starting point of awakening. Humans can always save themselves from the abyss.", source: "雅斯贝尔斯"},
    {zh: "你不是你的过去，你是你选择的未来。", en: "You are not your past; you are the future you choose.", source: "存在主义"},
    {zh: "每一个选择都在定义你是谁。", en: "Every choice defines who you are.", source: "萨特"},
    {zh: "活在当下，不是口号，是对生命最基本的尊重。", en: "Living in the moment is not a slogan, but the most basic respect for life.", source: "禅宗"},
    {zh: "时间是最好的老师，但它最终会杀死所有的学生。", en: "Time is the best teacher, but in the end it kills all its students.", source: "路易·费迪南·塞利纳"},
    {zh: "时间不是金钱，时间是生命。你正在花费的每一刻，都无法挽回。", en: "Time is not money; time is life. Every moment you spend cannot be recovered.", source: "亨利·大卫·梭罗《瓦尔登湖》"},
    {zh: "我们无法管理时间，我们只能管理自己。", en: "We cannot manage time, we can only manage ourselves.", source: "彼得·德鲁克"},
    {zh: "时间会治愈一切，但需要你每天服用——那就是活着。", en: "Time heals everything, but you need to take it daily — that is living.", source: "存在主义智慧"},
    {zh: "不要为已逝去的时间叹息，请把握正在流逝的时间。", en: "Do not sigh for time past; seize the time that is passing.", source: "塞涅卡"},
    {zh: "昨天是历史，明天是谜团，只有今天才是礼物。", en: "Yesterday is history, tomorrow is a mystery, today is a gift.", source: "凯瑟琳·布恩"},
    {zh: "每一个今天都是你未来永远不会回来的礼物。", en: "Every today is a gift you will never get back in the future.", source: "生活智慧"},
    {zh: "过去从未死去，它甚至还没有过去。但你可以让过去成为成长的养分。", en: "The past is never dead; it's not even past. But you can let the past become nourishment for growth.", source: "福克纳"},
    {zh: "时间不等人，但它会等你准备好。", en: "Time waits for no one, but it will wait until you're ready.", source: "生活智慧"},
    {zh: "时间是一条河流，我们都是河中的石头，被水流冲刷，也在留下痕迹。", en: "Time is a river, and we are all stones in it, being worn by the current but also leaving marks.", source: "文学"},
    {zh: "累了吗？这是正常的。太阳每天都会升起，明天又是新的一天。", en: "Tired? That's normal. The sun rises every day, and tomorrow is a new day.", source: "海明威"},
    {zh: "疲惫是生命的常态，但黎明总会到来。", en: "Exhaustion is the norm of life, but dawn always comes.", source: "文学智慧"},
    {zh: "当你累了的时候就休息，但不要放弃。", en: "When you're tired, rest, but don't give up.", source: "生活智慧"},
    {zh: "在最深的疲惫中，往往藏着最深的觉醒。", en: "In the deepest exhaustion, the deepest awakening is often hidden.", source: "哲学"},
    {zh: "你不必一直坚强，偶尔的软弱是允许的。", en: "You don't have to be strong all the time; occasional weakness is allowed.", source: "心理学"},
    {zh: "累了就停下脚步，呼吸也是一种前进。", en: "When tired, stop and breathe. Breathing is also moving forward.", source: "禅宗"},
    {zh: "疲惫不是终点，而是休息的起点。", en: "Exhaustion is not the end, but the starting point of rest.", source: "生活智慧"},
    {zh: "身体需要休息，心灵也需要呼吸的空间。", en: "The body needs rest, and the soul also needs space to breathe.", source: "文学"},
    {zh: "不要把自己逼得太紧，你已经做得够好了。", en: "Don't push yourself too hard; you've done enough.", source: "心理学"},
    {zh: "休息是为了走更远的路。", en: "Rest is for walking a longer road.", source: "中国谚语"},
    {zh: "当你觉得累的时候，其实你正在变得更强。", en: "When you feel tired, you're actually getting stronger.", source: "生活智慧"},
    {zh: "每一天都是新的开始，每一个清晨都是重生的机会。", en: "Every day is a new beginning; every morning is an opportunity for rebirth.", source: "生活智慧"},
    {zh: "无论昨天发生了什么，今天都是崭新的一天。", en: "No matter what happened yesterday, today is a brand new day.", source: "文学"},
    {zh: "重新开始永远不晚。", en: "It's never too late to start over.", source: "保罗·柯艾略《牧羊少年奇幻之旅》"},
    {zh: "沉舟侧畔千帆过，病树前头万木春。旧的总会过去，新的总会到来。", en: "A thousand sails pass by the wrecked ship; before the diseased tree a thousand trees spring up. The old always passes, the new always comes.", source: "刘禹锡"},
    {zh: "山重水复疑无路，柳暗花明又一村。黑暗之后就是光明。", en: "After endless mountains and rivers that leave doubt whether there is a path, a village appears amid flowers under shady trees. Light follows darkness.", source: "陆游"},
    {zh: "野火烧不尽，春风吹又生。你像草一样，有无限的生命力。", en: "Wild fires cannot burn it all; spring winds blow it back to life. Like grass, you have infinite vitality.", source: "白居易"},
    {zh: "无论你跌倒多少次，只要站起来，你就赢了。", en: "No matter how many times you fall, if you stand up, you win.", source: "海明威《老人与海》"},
    {zh: "过去无法改变，但未来永远可以。", en: "The past cannot be changed, but the future can always be.", source: "存在主义"},
    {zh: "一个新的开始，不需要完美的理由。", en: "A new beginning doesn't need a perfect reason.", source: "文学"},
    {zh: "孤独是自由的代价，但这份孤独是成长的代价。", en: "Loneliness is the price of freedom, but this loneliness is the price of growth.", source: "弗洛姆《逃避自由》"},
    {zh: "人是被称为城邦的动物。你属于某个地方，你被需要。", en: "Man is an animal called the city-state. You belong somewhere; you are needed.", source: "亚里士多德"},
    {zh: "我孤独，但我不寂寞。", en: "I am alone, but I am not lonely.", source: "黑塞《悉达多》"},
    {zh: "往外看的人在做梦，往内看的人正在觉醒。", en: "Those who look outward are dreaming; those who look inward are awakening.", source: "荣格《红书》"},
    {zh: "你不是孤独的旅行者，你的每一步都在地球上留下痕迹。", en: "You are not a lonely traveler; every step you take leaves a mark on Earth.", source: "文学"},
    {zh: "在孤独中，我们学会与自己对话。", en: "In solitude, we learn to dialogue with ourselves.", source: "哲学"},
    {zh: "孤独不是与世隔绝，而是在人群中依然感到空虚。", en: "Loneliness is not isolation, but feeling empty even among people.", source: "心理学"},
    {zh: "学会享受孤独，是成熟的标志。", en: "Learning to enjoy solitude is a sign of maturity.", source: "文学"},
    {zh: "你不必一直被人理解，有时候理解自己就够了。", en: "You don't always need to be understood by others; sometimes understanding yourself is enough.", source: "存在主义"},
    {zh: "世界上没有真正的感同身受，但有人愿意倾听。", en: "There is no true empathy in the world, but there are people willing to listen.", source: "文学"},
    {zh: "存在先于本质。你选择了成为什么样的人。", en: "Existence precedes essence. You chose who to become.", source: "萨特"},
    {zh: "在刺激和反应之间，有一个空间，在那个空间里，我们有力量选择我们的反应。", en: "Between stimulus and response, there is a space. In that space, we have the power to choose our response.", source: "维克多·弗兰克尔《活出意义来》"},
    {zh: "人生没有标准答案，但每个选择都有代价。", en: "There is no standard answer in life, but every choice has a cost.", source: "文学"},
    {zh: "选择比努力更重要，但选择之后的努力同样重要。", en: "Choices matter more than effort, but effort after choice is equally important.", source: "生活智慧"},
    {zh: "每一个选择都在塑造你成为谁。", en: "Every choice shapes who you become.", source: "存在主义"},
    {zh: "世上没有后悔药，但每一个选择都有意义。", en: "There are no regrets in the world, but every choice has meaning.", source: "文学"},
    {zh: "认识你自己。这是一切智慧的开始。", en: "Know yourself. This is the beginning of all wisdom.", source: "苏格拉底"},
    {zh: "成为你自己，是世界上最孤独的道路，但也是最值得走的道路。", en: "Becoming yourself is the loneliest road in the world, but also the most worthwhile.", source: "罗杰斯《成为一个人》"},
    {zh: "每个人的生命都是通往自我的征途。", en: "Every person's life is a journey toward the self.", source: "黑塞《德米安》"},
    {zh: "觉醒的人只有一个责任——找到自己，成为自己。", en: "An awakened person has only one responsibility — to find themselves and become themselves.", source: "黑塞"},
    {zh: "真正的自己比面具更值得信任。", en: "The true self is more trustworthy than any mask.", source: "卡尔·罗杰斯"},
    {zh: "你拥有比你想象的更大的内在力量。", en: "You possess inner strength greater than you can imagine.", source: "心理学"},
    {zh: "圣人之道，吾性自足。你内在的力量，比你想象的更大。", en: "The way of the sage lies within my nature. The power within you is greater than you imagine.", source: "王阳明龙场悟道"},
    {zh: "希望是附丽于存在的，有存在，便有希望，有希望，便是光明。", en: "Hope clings to existence. With existence, there is hope; with hope, there is light.", source: "鲁迅"},
    {zh: "在隆冬，我终于知道，我身上有一个不可战胜的夏天。", en: "In the depths of winter, I finally learned that within me there lay an invincible summer.", source: "加缪《反抗者》"},
    {zh: "那杀不死我的，使我更强大。", en: "What does not kill me makes me stronger.", source: "尼采"},
    {zh: "希望是在风暴中保持平静的能力。", en: "Hope is the ability to remain calm in a storm.", source: "心理学"},
    {zh: "最深的深渊也会倒映星星。你的深渊里也有星星。", en: "The deepest abyss also reflects stars. There are stars in your abyss too.", source: "尼采"},
    {zh: "等待是最本质的行为。在等待中，你保持了希望。", en: "Waiting is the most essential act. In waiting, you maintain hope.", source: "薇依"},
    {zh: "希望是坚韧的拐杖，支撑你走过最黑暗的路。", en: "Hope is a sturdy crutch that supports you through the darkest road.", source: "文学"},
    {zh: "只要有希望，就有一切可能。", en: "Where there is hope, everything is possible.", source: "生活智慧"},
    {zh: "希望是不放弃的另一个名字。", en: "Hope is another name for not giving up.", source: "文学"},
    {zh: "一个人能成为什么，他就必须成为什么。你有无限的可能性。", en: "What a person can become, they must become. You have infinite possibilities.", source: "马斯洛"},
    {zh: "每一步危机都是成长的契机。你的危机正在转化为成长。", en: "Every crisis is an opportunity for growth. Your crisis is turning into growth.", source: "埃里克森"},
    {zh: "成长意味着走出舒适区，拥抱不确定性。", en: "Growth means stepping out of the comfort zone and embracing uncertainty.", source: "心理学"},
    {zh: "重要的不是经历，而是我们赋予经历的意义。", en: "What matters is not the experience, but the meaning we give to it.", source: "阿德勒"},
    {zh: "成长是痛苦的，但痛苦是成长的代价。", en: "Growth is painful, but pain is the price of growth.", source: "文学"},
    {zh: "我们不是因为失败而失败，而是因为缺乏面对失败的勇气。", en: "We don't fail by failing; we fail by lacking the courage to face failure.", source: "阿德勒"},
    {zh: "自我实现者能够接纳自己、接纳他人、接纳自然。你正在接纳。", en: "Self-actualizers can accept themselves, others, and nature. You are accepting.", source: "马斯洛"},
    {zh: "成长是一个过程，不是终点。", en: "Growth is a process, not a destination.", source: "罗杰斯"},
    {zh: "裂缝是光进入你内心的地方。", en: "The crack is where the light enters your heart.", source: "文学"},
    {zh: "勇气不是没有恐惧，而是带着恐惧依然前行。", en: "Courage is not the absence of fear, but moving forward despite fear.", source: "文学"},
    {zh: "智慧意味着勇敢。你已经展示了你的勇气。", en: "Wisdom means courage. You have already shown your courage.", source: "柏拉图"},
    {zh: "人可以被毁灭，但不能被打败。你没有被毁灭。", en: "Man can be destroyed, but not defeated. You have not been destroyed.", source: "海明威"},
    {zh: "勇气是所有美德的基石。", en: "Courage is the foundation of all virtues.", source: "亚里士多德"},
    {zh: "勇敢不是不害怕，而是害怕了还能面对。", en: "Being brave is not being unafraid, but being able to face it even when afraid.", source: "心理学"},
    {zh: "每一个选择的背后都有勇气。", en: "Behind every choice lies courage.", source: "存在主义"},
    {zh: "你比你想象的更勇敢。", en: "You are braver than you think.", source: "文学"},
    {zh: "生活不是要等待完美时刻，而是要把平凡时刻变得完美。", en: "Life is not about waiting for the perfect moment, but making ordinary moments perfect.", source: "生活智慧"},
    {zh: "吃饭时吃饭，睡觉时睡觉。活在当下，是最深的修行。", en: "When eating, eat; when sleeping, sleep. Living in the moment is the deepest practice.", source: "禅宗语录"},
    {zh: "每一个平凡的日子都是礼物。", en: "Every ordinary day is a gift.", source: "文学"},
    {zh: "呼吸是生命的节奏。", en: "Breathing is the rhythm of life.", source: "禅宗"},
    {zh: "你此刻的呼吸，就是最好的证明——你还活着。", en: "Your breath right now is the best proof — you are still alive.", source: "存在主义"},
    {zh: "深呼吸，感受生命的流动。", en: "Take a deep breath; feel the flow of life.", source: "心理学"},
    {zh: "一呼一吸之间，藏着生命的全部秘密。", en: "Between each inhale and exhale lies all the secrets of life.", source: "文学"},
    {zh: "太阳每天都会升起。明天又是新的一天。", en: "The sun rises every day. Tomorrow is a new day.", source: "海明威"},
    {zh: "明天会更好。", en: "Tomorrow will be better.", source: "生活智慧"},
    {zh: "未知生，焉知死。理解死亡，才能更好地活着。", en: "Not knowing life, how can we know death? Understanding death helps us live better.", source: "孔子"},
    {zh: "自由是成长的目的。你正在成长。", en: "Freedom is the purpose of growth. You are growing.", source: "弗洛姆"},
    {zh: "自由不是你想做什么就做什么，而是你想不做什么就不做什么。", en: "Freedom is not doing what you want, but not doing what you don't want.", source: "康德"},
    {zh: "自由是一个可怕的概念。但它也是最美丽的礼物。", en: "Freedom is a terrifying concept. But it is also the most beautiful gift.", source: "萨特"},
    {zh: "因为懂得，所以慈悲。你懂得自己的痛苦，这是慈悲的开始。", en: "Because we understand, we are compassionate. You understand your pain; this is the beginning of compassion.", source: "张爱玲"},
    {zh: "温柔是最大的力量。", en: "Gentleness is the greatest strength.", source: "文学"},
    {zh: "对自己温柔一点。", en: "Be gentle with yourself.", source: "心理学"}
];

// ========== 每日内容池逻辑 ==========
function getDateSeed(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return year * 10000 + month * 100 + day;
}

function seededShuffle(array, seed) {
    const result = [...array];
    let currentSeed = seed;
    for (let i = result.length - 1; i > 0; i--) {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        const j = Math.floor((currentSeed / 233280) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function getDailyPool() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    if (state.lastDate !== dateString) {
        state.lastDate = dateString;
        const seed = getDateSeed(today);
        const shuffled = seededShuffle(bilingualContent, seed);
        state.dailyPool = shuffled.slice(0, Math.min(50, shuffled.length));
        localStorage.setItem('lastDate', dateString);
        localStorage.setItem('dailyPool', JSON.stringify(state.dailyPool));
    } else {
        const saved = localStorage.getItem('dailyPool');
        if (saved) {
            state.dailyPool = JSON.parse(saved);
        }
    }
    return state.dailyPool;
}

function getCurrentContent() {
    const dailyContent = getDailyPool();
    switch(state.language) {
        case 'zh':
            return dailyContent.map(item => ({ story: item.zh, source: item.source }));
        case 'en':
            return dailyContent.map(item => ({ story: item.en, source: item.source }));
        case 'both':
            return dailyContent;
        default:
            return dailyContent.map(item => ({ story: item.zh, source: item.source }));
    }
}

// DOM Elements
let themeToggle, anchorButton, flashOverlay, messageCard, mainMessage, storySource, particlesContainer, soundBtn, soundMenu, soundLabel, navPrev, navNext, navPrevMobile, navNextMobile, langBtn, langMenu, langLabel;

function initDOM() {
    themeToggle = document.getElementById('themeToggle');
    anchorButton = document.getElementById('anchorButton');
    flashOverlay = document.getElementById('flashOverlay');
    messageCard = document.getElementById('messageCard');
    mainMessage = document.getElementById('mainMessage');
    storySource = document.getElementById('storySource');
    particlesContainer = document.getElementById('particlesContainer');
    soundBtn = document.getElementById('soundBtn');
    soundMenu = document.getElementById('soundMenu');
    soundLabel = document.getElementById('soundLabel');
    navPrev = document.getElementById('navPrev');
    navNext = document.getElementById('navNext');
    navPrevMobile = document.getElementById('navPrevMobile');
    navNextMobile = document.getElementById('navNextMobile');
    langBtn = document.getElementById('langBtn');
    langMenu = document.getElementById('langMenu');
    langLabel = document.getElementById('langLabel');
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

function initSound() {
    soundLabel.textContent = soundNames[state.currentSound];
    document.querySelectorAll('.sound-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.sound === state.currentSound);
    });
}

function initLanguage() {
    langLabel.textContent = languageNames[state.language];
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === state.language);
    });
}

function setupThemeToggle() {
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
    });
}

function setupSoundMenu() {
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundMenu.classList.toggle('show');
    });

    document.querySelectorAll('.sound-option').forEach(opt => {
        opt.addEventListener('click', () => {
            state.currentSound = opt.dataset.sound;
            soundLabel.textContent = soundNames[state.currentSound];
            localStorage.setItem('sound', state.currentSound);
            document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            soundMenu.classList.remove('show');
            playSound();
        });
    });

    document.addEventListener('click', () => soundMenu.classList.remove('show'));
}

function setupLanguageMenu() {
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('show');
    });

    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
            state.language = opt.dataset.lang;
            langLabel.textContent = languageNames[state.language];
            localStorage.setItem('language', state.language);
            document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            langMenu.classList.remove('show');
            if (state.activated) {
                prepareContentPool();
                showCurrentContent();
            }
        });
    });

    document.addEventListener('click', () => langMenu.classList.remove('show'));
}

function playSound() {
    if (sounds[state.currentSound]) {
        sounds[state.currentSound]();
    }
}

function playSuccessChime() {
    sounds.bell();
}

function createRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

function createParticles() {
    particlesContainer.innerHTML = '';
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            width:${4+Math.random()*6}px;
            height:${4+Math.random()*6}px;
            --drift-x:${(Math.random()-0.5)*200}px;
            --drift-y:${-100-Math.random()*200}px;
            animation-delay:${Math.random()*5}s;
        `;
        particlesContainer.appendChild(p);
    }
    particlesContainer.classList.add('particles-active');
}

function prepareContentPool() {
    state.contentPool = getCurrentContent();
    state.currentIndex = 0;
}

function showCurrentContent(direction = null) {
    const content = state.contentPool[state.currentIndex];
    if (state.language === 'both') {
        mainMessage.innerHTML = `<span class="zh-text">${content.zh}</span><span class="en-text">${content.en}</span>`;
    } else {
        mainMessage.textContent = content.story;
    }
    storySource.textContent = content.source;
}

function navigateContent(direction) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    messageCard.classList.remove('visible');
    if (direction === 'prev') {
        messageCard.classList.add('slide-left');
    } else {
        messageCard.classList.add('slide-right');
    }

    playSound();

    setTimeout(() => {
        if (direction === 'prev') {
            state.currentIndex = (state.currentIndex - 1 + state.contentPool.length) % state.contentPool.length;
        } else {
            state.currentIndex = (state.currentIndex + 1) % state.contentPool.length;
        }

        showCurrentContent();
        messageCard.classList.remove('slide-left', 'slide-right');
        messageCard.classList.add('visible');
        state.isAnimating = false;
    }, 300);
}

function activateButton() {
    if (state.isAnimating) return;
    state.isAnimating = true;

    playSound();
    flashOverlay.classList.add('active');
    createParticles();

    if (!state.activated) {
        prepareContentPool();
        showCurrentContent();
    }

    setTimeout(playSuccessChime, 400);

    setTimeout(() => {
        flashOverlay.classList.remove('active');
        messageCard.classList.add('visible');
        state.activated = true;
        state.isAnimating = false;
    }, 600);
}

function closeMessage(e) {
    if (e.target === messageCard || messageCard.contains(e.target)) return;
    if (e.target === anchorButton || anchorButton.contains(e.target)) return;

    if (messageCard.classList.contains('visible')) {
        messageCard.classList.remove('visible');
        setTimeout(() => {
            particlesContainer.classList.remove('particles-active');
        }, 400);
    }
}

function handleTouchStart(e) {
    state.touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    state.touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    if (!messageCard.classList.contains('visible')) return;

    const swipeThreshold = 50;
    const diff = state.touchStartX - state.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            navigateContent('next');
        } else {
            navigateContent('prev');
        }
    }
}

function handleKeyDown(e) {
    if (!messageCard.classList.contains('visible')) return;

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateContent('prev');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateContent('next');
    } else if (e.key === 'Escape') {
        closeMessage({ target: document.body });
    }
}

function setupEventListeners() {
    // 中心按钮 - 使用 mousedown 和 touchstart 确保响应
    anchorButton.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        activateButton();
    });

    anchorButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        activateButton();
    }, { passive: false });

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    document.addEventListener('click', (e) => {
        if (!messageCard.classList.contains('visible')) return;

        const isClickOnCard = messageCard.contains(e.target) && e.target !== anchorButton;
        const isClickOnButton = e.target === anchorButton || anchorButton.contains(e.target);

        if (isClickOnCard || isClickOnButton) return;

        closeMessage(e);
    });

    navPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('prev');
    });
    navNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('next');
    });

    navPrevMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('prev');
    });
    navNextMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('next');
    });
}

function setupPageLoadAnimation() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    setupThemeToggle();
    setupSoundMenu();
    setupLanguageMenu();
    setupEventListeners();
    initTheme();
    initSound();
    initLanguage();
    setupPageLoadAnimation();
});
