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
    language: localStorage.getItem('language') || 'zh', // 'zh', 'en', 'both'
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
        const gain = ctx.createGain();
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
// 每条内容包含: {zh: "中文", en: "English", source: "出处"}
const bilingualContent = [
    // 关于存在
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

    // 关于时间
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
    {zh: "时间不是用来等待的，而是用来创造的。", en: "Time is not for waiting, but for creating.", source: "存在主义"},
    {zh: "此刻就是你余生的第一天。", en: "This moment is the first day of the rest of your life.", source: "生活智慧"},
    {zh: "时间是最好的裁判，它会证明一切。", en: "Time is the best judge; it will prove everything.", source: "文学"},
    {zh: "时间是最公平的老师，它给每个人的一天都是24小时。", en: "Time is the fairest teacher; it gives everyone 24 hours a day.", source: "文学智慧"},
    {zh: "过去已逝，未来未至，只有当下是真实的。", en: "The past is gone, the future is not yet here; only the present is real.", source: "禅宗"},

    // 关于疲惫
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
    {zh: "疲惫是成长的代价，也是勋章。", en: "Exhaustion is the price of growth, and also a medal.", source: "文学"},
    {zh: "给自己一个拥抱，你值得被温柔对待。", en: "Give yourself a hug; you deserve to be treated gently.", source: "心理学"},
    {zh: "夜晚总会过去，黎明总会到来。", en: "The night always passes, and dawn always comes.", source: "生活智慧"},
    {zh: "你不需要一直跑，有时候走路也是一种前进。", en: "You don't need to run all the time; sometimes walking is also moving forward.", source: "存在主义"},

    // 关于重新开始
    {zh: "每一天都是新的开始，每一个清晨都是重生的机会。", en: "Every day is a new beginning; every morning is an opportunity for rebirth.", source: "生活智慧"},
    {zh: "无论昨天发生了什么，今天都是崭新的一天。", en: "No matter what happened yesterday, today is a brand new day.", source: "文学"},
    {zh: "重新开始永远不晚。", en: "It's never too late to start over.", source: "保罗·柯艾略《牧羊少年奇幻之旅》"},
    {zh: "沉舟侧畔千帆过，病树前头万木春。旧的总会过去，新的总会到来。", en: "A thousand sails pass by the wrecked ship; before the diseased tree a thousand trees spring up. The old always passes, the new always comes.", source: "刘禹锡"},
    {zh: "山重水复疑无路，柳暗花明又一村。黑暗之后就是光明。", en: "After endless mountains and rivers that leave doubt whether there is a path, a village appears amid flowers under shady trees. Light follows darkness.", source: "陆游"},
    {zh: "野火烧不尽，春风吹又生。你像草一样，有无限的生命力。", en: "Wild fires cannot burn it all; spring winds blow it back to life. Like grass, you have infinite vitality.", source: "白居易"},
    {zh: "无论你跌倒多少次，只要站起来，你就赢了。", en: "No matter how many times you fall, if you stand up, you win.", source: "海明威《老人与海》"},
    {zh: "过去无法改变，但未来永远可以。", en: "The past cannot be changed, but the future can always be.", source: "存在主义"},
    {zh: "一个新的开始，不需要完美的理由。", en: "A new beginning doesn't need a perfect reason.", source: "文学"},
    {zh: "你永远有机会重新定义自己。", en: "You always have the chance to redefine yourself.", source: "心理学"},
    {zh: "莫等闲，白了少年头，空悲切。但即使白了头，你也可以重新开始。", en: "Do not wait idly until your youth is spent in vain. But even with white hair, you can start over.", source: "岳飞"},
    {zh: "人生若只如初见。每一刻都是新的开始。", en: "If life were always like our first meeting. Every moment is a new beginning.", source: "纳兰性德"},
    {zh: "冬天来了，春天还会远吗？", en: "If winter comes, can spring be far behind?", source: "雪莱"},
    {zh: "放下过去的包袱，轻装前行。", en: "Put down the burden of the past and travel light.", source: "禅宗"},
    {zh: "今天是你余生的第一天。", en: "Today is the first day of the rest of your life.", source: "生活智慧"},

    // 关于孤独
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
    {zh: "孤独是灵魂的呼吸空间。", en: "Loneliness is the breathing space of the soul.", source: "哲学"},
    {zh: "在人群中感到孤独，比独处更孤独。", en: "Feeling lonely in a crowd is lonelier than being alone.", source: "文学"},
    {zh: "孤独是一种选择，也是一种能力。", en: "Loneliness is a choice, and also an ability.", source: "心理学"},
    {zh: "你不是一个人。至少，你还有自己。", en: "You are not alone. At least, you still have yourself.", source: "存在主义"},
    {zh: "所有的相遇，都是久别重逢。", en: "All encounters are reunions after a long parting.", source: "文学"},

    // 关于选择
    {zh: "存在先于本质。你选择了成为什么样的人。", en: "Existence precedes essence. You chose who to become.", source: "萨特"},
    {zh: "在刺激和反应之间，有一个空间，在那个空间里，我们有力量选择我们的反应。", en: "Between stimulus and response, there is a space. In that space, we have the power to choose our response.", source: "维克多·弗兰克尔《活出意义来》"},
    {zh: "人生没有标准答案，但每个选择都有代价。", en: "There is no standard answer in life, but every choice has a cost.", source: "文学"},
    {zh: "选择比努力更重要，但选择之后的努力同样重要。", en: "Choices matter more than effort, but effort after choice is equally important.", source: "生活智慧"},
    {zh: "每一个选择都在塑造你成为谁。", en: "Every choice shapes who you become.", source: "存在主义"},
    {zh: "世上没有后悔药，但每一个选择都有意义。", en: "There are no regrets in the world, but every choice has meaning.", source: "文学"},
    {zh: "选择不做什么，比选择做什么更难。", en: "Choosing what not to do is harder than choosing what to do.", source: "文学"},
    {zh: "你永远有选择的权利，即使在看似没有选择的情况下。", en: "You always have the right to choose, even when it seems there is no choice.", source: "弗兰克尔"},
    {zh: "每一个选择都是一次重生的机会。", en: "Every choice is an opportunity for rebirth.", source: "心理学"},
    {zh: "不要害怕选择，因为不选择本身也是一种选择。", en: "Don't be afraid of choices, because not choosing itself is also a choice.", source: "存在主义"},
    {zh: "选择没有对错，只有承担。", en: "Choices are not right or wrong; only bearing the consequences.", source: "文学"},
    {zh: "你的选择定义了你是谁。", en: "Your choices define who you are.", source: "哲学"},
    {zh: "没有完美的选择，但有属于你的选择。", en: "There is no perfect choice, but there is a choice that belongs to you.", source: "文学"},
    {zh: "选择爱而不是恨，选择希望而不是绝望。", en: "Choose love over hate, choose hope over despair.", source: "心理学"},
    {zh: "人生就是一连串的选择，而你现在就在选择。", en: "Life is a series of choices, and you are choosing right now.", source: "存在主义"},

    // 关于自我
    {zh: "认识你自己。这是一切智慧的开始。", en: "Know yourself. This is the beginning of all wisdom.", source: "苏格拉底"},
    {zh: "你未看此花时，此花与汝心同归于寂。你的心，就是整个宇宙的镜子。", en: "When you have not seen this flower, it and your heart are equally silent. Your heart is the mirror of the entire universe.", source: "王阳明《传习录》"},
    {zh: "成为你自己，是世界上最孤独的道路，但也是最值得走的道路。", en: "Becoming yourself is the loneliest road in the world, but also the most worthwhile.", source: "罗杰斯《成为一个人》"},
    {zh: "每个人的生命都是通往自我的征途。", en: "Every person's life is a journey toward the self.", source: "黑塞《德米安》"},
    {zh: "觉醒的人只有一个责任——找到自己，成为自己。", en: "An awakened person has only one responsibility — to find themselves and become themselves.", source: "黑塞"},
    {zh: "真正的自己比面具更值得信任。", en: "The true self is more trustworthy than any mask.", source: "卡尔·罗杰斯"},
    {zh: "你拥有比你想象的更大的内在力量。", en: "You possess inner strength greater than you can imagine.", source: "心理学"},
    {zh: "圣人之道，吾性自足。你内在的力量，比你想象的更大。", en: "The way of the sage lies within my nature. The power within you is greater than you imagine.", source: "王阳明龙场悟道"},
    {zh: "与自己和解是人生最重要的课题。", en: "Reconciling with oneself is the most important lesson in life.", source: "荣格"},
    {zh: "接纳是改变的前提。你被接纳了。", en: "Acceptance precedes change. You are accepted.", source: "罗杰斯"},
    {zh: "生命的目的就是成为自己。你正在成为自己。", en: "The purpose of life is to become yourself. You are becoming yourself.", source: "罗杰斯"},
    {zh: "真正的强大不是压倒一切，而是接纳一切。", en: "True strength is not overwhelming everything, but accepting everything.", source: "心理学"},
    {zh: "做真实的自己，比做任何人都好。", en: "Being authentic is better than being anyone else.", source: "心理学"},
    {zh: "你本具足，何须外求。", en: "You already have everything within you; why seek outside?", source: "禅宗"},
    {zh: "你未曾在本质上欠缺什么。", en: "You lack nothing in essence.", source: "禅宗"},

    // 关于希望
    {zh: "希望是附丽于存在的，有存在，便有希望，有希望，便是光明。", en: "Hope clings to existence. With existence, there is hope; with hope, there is light.", source: "鲁迅"},
    {zh: "在隆冬，我终于知道，我身上有一个不可战胜的夏天。", en: "In the depths of winter, I finally learned that within me there lay an invincible summer.", source: "加缪《反抗者》"},
    {zh: "那杀不死我的，使我更强大。", en: "What does not kill me makes me stronger.", source: "尼采"},
    {zh: "希望是在风暴中保持平静的能力。", en: "Hope is the ability to remain calm in a storm.", source: "心理学"},
    {zh: "最深的深渊也会倒映星星。你的深渊里也有星星。", en: "The deepest abyss also reflects stars. There are stars in your abyss too.", source: "尼采"},
    {zh: "等待是最本质的行为。在等待中，你保持了希望。", en: "Waiting is the most essential act. In waiting, you maintain hope.", source: "薇依"},
    {zh: "希望是坚韧的拐杖，支撑你走过最黑暗的路。", en: "Hope is a sturdy crutch that supports you through the darkest road.", source: "文学"},
    {zh: "只要有希望，就有一切可能。", en: "Where there is hope, everything is possible.", source: "生活智慧"},
    {zh: "希望是不放弃的另一个名字。", en: "Hope is another name for not giving up.", source: "文学"},
    {zh: "在绝望中寻找希望，是人类的本能。", en: "Finding hope in despair is human instinct.", source: "心理学"},
    {zh: "希望是灵魂的眼睛。", en: "Hope is the eye of the soul.", source: "文学"},
    {zh: "即使在最黑暗的夜晚，星星依然闪烁。", en: "Even in the darkest night, the stars still shine.", source: "生活智慧"},
    {zh: "希望是通往明天的桥梁。", en: "Hope is the bridge to tomorrow.", source: "文学"},
    {zh: "有希望的地方，地狱也会变成天堂。", en: "Where there is hope, even hell becomes heaven.", source: "但丁"},
    {zh: "希望永远在前方等着我们。", en: "Hope is always waiting for us ahead.", source: "生活智慧"},

    // 关于等待
    {zh: "等待是最本质的行为。", en: "Waiting is the most essential act.", source: "薇依《重负与神恩》"},
    {zh: "众里寻他千百度，蓦然回首，那人却在灯火阑珊处。", en: "A thousand times I searched for him in the crowd; turning back suddenly, there he was in the dim lamplight.", source: "辛弃疾"},
    {zh: "等待是生活的一部分，不等待也是。", en: "Waiting is part of life, and not waiting is also part of life.", source: "文学"},
    {zh: "在等待中积蓄力量，在机遇来临时爆发。", en: "Accumulate strength while waiting, and explode when opportunity comes.", source: "心理学"},
    {zh: "等待不是消极，而是蓄势。", en: "Waiting is not passive, but gathering momentum.", source: "文学"},
    {zh: "行到水穷处，坐看云起时。有时候迷路也是风景。", en: "Walk to where the water ends, sit and watch the clouds rise. Sometimes getting lost is also a scenery.", source: "王维"},
    {zh: "等待是一种智慧，也是一种勇气。", en: "Waiting is both wisdom and courage.", source: "文学"},
    {zh: "该来的总会来，你要做的只是准备好自己。", en: "What is meant to come will come; all you need to do is prepare yourself.", source: "生活智慧"},
    {zh: "莫听穿林打叶声，何妨吟啸且徐行。即使等待，也从容。", en: "Listen not to the rain beating on the leaves; why not hum and whistle as you walk slowly. Even when waiting, be composed.", source: "苏轼"},
    {zh: "等待是一种信任，信任生命会给你最好的安排。", en: "Waiting is a trust that life will give you the best arrangement.", source: "心理学"},
    {zh: "等待不是为了放弃，而是为了更好的相遇。", en: "Waiting is not for giving up, but for a better meeting.", source: "文学"},
    {zh: "等待是最长情的告白。", en: "Waiting is the most affectionate confession.", source: "文学"},
    {zh: "在等待中成长，在成长中等待。", en: "Grow while waiting; wait while growing.", source: "存在主义"},
    {zh: "时机未到时，耐心是最好的朋友。", en: "When the time hasn't come, patience is your best friend.", source: "生活智慧"},
    {zh: "好的东西值得等待。", en: "Good things are worth waiting for.", source: "生活智慧"},

    // 关于成长
    {zh: "一个人能成为什么，他就必须成为什么。你有无限的可能性。", en: "What a person can become, they must become. You have infinite possibilities.", source: "马斯洛"},
    {zh: "每一步危机都是成长的契机。你的危机正在转化为成长。", en: "Every crisis is an opportunity for growth. Your crisis is turning into growth.", source: "埃里克森"},
    {zh: "成长意味着走出舒适区，拥抱不确定性。", en: "Growth means stepping out of the comfort zone and embracing uncertainty.", source: "心理学"},
    {zh: "重要的不是经历，而是我们赋予经历的意义。", en: "What matters is not the experience, but the meaning we give to it.", source: "阿德勒"},
    {zh: "成长是痛苦的，但痛苦是成长的代价。", en: "Growth is painful, but pain is the price of growth.", source: "文学"},
    {zh: "我们不是因为失败而失败，而是因为缺乏面对失败的勇气。", en: "We don't fail by failing; we fail by lacking the courage to face failure.", source: "阿德勒"},
    {zh: "自我实现者能够接纳自己、接纳他人、接纳自然。你正在接纳。", en: "Self-actualizers can accept themselves, others, and nature. You are accepting.", source: "马斯洛"},
    {zh: "成长是一个过程，不是终点。", en: "Growth is a process, not a destination.", source: "罗杰斯"},
    {zh: "裂缝是光进入你内心的地方。", en: "The crack is where the light enters your heart.", source: "文学"},
    {zh: "每一个伤口都是成长的印记。", en: "Every wound is a mark of growth.", source: "心理学"},
    {zh: "成长意味着拥抱变化。", en: "Growth means embracing change.", source: "文学"},
    {zh: "你比你想象的更强大。", en: "You are stronger than you think.", source: "尼采"},
    {zh: "成长就是不断发现自己新的可能性。", en: "Growth is constantly discovering new possibilities about yourself.", source: "心理学"},
    {zh: "痛苦会过去，但你的勇气会留下来。", en: "The pain will pass, but your courage will remain.", source: "文学"},
    {zh: "成长是成为你想成为的人的过程。", en: "Growth is the process of becoming who you want to be.", source: "存在主义"},

    // 关于失去
    {zh: "生命中真正重要的不是你遭遇了什么，而是你记住了哪些事。", en: "What matters in life is not what happens to you, but what you remember.", source: "马尔克斯《百年孤独》"},
    {zh: "生命中的每一次失去，都在为更重要的东西腾出空间。", en: "Every loss in life makes room for something more important.", source: "心理学"},
    {zh: "失去是生命的一部分，接受失去是成长的一部分。", en: "Loss is part of life; accepting loss is part of growth.", source: "文学"},
    {zh: "你的心碎的地方，可以成为爱流入的地方。", en: "Where your heart breaks can become where love flows in.", source: "文学"},
    {zh: "不是所有的东西都会永远存在，但回忆可以。", en: "Not everything lasts forever, but memories can.", source: "文学"},
    {zh: "失去让我们懂得珍惜。", en: "Loss teaches us to cherish.", source: "心理学"},
    {zh: "有些东西失去了，就再也回不来了。但生活还在继续。", en: "Some things, once lost, can never come back. But life goes on.", source: "文学"},
    {zh: "失去并不可怕，可怕的是失去后不敢再拥有。", en: "Loss is not scary; what's scary is not daring to have again after losing.", source: "文学"},
    {zh: "每一次失去都是一次重新评估生命的机会。", en: "Every loss is an opportunity to re-evaluate life.", source: "心理学"},
    {zh: "失去是痛苦的，但也是必要的。", en: "Loss is painful, but also necessary.", source: "文学"},
    {zh: "生命是一种不断失去和不断获得的过程。", en: "Life is a process of constantly losing and constantly gaining.", source: "存在主义"},
    {zh: "失去不是终点，而是另一种开始。", en: "Loss is not an end, but another beginning.", source: "文学"},
    {zh: "珍惜你所拥有的，接受你所失去的。", en: "Cherish what you have; accept what you've lost.", source: "心理学"},
    {zh: "失去教我们什么是真正重要的。", en: "Loss teaches us what is truly important.", source: "文学"},
    {zh: "勇敢面对失去，然后继续前行。", en: "Face loss bravely, then move on.", source: "生活智慧"},

    // 关于勇气
    {zh: "勇气不是没有恐惧，而是带着恐惧依然前行。", en: "Courage is not the absence of fear, but moving forward despite fear.", source: "文学"},
    {zh: "智慧意味着勇敢。你已经展示了你的勇气。", en: "Wisdom means courage. You have already shown your courage.", source: "柏拉图"},
    {zh: "人可以被毁灭，但不能被打败。你没有被毁灭。", en: "Man can be destroyed, but not defeated. You have not been destroyed.", source: "海明威"},
    {zh: "勇气是所有美德的基石。", en: "Courage is the foundation of all virtues.", source: "亚里士多德"},
    {zh: "勇敢不是不害怕，而是害怕了还能面对。", en: "Being brave is not being unafraid, but being able to face it even when afraid.", source: "心理学"},
    {zh: "每一个选择的背后都有勇气。", en: "Behind every choice lies courage.", source: "存在主义"},
    {zh: "你比你想象的更勇敢。", en: "You are braver than you think.", source: "文学"},
    {zh: "勇气是灵魂的力量。", en: "Courage is the strength of the soul.", source: "文学"},
    {zh: "做一个勇敢的人，去做你害怕的事情。", en: "Be a brave person; do what you fear.", source: "心理学"},
    {zh: "勇气不是消除恐惧，而是认识到有比恐惧更重要的东西。", en: "Courage is not eliminating fear, but recognizing something more important than fear.", source: "文学"},
    {zh: "最大的勇气是敢于展示脆弱。", en: "The greatest courage is daring to show vulnerability.", source: "心理学"},
    {zh: "勇气是改变的第一步。", en: "Courage is the first step to change.", source: "存在主义"},
    {zh: "你不是你的恐惧，你是你面对恐惧的勇气。", en: "You are not your fear; you are your courage in facing it.", source: "文学"},
    {zh: "有勇气的人，不是因为他们不害怕，而是因为他们害怕了还能行动。", en: "Courageous people are not unafraid, but act despite being afraid.", source: "文学"},
    {zh: "勇气是通往自由的钥匙。", en: "Courage is the key to freedom.", source: "文学"},

    // 关于日常
    {zh: "生活不是要等待完美时刻，而是要把平凡时刻变得完美。", en: "Life is not about waiting for the perfect moment, but making ordinary moments perfect.", source: "生活智慧"},
    {zh: "吃饭时吃饭，睡觉时睡觉。活在当下，是最深的修行。", en: "When eating, eat; when sleeping, sleep. Living in the moment is the deepest practice.", source: "禅宗语录"},
    {zh: "每一个平凡的日子都是礼物。", en: "Every ordinary day is a gift.", source: "文学"},
    {zh: "平凡的生活也有诗意。", en: "Ordinary life also has poetry.", source: "陶渊明"},
    {zh: "生活是种律动，须有光有影，有左有右，有晴有雨。", en: "Life is a rhythm; there must be light and shadow, left and right, sunshine and rain.", source: "老舍"},
    {zh: "简单的快乐就在身边。", en: "Simple happiness is right by your side.", source: "孟浩然"},
    {zh: "日常生活中的小确幸，构成了生命的大幸福。", en: "Little certain happiness in daily life constitutes great happiness in life.", source: "文学"},
    {zh: "不要忽视日常中的美好。", en: "Don't ignore the beauty in everyday life.", source: "心理学"},
    {zh: "每一顿饭，每一次呼吸，都是生命的馈赠。", en: "Every meal, every breath, is a gift of life.", source: "存在主义"},
    {zh: "生活不在远方，就在每一个当下。", en: "Life is not in the distance, but in every present moment.", source: "禅宗"},
    {zh: "以清净心看世界，以欢喜心过生活。", en: "See the world with a pure heart; live life with joy.", source: "林清玄"},
    {zh: "你若爱，生活哪里都可爱。", en: "If you love, life is lovely everywhere.", source: "丰子恺"},
    {zh: "最美的风景在最意想不到的地方。", en: "The most beautiful scenery is in the most unexpected places.", source: "杜牧"},
    {zh: "生命不是一个需要解决的问题，而是一个需要体验的礼物。", en: "Life is not a problem to be solved, but a gift to be experienced.", source: "文学"},
    {zh: "珍惜当下，珍惜眼前人。", en: "Cherish the present; cherish the people before you.", source: "生活智慧"},

    // 关于呼吸
    {zh: "呼吸是生命的节奏。", en: "Breathing is the rhythm of life.", source: "禅宗"},
    {zh: "你此刻的呼吸，就是最好的证明——你还活着。", en: "Your breath right now is the best proof — you are still alive.", source: "存在主义"},
    {zh: "深呼吸，感受生命的流动。", en: "Take a deep breath; feel the flow of life.", source: "心理学"},
    {zh: "一呼一吸之间，藏着生命的全部秘密。", en: "Between each inhale and exhale lies all the secrets of life.", source: "文学"},
    {zh: "停下来，深呼吸，继续前行。", en: "Stop, breathe deeply, then move on.", source: "生活智慧"},
    {zh: "呼吸是连接身体和心灵的桥梁。", en: "Breathing is the bridge connecting body and mind.", source: "心理学"},
    {zh: "每一个呼吸都是新的机会。", en: "Every breath is a new opportunity.", source: "存在主义"},
    {zh: "感受呼吸，就是感受当下。", en: "Feeling the breath is feeling the present.", source: "禅宗"},
    {zh: "呼吸是免费的，却是无价的礼物。", en: "Breathing is free, yet a priceless gift.", source: "生活智慧"},
    {zh: "在呼吸中，我们找到平静。", en: "In breathing, we find peace.", source: "心理学"},
    {zh: "当你不知所措时，深呼吸。", en: "When you don't know what to do, take a deep breath.", source: "生活智慧"},
    {zh: "呼吸是生命最基本的节奏，也是最简单的修行。", en: "Breathing is life's most basic rhythm, and also the simplest practice.", source: "禅宗"},
    {zh: "活着本身就是奇迹。", en: "Being alive itself is a miracle.", source: "文学"},
    {zh: "感受空气进出身体，这是生命的证明。", en: "Feel the air entering and leaving your body; this is proof of life.", source: "存在主义"},
    {zh: "呼吸连接着你和这个世界。", en: "Breathing connects you with this world.", source: "心理学"},

    // 关于明天
    {zh: "太阳每天都会升起。明天又是新的一天。", en: "The sun rises every day. Tomorrow is a new day.", source: "海明威"},
    {zh: "明天会更好。", en: "Tomorrow will be better.", source: "生活智慧"},
    {zh: "未知生，焉知死。理解死亡，才能更好地活着。", en: "Not knowing life, how can we know death? Understanding death helps us live better.", source: "孔子"},
    {zh: "明天是今天的继续，也是今天的重生。", en: "Tomorrow is the continuation of today, and also today's rebirth.", source: "文学"},
    {zh: "每一个明天都是新的可能。", en: "Every tomorrow is a new possibility.", source: "心理学"},
    {zh: "不要为明天忧虑，因为明天有明天的忧虑。", en: "Do not worry about tomorrow, for tomorrow has its own worries.", source: "圣经"},
    {zh: "今天的事今天做，明天的事明天来。", en: "Today's matters today, tomorrow's matters tomorrow.", source: "生活智慧"},
    {zh: "明天属于那些相信明天的人。", en: "Tomorrow belongs to those who believe in tomorrow.", source: "文学"},
    {zh: "希望是在黑暗中点亮明天的灯。", en: "Hope is the lamp that lights up tomorrow in darkness.", source: "文学"},
    {zh: "每一个新的早晨都是重新开始的机会。", en: "Every new morning is an opportunity to start over.", source: "生活智慧"},
    {zh: "明天是由无数个今天组成的。", en: "Tomorrow is made up of countless todays.", source: "存在主义"},
    {zh: "你期待什么样的明天，就去创造它。", en: "Whatever tomorrow you expect, go create it.", source: "心理学"},
    {zh: "长风破浪会有时，直挂云帆济沧海。你的时机正在到来。", en: "There will be a time to ride the wind and break the waves. Your time is coming.", source: "李白"},
    {zh: "未来可期。", en: "The future is worth anticipating.", source: "生活智慧"},
    {zh: "每一个不曾起舞的日子，都是对生命的辜负。", en: "Every day not danced is a betrayal of life.", source: "尼采"},

    // 关于边界
    {zh: "自由的边界是他人。", en: "The boundary of freedom is others.", source: "哲学"},
    {zh: "知道自己的边界，是智慧的开始。", en: "Knowing your boundaries is the beginning of wisdom.", source: "心理学"},
    {zh: "边界不是墙，而是桥梁。", en: "Boundaries are not walls, but bridges.", source: "文学"},
    {zh: "尊重边界，就是尊重自己。", en: "Respecting boundaries is respecting yourself.", source: "心理学"},
    {zh: "设立边界是自爱的表现。", en: "Setting boundaries is an expression of self-love.", source: "心理学"},
    {zh: "了解自己的极限，也了解自己的潜能。", en: "Know your limits, but also your potential.", source: "文学"},
    {zh: "边界是保护，也是自由。", en: "Boundaries are protection, and also freedom.", source: "心理学"},
    {zh: "在边界内，我们可以自由地做自己。", en: "Within boundaries, we can freely be ourselves.", source: "文学"},
    {zh: "健康的边界带来健康的关系。", en: "Healthy boundaries bring healthy relationships.", source: "心理学"},
    {zh: "学会说“不”，是成长的标志。", en: "Learning to say \"no\" is a sign of growth.", source: "心理学"},
    {zh: "每个人都需要自己的空间。", en: "Everyone needs their own space.", source: "文学"},
    {zh: "边界让我们知道什么是够了。", en: "Boundaries tell us what is enough.", source: "心理学"},
    {zh: "在尊重中设立边界，在边界中保持尊重。", en: "Set boundaries with respect; maintain respect within boundaries.", source: "文学"},
    {zh: "边界不是疏远，而是关系的保护。", en: "Boundaries are not alienation, but protection of relationships.", source: "心理学"},
    {zh: "认识边界，才能更好地跨越边界。", en: "Understanding boundaries helps you cross them better.", source: "文学"},

    // 关于自由
    {zh: "自由是成长的目的。你正在成长。", en: "Freedom is the purpose of growth. You are growing.", source: "弗洛姆"},
    {zh: "自由不是你想做什么就做什么，而是你想不做什么就不做什么。", en: "Freedom is not doing what you want, but not doing what you don't want.", source: "康德"},
    {zh: "自由是一个可怕的概念。但它也是最美丽的礼物。", en: "Freedom is a terrifying concept. But it is also the most beautiful gift.", source: "萨特"},
    {zh: "自由是孤独的，但这份孤独是成长的代价。", en: "Freedom is lonely, but this loneliness is the price of growth.", source: "弗洛姆"},
    {zh: "自由意味着责任。你的责任也是你的尊严。", en: "Freedom means responsibility. Your responsibility is also your dignity.", source: "萨特"},
    {zh: "人是注定的自由。无论处境如何，你永远有选择。", en: "Man is condemned to be free. No matter the situation, you always have choices.", source: "萨特"},
    {zh: "自由需要勇气，也需要能力。", en: "Freedom requires courage, and also ability.", source: "心理学"},
    {zh: "真正的自由是心灵的自由。", en: "True freedom is the freedom of the soul.", source: "文学"},
    {zh: "自由不是为所欲为，而是有所为有所不为。", en: "Freedom is not doing as you please, but knowing what to do and what not to do.", source: "哲学"},
    {zh: "自由是灵魂的氧气。", en: "Freedom is the oxygen of the soul.", source: "富兰克林"},
    {zh: "自由是灵魂的权利。", en: "Freedom is the right of the soul.", source: "文学"},
    {zh: "每一个选择都是对自由的践行。", en: "Every choice is the practice of freedom.", source: "存在主义"},
    {zh: "自由是一个过程，不是一个终点。", en: "Freedom is a process, not a destination.", source: "心理学"},
    {zh: "在约束中寻找自由，在自由中承担责任。", en: "Find freedom in constraint; take responsibility in freedom.", source: "哲学"},
    {zh: "自由是对自己负责。", en: "Freedom is being responsible for yourself.", source: "萨特"},

    // 关于温柔
    {zh: "因为懂得，所以慈悲。你懂得自己的痛苦，这是慈悲的开始。", en: "Because we understand, we are compassionate. You understand your pain; this is the beginning of compassion.", source: "张爱玲"},
    {zh: "温柔是最大的力量。", en: "Gentleness is the greatest strength.", source: "文学"},
    {zh: "对自己温柔一点。", en: "Be gentle with yourself.", source: "心理学"},
    {zh: "温柔不是软弱，而是力量的另一种形式。", en: "Gentleness is not weakness, but another form of strength.", source: "文学"},
    {zh: "你值得被温柔对待，包括来自你自己。", en: "You deserve to be treated gently, including by yourself.", source: "心理学"},
    {zh: "温柔地对待自己和他人，是最好的生活方式。", en: "Treating yourself and others gently is the best way of life.", source: "文学"},
    {zh: "有时候，脆弱是最有力的力量。", en: "Sometimes vulnerability is the most powerful strength.", source: "文学"},
    {zh: "允许自己软弱，才是真正的强大。", en: "Allowing yourself to be weak is true strength.", source: "贾平凹"},
    {zh: "真正的强大不是压倒一切，而是温柔地包容一切。", en: "True strength is not overwhelming everything, but gently embracing everything.", source: "文学"},
    {zh: "温柔地对待这个世界，世界也会温柔地对待你。", en: "Treat the world gently, and the world will treat you gently.", source: "生活智慧"},
    {zh: "慈悲从对自己开始。", en: "Compassion begins with yourself.", source: "佛教"},
    {zh: "温柔是灵魂的语言。", en: "Gentleness is the language of the soul.", source: "文学"},
    {zh: "有时候，温柔比强硬更有力量。", en: "Sometimes gentleness is more powerful than force.", source: "心理学"},
    {zh: "善待自己，是终身浪漫的开始。", en: "Being kind to yourself is the beginning of lifelong romance.", source: "文学"},
    {zh: "让爱而非恐惧驱动你的行动。", en: "Let love, not fear, drive your actions.", source: "心理学"},

    // 关于变化
    {zh: "变化是唯一的不变。", en: "Change is the only constant.", source: "赫拉克利特"},
    {zh: "改变解读，改变一切。", en: "Change the interpretation, change everything.", source: "艾利斯"},
    {zh: "不是你不能改变，而是你选择不改变。", en: "It's not that you can't change, but that you choose not to.", source: "心理学"},
    {zh: "变化是成长的证明。", en: "Change is proof of growth.", source: "文学"},
    {zh: "唯一不变的是变化本身。", en: "The only thing that doesn't change is change itself.", source: "哲学"},
    {zh: "当我接纳自己的本来面目时，我就可以改变。", en: "When I accept myself as I am, I can change.", source: "罗杰斯"},
    {zh: "变化始于接纳。", en: "Change begins with acceptance.", source: "心理学"},
    {zh: "不要害怕变化，它往往是进步的信号。", en: "Don't fear change; it is often a signal of progress.", source: "文学"},
    {zh: "变化是生命的本质。", en: "Change is the essence of life.", source: "存在主义"},
    {zh: "改变不是放弃，而是适应。", en: "Change is not giving up, but adapting.", source: "心理学"},
    {zh: "每一次改变都是一次重生的机会。", en: "Every change is an opportunity for rebirth.", source: "文学"},
    {zh: "你无法改变过去，但你可以改变对过去的感受。", en: "You can't change the past, but you can change how you feel about it.", source: "心理学"},
    {zh: "拥抱变化，是智慧的体现。", en: "Embracing change is a sign of wisdom.", source: "文学"},
    {zh: "变化带来新的可能性。", en: "Change brings new possibilities.", source: "心理学"},
    {zh: "改变是困难的，但改变是可能的。", en: "Change is difficult, but change is possible.", source: "心理学"},

    // 关于坚持
    {zh: "坚持是成功的第一秘诀。", en: "Persistence is the first secret of success.", source: "爱迪生"},
    {zh: "不要放弃，希望永远在。", en: "Don't give up; hope is always there.", source: "生活智慧"},
    {zh: "坚持不是固执，而是信念。", en: "Persistence is not stubbornness, but faith.", source: "文学"},
    {zh: "锲而不舍，金石可镂。", en: "Persistence can carve even metal and stone.", source: "荀子"},
    {zh: "只要功夫深，铁杵磨成针。", en: "With enough effort, an iron rod can be ground into a needle.", source: "中国谚语"},
    {zh: "坚持是最短的路径。", en: "Persistence is the shortest path.", source: "生活智慧"},
    {zh: "黎明前最黑暗。", en: "It's darkest before dawn.", source: "文学"},
    {zh: "你正在坚持，这本身就很了不起。", en: "You are persisting; that itself is remarkable.", source: "心理学"},
    {zh: "坚持需要勇气，更需要信念。", en: "Persistence requires courage, and even more, faith.", source: "文学"},
    {zh: "再坚持一下，你就赢了。", en: "Persist a little more, and you'll win.", source: "生活智慧"},
    {zh: "不放弃是对自己最大的尊重。", en: "Not giving up is the greatest respect for yourself.", source: "心理学"},
    {zh: "坚持是一种选择。", en: "Persistence is a choice.", source: "存在主义"},
    {zh: "成功者和失败者的区别在于坚持。", en: "The difference between the successful and the failed is persistence.", source: "文学"},
    {zh: "坚持到底，就是胜利。", en: "Persisting to the end is victory.", source: "生活智慧"},
    {zh: "你不是失败，你只是还没成功。", en: "You haven't failed; you just haven't succeeded yet.", source: "文学"}
];

// ========== 每日内容池逻辑 ==========
// 基于日期生成确定性随机种子
function getDateSeed(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return year * 10000 + month * 100 + day;
}

// 简单的伪随机数生成器（基于种子）
function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Fisher-Yates 洗牌算法（使用种子）
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

// 获取每日内容池（固定50条）
function getDailyPool() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // 检查是否需要更新（日期变了）
    if (state.lastDate !== dateString) {
        state.lastDate = dateString;
        const seed = getDateSeed(today);
        const shuffled = seededShuffle(bilingualContent, seed);
        state.dailyPool = shuffled.slice(0, Math.min(50, shuffled.length));

        // 保存到 localStorage
        localStorage.setItem('lastDate', dateString);
        localStorage.setItem('dailyPool', JSON.stringify(state.dailyPool));
    } else {
        // 从 localStorage 恢复
        const saved = localStorage.getItem('dailyPool');
        if (saved) {
            state.dailyPool = JSON.parse(saved);
        }
    }

    return state.dailyPool;
}

// 获取当前语言的内容池
function getCurrentContent() {
    const dailyContent = getDailyPool();

    switch(state.language) {
        case 'zh':
            return dailyContent.map(item => ({ story: item.zh, source: item.source }));
        case 'en':
            return dailyContent.map(item => ({ story: item.en, source: item.source }));
        case 'both':
            // 双语对照模式：返回双语内容
            return dailyContent;
        default:
            return dailyContent.map(item => ({ story: item.zh, source: item.source }));
    }
}

// DOM Elements
let themeToggle, anchorButton, flashOverlay, messageCard, mainMessage, storySource, particlesContainer, soundBtn, soundMenu, soundLabel, navPrev, navNext, navPrevMobile, navNextMobile, langBtn, langMenu, langLabel;

// Initialization
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

// Theme Toggle
function setupThemeToggle() {
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
    });
}

// Sound Menu
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

// Language Menu
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
            // 如果已经激活，重置内容池
            if (state.activated) {
                prepareContentPool();
                showCurrentContent();
            }
        });
    });

    document.addEventListener('click', () => langMenu.classList.remove('show'));
}

// Ripple Effect
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

// Particles
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

// Shuffle and prepare content pool
function prepareContentPool() {
    state.contentPool = getCurrentContent();
    // 使用每日池，不再随机打乱，保持每日50条内容的顺序固定
    state.currentIndex = 0;
}

// Show current content
function showCurrentContent(direction = null) {
    const content = state.contentPool[state.currentIndex];

    if (state.language === 'both') {
        // 双语对照模式：显示中英文对照
        mainMessage.innerHTML = `<span class="zh-text">${content.zh}</span><span class="en-text">${content.en}</span>`;
    } else {
        mainMessage.textContent = content.story;
    }
    storySource.textContent = content.source;
}

// Navigate content
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

// Activate button
function activateButton(e) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    createRipple(e);
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

// Close message
function closeMessage(e) {
    if (e.target === messageCard || messageCard.contains(e.target)) return;
    if (messageCard.classList.contains('visible')) {
        messageCard.classList.remove('visible');
        setTimeout(() => {
            particlesContainer.classList.remove('particles-active');
            state.activated = false;
        }, 400);
    }
}

// Touch handlers for swipe
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

// Keyboard navigation
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

// Event Listeners Setup
function setupEventListeners() {
    anchorButton.addEventListener('click', activateButton);
    document.addEventListener('click', closeMessage);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    // Desktop Navigation buttons
    navPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('prev');
    });
    navNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('next');
    });

    // Mobile Navigation buttons
    navPrevMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('prev');
    });
    navNextMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateContent('next');
    });
}

// Page Load Animation
function setupPageLoadAnimation() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
}

// Main Initialization
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
