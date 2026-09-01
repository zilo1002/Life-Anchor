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
    touchStartX: 0,
    touchEndX: 0,
    language: localStorage.getItem('language') || 'zh' // 'zh', 'en', 'both'
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

function playSound() {
    try { sounds[state.currentSound]?.(); } catch (e) {}
}

function playSuccessChime() {
    try {
        const ctx = getAudioCtx();
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.12);
            osc.stop(ctx.currentTime + i * 0.12 + 0.5);
        });
    } catch (e) {}
}

// ========== 中文内容库 ==========
const chineseContent = generateChineseContent();

function generateChineseContent() {
    const content = [];

// 关于存在
const existenceQuotes = [
    ["存在不是一种状态，而是一种选择。每时每刻，我们都在选择成为什么样的人。", "——萨特《存在与虚无》"],
    ["人是被抛入世界的。但如何面对被抛入的状态，才是你真正的存在。", "——海德格尔《存在与时间》"],
    ["存在先于本质。你没有被赋予意义，你创造意义。", "——萨特"],
    ["真正严肃的哲学问题只有一个——自杀。然而反抗荒谬，本身就是意义。", "——加缪《西西弗斯神话》"],
    ["向死而生。正因为生命有限，每一个当下才如此珍贵。", "——海德格尔"],
    ["生命的意义在于承担起生命的责任，在无意义的世界中创造意义。", "——加缪"],
    ["我反抗，故我在。你的反抗证明了你的存在。", "——加缪《反抗者》"],
    ["人被判定为自由，无论处境如何，你永远有选择面对方式的权利。", "——萨特"],
    ["对于无限的唯一的反叛，是创造。你正在创造。", "——加缪"],
    ["人是他自己的造物。懦夫是自己造就的，英雄也是自己造就的。", "——萨特"],
    ["焦虑是自由的眩晕。你感到迷茫，是因为你有选择的自由。", "——克尔凯郭尔"],
    ["深渊不是终点，而是觉醒的起点。人类始终能够从深渊中救出自己。", "——雅斯贝尔斯"],
    ["你不是你的过去，你是你选择的未来。", "——存在主义"],
    ["每一个选择都在定义你是谁。", "——萨特"],
    ["活在当下，不是口号，是对生命最基本的尊重。", "——禅宗"]
];

// 关于时间
const timeQuotes = [
    ["时间是最好的老师，但它最终会杀死所有的学生。", "——路易·费迪南·塞利纳"],
    ["时间不是金钱，时间是生命。你正在花费的每一刻，都无法挽回。", "——亨利·大卫·梭罗《瓦尔登湖》"],
    ["我们无法管理时间，我们只能管理自己。", "——彼得·德鲁克"],
    ["时间会治愈一切，但需要你每天服用——那就是活着。", "——存在主义智慧"],
    ["时间是最公平的老师，它给每个人的一天都是24小时。", "——文学智慧"],
    ["不要为已逝去的时间叹息，请把握正在流逝的时间。", "——塞涅卡"],
    ["昨天是历史，明天是谜团，只有今天才是礼物。", "——凯瑟琳·布恩"],
    ["时间是治愈创伤的良药，但它也是一种毒药，会让人上瘾于等待。", "——文学"],
    ["每一个今天都是你未来永远不会回来的礼物。", "——生活智慧"],
    ["时间是一条河流，我们都是河中的石头，被水流冲刷，也在留下痕迹。", "——文学"],
    ["过去从未死去，它甚至还没有过去。但你可以让过去成为成长的养分。", "——福克纳"],
    ["时间不等人，但它会等你准备好。", "——生活智慧"],
    ["时间是最好的裁判，它会证明一切。", "——文学"],
    ["不要浪费时间去解释自己，时间会替你说话。", "——文学"],
    ["时间不是用来等待的，而是用来创造的。", "——存在主义"]
];

// 关于疲惫
const exhaustionQuotes = [
    ["累了吗？这是正常的。太阳每天都会升起，明天又是新的一天。", "——海明威"],
    ["疲惫是生命的常态，但黎明总会到来。", "——文学智慧"],
    ["当你累了的时候就休息，但不要放弃。", "——生活智慧"],
    ["在最深的疲惫中，往往藏着最深的觉醒。", "——哲学"],
    ["你不必一直坚强，偶尔的软弱是允许的。", "——心理学"],
    ["累了就停下脚步，呼吸也是一种前进。", "——禅宗"],
    ["疲惫不是终点，而是休息的起点。", "——生活智慧"],
    ["身体需要休息，心灵也需要呼吸的空间。", "——文学"],
    ["不要把自己逼得太紧，你已经做得够好了。", "——心理学"],
    ["休息是为了走更远的路。", "——中国谚语"],
    ["当你觉得累的时候，其实你正在变得更强。", "——生活智慧"],
    ["疲惫是成长的代价，也是勋章。", "——文学"],
    ["给自己一个拥抱，你值得被温柔对待。", "——心理学"],
    ["夜晚总会过去，黎明总会到来。", "——生活智慧"],
    ["你不需要一直跑，有时候走路也是一种前进。", "——存在主义"]
];

// 关于重新开始
const freshStartQuotes = [
    ["每一天都是新的开始，每一个清晨都是重生的机会。", "——生活智慧"],
    ["无论昨天发生了什么，今天都是崭新的一天。", "——文学"],
    ["重新开始永远不晚。", "——保罗·柯艾略《牧羊少年奇幻之旅》"],
    ["沉舟侧畔千帆过，病树前头万木春。旧的总会过去，新的总会到来。", "——刘禹锡"],
    ["山重水复疑无路，柳暗花明又一村。黑暗之后就是光明。", "——陆游"],
    ["野火烧不尽，春风吹又生。你像草一样，有无限的生命力。", "——白居易"],
    ["无论你跌倒多少次，只要站起来，你就赢了。", "——海明威《老人与海》"],
    ["过去无法改变，但未来永远可以。", "——存在主义"],
    ["一个新的开始，不需要完美的理由。", "——文学"],
    ["你永远有机会重新定义自己。", "——心理学"],
    ["莫等闲，白了少年头，空悲切。但即使白了头，你也可以重新开始。", "——岳飞"],
    ["人生若只如初见。每一刻都是新的开始。", "——纳兰性德"],
    ["冬天来了，春天还会远吗？", "——雪莱"],
    ["放下过去的包袱，轻装前行。", "——禅宗"],
    ["今天是你余生的第一天。", "——生活智慧"]
];

// 关于孤独
const lonelinessQuotes = [
    ["孤独是自由的代价，但这份孤独是成长的代价。", "——弗洛姆《逃避自由》"],
    ["人是被称为城邦的动物。你属于某个地方，你被需要。", "——亚里士多德"],
    ["我孤独，但我不寂寞。", "——黑塞《悉达多》"],
    ["往外看的人在做梦，往内看的人正在觉醒。", "——荣格《红书》"],
    ["你不是孤独的旅行者，你的每一步都在地球上留下痕迹。", "——文学"],
    ["在孤独中，我们学会与自己对话。", "——哲学"],
    ["孤独不是与世隔绝，而是在人群中依然感到空虚。", "——心理学"],
    ["学会享受孤独，是成熟的标志。", "——文学"],
    ["你不必一直被人理解，有时候理解自己就够了。", "——存在主义"],
    ["世界上没有真正的感同身受，但有人愿意倾听。", "——文学"],
    ["孤独是灵魂的呼吸空间。", "——哲学"],
    ["在人群中感到孤独，比独处更孤独。", "——文学"],
    ["孤独是一种选择，也是一种能力。", "——心理学"],
    ["你不是一个人。至少，你还有自己。", "——存在主义"],
    ["所有的相遇，都是久别重逢。", "——文学"]
];

// 关于选择
const choiceQuotes = [
    ["存在先于本质。你选择了成为什么样的人。", "——萨特"],
    ["在刺激和反应之间，有一个空间，在那个空间里，我们有力量选择我们的反应。", "——维克多·弗兰克尔《活出意义来》"],
    ["人生没有标准答案，但每个选择都有代价。", "——文学"],
    ["选择比努力更重要，但选择之后的努力同样重要。", "——生活智慧"],
    ["每一个选择都在塑造你成为谁。", "——存在主义"],
    ["世上没有后悔药，但每一个选择都有意义。", "——文学"],
    ["选择不做什么，比选择做什么更难。", "——文学"],
    ["你永远有选择的权利，即使在看似没有选择的情况下。", "——弗兰克尔"],
    ["每一个选择都是一次重生的机会。", "——心理学"],
    ["不要害怕选择，因为不选择本身也是一种选择。", "——存在主义"],
    ["选择没有对错，只有承担。", "——文学"],
    ["你的选择定义了你是谁。", "——哲学"],
    ["没有完美的选择，但有属于你的选择。", "——文学"],
    ["选择爱而不是恨，选择希望而不是绝望。", "——心理学"],
    ["人生就是一连串的选择，而你现在就在选择。", "——存在主义"]
];

// 关于自我
const selfQuotes = [
    ["认识你自己。这是一切智慧的开始。", "——苏格拉底"],
    ["你未看此花时，此花与汝心同归于寂。你的心，就是整个宇宙的镜子。", "——王阳明《传习录》"],
    ["成为你自己，是世界上最孤独的道路，但也是最值得走的道路。", "——罗杰斯《成为一个人》"],
    ["每个人的生命都是通往自我的征途。", "——黑塞《德米安》"],
    ["觉醒的人只有一个责任——找到自己，成为自己。", "——黑塞"],
    ["真正的自己比面具更值得信任。", "——卡尔·罗杰斯"],
    ["你拥有比你想象的更大的内在力量。", "——心理学"],
    ["圣人之道，吾性自足。你内在的力量，比你想象的更大。", "——王阳明龙场悟道"],
    ["与自己和解是人生最重要的课题。", "——荣格"],
    ["接纳是改变的前提。你被接纳了。", "——罗杰斯"],
    ["生命的目的就是成为自己。你正在成为自己。", "——罗杰斯"],
    ["真正的强大不是压倒一切，而是接纳一切。", "——心理学"],
    ["你不是你的过去，你是你选择的未来。", "——存在主义"],
    ["做真实的自己，比做任何人都好。", "——心理学"],
    ["你本具足，何须外求。", "——禅宗"]
];

// 关于希望
const hopeQuotes = [
    ["希望是附丽于存在的，有存在，便有希望，有希望，便是光明。", "——鲁迅"],
    ["在隆冬，我终于知道，我身上有一个不可战胜的夏天。", "——加缪《反抗者》"],
    ["那杀不死我的，使我更强大。", "——尼采"],
    ["希望是在风暴中保持平静的能力。", "——心理学"],
    ["最深的深渊也会倒映星星。你的深渊里也有星星。", "——尼采"],
    ["等待是最本质的行为。在等待中，你保持了希望。", "——薇依"],
    ["希望是坚韧的拐杖，支撑你走过最黑暗的路。", "——文学"],
    ["只要有希望，就有一切可能。", "——生活智慧"],
    ["希望是不放弃的另一个名字。", "——文学"],
    ["在绝望中寻找希望，是人类的本能。", "——心理学"],
    ["希望是灵魂的眼睛。", "——文学"],
    ["即使在最黑暗的夜晚，星星依然闪烁。", "——生活智慧"],
    ["希望是通往明天的桥梁。", "——文学"],
    ["有希望的地方，地狱也会变成天堂。", "——但丁"],
    ["希望永远在前方等着我们。", "——生活智慧"]
];

// 关于等待
const waitingQuotes = [
    ["等待是最本质的行为。", "——薇依《重负与神恩》"],
    ["众里寻他千百度，蓦然回首，那人却在灯火阑珊处。", "——辛弃疾"],
    ["等待是生活的一部分，不等待也是。", "——文学"],
    ["时间是最好的老师，它会证明一切。", "——生活智慧"],
    ["在等待中积蓄力量，在机遇来临时爆发。", "——心理学"],
    ["等待不是消极，而是蓄势。", "——文学"],
    ["行到水穷处，坐看云起时。有时候迷路也是风景。", "——王维"],
    ["等待是一种智慧，也是一种勇气。", "——文学"],
    ["该来的总会来，你要做的只是准备好自己。", "——生活智慧"],
    ["等待是痛苦的，但也是必要的。", "——文学"],
    ["莫听穿林打叶声，何妨吟啸且徐行。即使等待，也从容。", "——苏轼"],
    ["等待是一种信任，信任生命会给你最好的安排。", "——心理学"],
    ["等待不是为了放弃，而是为了更好的相遇。", "——文学"],
    ["等待是最长情的告白。", "——文学"],
    ["在等待中成长，在成长中等待。", "——存在主义"]
];

// 关于成长
const growthQuotes = [
    ["一个人能成为什么，他就必须成为什么。你有无限的可能性。", "——马斯洛"],
    ["每一步危机都是成长的契机。你的危机正在转化为成长。", "——埃里克森"],
    ["成长意味着走出舒适区，拥抱不确定性。", "——心理学"],
    ["重要的不是经历，而是我们赋予经历的意义。", "——阿德勒"],
    ["成长是痛苦的，但痛苦是成长的代价。", "——文学"],
    ["我们不是因为失败而失败，而是因为缺乏面对失败的勇气。", "——阿德勒"],
    ["自我实现者能够接纳自己、接纳他人、接纳自然。你正在接纳。", "——马斯洛"],
    ["成长是一个过程，不是终点。", "——罗杰斯"],
    ["裂缝是光进入你内心的地方。", "——文学"],
    ["每一个伤口都是成长的印记。", "——心理学"],
    ["成长意味着拥抱变化。", "——文学"],
    ["你比你想象的更强大。", "——尼采"],
    ["成长就是不断发现自己新的可能性。", "——心理学"],
    ["痛苦会过去，但你的勇气会留下来。", "——文学"],
    ["成长是成为你想成为的人的过程。", "——存在主义"]
];

// 关于失去
const lossQuotes = [
    ["生命中真正重要的不是你遭遇了什么，而是你记住了哪些事。", "——马尔克斯《百年孤独》"],
    ["生命中的每一次失去，都在为更重要的东西腾出空间。", "——心理学"],
    ["失去是生命的一部分，接受失去是成长的一部分。", "——文学"],
    ["你的心碎的地方，可以成为爱流入的地方。", "——文学"],
    ["不是所有的东西都会永远存在，但回忆可以。", "——文学"],
    ["失去让我们懂得珍惜。", "——心理学"],
    ["有些东西失去了，就再也回不来了。但生活还在继续。", "——文学"],
    ["失去并不可怕，可怕的是失去后不敢再拥有。", "——文学"],
    ["每一次失去都是一次重新评估生命的机会。", "——心理学"],
    ["失去是痛苦的，但也是必要的。", "——文学"],
    ["生命是一种不断失去和不断获得的过程。", "——存在主义"],
    ["失去不是终点，而是另一种开始。", "——文学"],
    ["珍惜你所拥有的，接受你所失去的。", "——心理学"],
    ["失去教我们什么是真正重要的。", "——文学"],
    ["勇敢面对失去，然后继续前行。", "——生活智慧"]
];

// 关于勇气
const courageQuotes = [
    ["勇气不是没有恐惧，而是带着恐惧依然前行。", "——文学"],
    ["智慧意味着勇敢。你已经展示了你的勇气。", "——柏拉图"],
    ["人可以被毁灭，但不能被打败。你没有被毁灭。", "——海明威"],
    ["勇气是所有美德的基石。", "——亚里士多德"],
    ["勇敢不是不害怕，而是害怕了还能面对。", "——心理学"],
    ["每一个选择的背后都有勇气。", "——存在主义"],
    ["你比你想象的更勇敢。", "——文学"],
    ["勇气是灵魂的力量。", "——文学"],
    ["做一个勇敢的人，去做你害怕的事情。", "——心理学"],
    ["勇气不是消除恐惧，而是认识到有比恐惧更重要的东西。", "——文学"],
    ["最大的勇气是敢于展示脆弱。", "——心理学"],
    ["勇气是改变的第一步。", "——存在主义"],
    ["你不是你的恐惧，你是你面对恐惧的勇气。", "——文学"],
    ["有勇气的人，不是因为他们不害怕，而是因为他们害怕了还能行动。", "——文学"],
    ["勇气是通往自由的钥匙。", "——文学"]
];

// 关于日常
const dailyQuotes = [
    ["生活不是要等待完美时刻，而是要把平凡时刻变得完美。", "——生活智慧"],
    ["吃饭时吃饭，睡觉时睡觉。活在当下，是最深的修行。", "——禅宗语录"],
    ["每一个平凡的日子都是礼物。", "——文学"],
    ["平凡的生活也有诗意。", "——陶渊明"],
    ["生活是种律动，须有光有影，有左有右，有晴有雨。", "——老舍"],
    ["简单的快乐就在身边。", "——孟浩然"],
    ["日常生活中的小确幸，构成了生命的大幸福。", "——文学"],
    ["不要忽视日常中的美好。", "——心理学"],
    ["每一顿饭，每一次呼吸，都是生命的馈赠。", "——存在主义"],
    ["生活不在远方，就在每一个当下。", "——禅宗"],
    ["以清净心看世界，以欢喜心过生活。", "——林清玄"],
    ["你若爱，生活哪里都可爱。", "——丰子恺"],
    ["最美的风景在最意想不到的地方。", "——杜牧"],
    ["生命不是一个需要解决的问题，而是一个需要体验的礼物。", "——文学"],
    ["珍惜当下，珍惜眼前人。", "——生活智慧"]
];

// 关于呼吸
const breathQuotes = [
    ["呼吸是生命的节奏。", "——禅宗"],
    ["你此刻的呼吸，就是最好的证明——你还活着。", "——存在主义"],
    ["深呼吸，感受生命的流动。", "——心理学"],
    ["一呼一吸之间，藏着生命的全部秘密。", "——文学"],
    ["停下来，深呼吸，继续前行。", "——生活智慧"],
    ["呼吸是连接身体和心灵的桥梁。", "——心理学"],
    ["每一个呼吸都是新的机会。", "——存在主义"],
    ["感受呼吸，就是感受当下。", "——禅宗"],
    ["呼吸是免费的，却是无价的礼物。", "——生活智慧"],
    ["在呼吸中，我们找到平静。", "——心理学"],
    ["当你不知所措时，深呼吸。", "——生活智慧"],
    ["呼吸是生命最基本的节奏，也是最简单的修行。", "——禅宗"],
    ["活着本身就是奇迹。", "——文学"],
    ["感受空气进出身体，这是生命的证明。", "——存在主义"],
    ["呼吸连接着你和这个世界。", "——心理学"]
];

// 关于明天
const tomorrowQuotes = [
    ["太阳每天都会升起。明天又是新的一天。", "——海明威"],
    ["明天会更好。", "——生活智慧"],
    ["未知生，焉知死。理解死亡，才能更好地活着。", "——孔子"],
    ["明天是今天的继续，也是今天的重生。", "——文学"],
    ["每一个明天都是新的可能。", "——心理学"],
    ["不要为明天忧虑，因为明天有明天的忧虑。", "——圣经"],
    ["今天的事今天做，明天的事明天来。", "——生活智慧"],
    ["明天属于那些相信明天的人。", "——文学"],
    ["希望是在黑暗中点亮明天的灯。", "——文学"],
    ["每一个新的早晨都是重新开始的机会。", "——生活智慧"],
    ["明天是由无数个今天组成的。", "——存在主义"],
    ["你期待什么样的明天，就去创造它。", "——心理学"],
    ["长风破浪会有时，直挂云帆济沧海。你的时机正在到来。", "——李白"],
    ["未来可期。", "——生活智慧"],
    ["明天是希望的日子。", "——文学"]
];

// 关于边界
const boundaryQuotes = [
    ["自由的边界是他人。", "——哲学"],
    ["知道自己的边界，是智慧的开始。", "——心理学"],
    ["边界不是墙，而是桥梁。", "——文学"],
    ["尊重边界，就是尊重自己。", "——心理学"],
    ["设立边界是自爱的表现。", "——心理学"],
    ["了解自己的极限，也了解自己的潜能。", "——文学"],
    ["边界是保护，也是自由。", "——心理学"],
    ["在边界内，我们可以自由地做自己。", "——文学"],
    ["健康的边界带来健康的关系。", "——心理学"],
    ["学会说“不”，是成长的标志。", "——心理学"],
    ["每个人都需要自己的空间。", "——文学"],
    ["边界让我们知道什么是“够了”。", "——心理学"],
    ["在尊重中设立边界，在边界中保持尊重。", "——文学"],
    ["边界不是疏远，而是关系的保护。", "——心理学"],
    ["认识边界，才能更好地跨越边界。", "——文学"]
];

// 关于自由
const freedomQuotes = [
    ["自由是成长的目的。你正在成长。", "——弗洛姆"],
    ["自由不是你想做什么就做什么，而是你想不做什么就不做什么。", "——康德"],
    ["自由是一个可怕的概念。但它也是最美丽的礼物。", "——萨特"],
    ["自由是孤独的，但这份孤独是成长的代价。", "——弗洛姆"],
    ["自由意味着责任。你的责任也是你的尊严。", "——萨特"],
    ["人是注定的自由。无论处境如何，你永远有选择。", "——萨特"],
    ["自由需要勇气，也需要能力。", "——心理学"],
    ["真正的自由是心灵的自由。", "——文学"],
    ["自由不是为所欲为，而是有所为有所不为。", "——哲学"],
    ["Freedom is the oxygen of the soul. 自由是灵魂的氧气。", "——富兰克林"],
    ["自由是灵魂的权利。", "——文学"],
    ["每一个选择都是对自由的践行。", "——存在主义"],
    ["自由是一个过程，不是一个终点。", "——心理学"],
    ["在约束中寻找自由，在自由中承担责任。", "——哲学"],
    ["自由是对自己负责。", "——萨特"]
];

// 关于温柔
const gentlenessQuotes = [
    ["因为懂得，所以慈悲。你懂得自己的痛苦，这是慈悲的开始。", "——张爱玲"],
    ["温柔是最大的力量。", "——文学"],
    ["对自己温柔一点。", "——心理学"],
    ["温柔不是软弱，而是力量的另一种形式。", "——文学"],
    ["你值得被温柔对待，包括来自你自己。", "——心理学"],
    ["温柔的对待自己和他人，是最好的生活方式。", "——文学"],
    ["有时候，脆弱是最有力的力量。", "——文学"],
    ["允许自己软弱，才是真正的强大。", "——贾平凹"],
    ["真正的强大不是压倒一切，而是温柔地包容一切。", "——文学"],
    ["温柔地对待这个世界，世界也会温柔地对待你。", "——生活智慧"],
    ["慈悲从对自己开始。", "——佛教"],
    ["温柔是灵魂的语言。", "——文学"],
    ["有时候，温柔比强硬更有力量。", "——心理学"],
    ["善待自己，是终身浪漫的开始。", "——文学"],
    ["让爱而非恐惧驱动你的行动。", "——心理学"]
];

// 关于变化
const changeQuotes = [
    ["变化是唯一的不变。", "——赫拉克利特"],
    ["改变解读，改变一切。", "——艾利斯"],
    ["不是你不能改变，而是你选择不改变。", "——心理学"],
    ["变化是成长的证明。", "——文学"],
    ["唯一不变的是变化本身。", "——哲学"],
    ["当我接纳自己的本来面目时，我就可以改变。", "——罗杰斯"],
    ["变化始于接纳。", "——心理学"],
    ["不要害怕变化，它往往是进步的信号。", "——文学"],
    ["变化是生命的本质。", "——存在主义"],
    ["改变不是放弃，而是适应。", "——心理学"],
    ["每一次改变都是一次重生的机会。", "——文学"],
    ["你无法改变过去，但你可以改变对过去的感受。", "——心理学"],
    ["拥抱变化，是智慧的体现。", "——文学"],
    ["变化带来新的可能性。", "——心理学"],
    ["改变是困难的，但改变是可能的。", "——心理学"]
];

// 关于坚持
const persistenceQuotes = [
    ["坚持是成功的第一秘诀。", "——爱迪生"],
    ["不要放弃，希望永远在。", "——生活智慧"],
    ["坚持不是固执，而是信念。", "——文学"],
    ["锲而不舍，金石可镂。", "——荀子"],
    ["只要功夫深，铁杵磨成针。", "——中国谚语"],
    ["坚持是最短的路径。", "——生活智慧"],
    ["黎明前最黑暗。", "——文学"],
    ["你正在坚持，这本身就很了不起。", "——心理学"],
    ["坚持需要勇气，更需要信念。", "——文学"],
    ["再坚持一下，你就赢了。", "——生活智慧"],
    ["不放弃是对自己最大的尊重。", "——心理学"],
    ["坚持是一种选择。", "——存在主义"],
    ["成功者和失败者的区别在于坚持。", "——文学"],
    ["坚持到底，就是胜利。", "——生活智慧"],
    ["你不是失败，你只是还没成功。", "——文学"]
];

// 组合所有中文内容
[...existenceQuotes, ...timeQuotes, ...exhaustionQuotes, ...freshStartQuotes,
 ...lonelinessQuotes, ...choiceQuotes, ...selfQuotes, ...hopeQuotes,
 ...waitingQuotes, ...growthQuotes, ...lossQuotes, ...courageQuotes,
 ...dailyQuotes, ...breathQuotes, ...tomorrowQuotes, ...boundaryQuotes,
 ...freedomQuotes, ...gentlenessQuotes, ...changeQuotes, ...persistenceQuotes]
.forEach(q => content.push({ story: q[0], source: q[1] }));

// 补充更多中文内容
const extraChinese = [
    ["一切众生皆具如来智慧德相。你的本质不是迷茫，而是光明。", "——《华严经》"],
    ["放下屠刀，立地成佛。放下执念，你就是佛。", "——《金刚经》"],
    ["本来无一物，何处惹尘埃。你的心本来清净。", "——《六祖坛经》"],
    ["知人者智，自知者明。迷茫是智慧的开始。", "——《道德经》老子"],
    ["为学日益，为道日损。放下越多，得到越多。", "——《道德经》老子"],
    ["人莫鉴于流水，而鉴于止水。当你静下来，答案会浮现。", "——《庄子》"],
    ["喜怒哀乐之未发，谓之中。接受你的情绪。", "——《中庸》"],
    ["知行合一。知道和做到之间，是勇气在连接。", "——王阳明"],
    ["庄周梦蝶，不知周之梦为蝴蝶与？你是那个做梦的蝴蝶。", "——《庄子·齐物论》"],
    ["天地与我并生，而万物与我为一。你与宇宙相连。", "——《庄子》"],
    ["莫听穿林打叶声，何妨吟啸且徐行。即使风雨交加，从容前行。", "——苏轼《定风波》"],
    ["长风破浪会有时，直挂云帆济沧海。你的时机正在到来。", "——李白《行路难》"],
    ["会当凌绝顶，一览众山小。你正在攀登，风景会更好。", "——杜甫《望岳》"],
    ["采菊东篱下，悠然见南山。平凡的生活也有诗意。", "——陶渊明"],
    ["生当作人杰，死亦为鬼雄。你活着的每一天都是杰作。", "——李清照"],
    ["人生自古谁无死，留取丹心照汗青。你的存在已经留下痕迹。", "——文天祥"],
    ["春蚕到死丝方尽，蜡炬成灰泪始干。你的付出有意义。", "——李商隐"],
    ["停车坐爱枫林晚，霜叶红于二月花。最美的风景在意想不到处。", "——杜牧"],
    ["欲穷千里目，更上一层楼。你还能看到更多。", "——王之涣"],
    ["忽如一夜春风来，千树万树梨花开。美好的事物会突然出现。", "——岑参"],
    ["加缪说：「荒谬是起点，不是终点。」从荒谬出发，创造意义。", "——《西西弗斯神话》"],
    ["尼采说：「当你凝视深渊时，深渊也在凝视你。」深渊之下，是觉醒。", "——《善恶的彼岸》"],
    ["维特根斯坦说：「世界的意义在世界之外。」意义在活着的过程里显现。", "——《逻辑哲学论》"],
    ["康德说：「有两样东西，我愈是沉思愈觉得敬畏——头顶的星空和心中的道德律。」", "——《实践理性批判》"],
    ["海明威说：「人可以被毁灭，但不能被打败。」你没有被毁灭。", "——《老人与海》"],
    ["托尔斯泰说：「幸福的家庭都是相似的。」你的家庭有你的幸福。", "——《安娜·卡列尼娜》"],
    ["陀思妥耶夫斯基说：「美将拯救世界。」你正在展示美。", "——《白痴》"],
    ["黑塞说：「每个人的生命都是通往自我的征途。」你正在这条路上。", "——《德米安》"],
    ["圣埃克苏佩里说：「真正重要的东西，用眼睛是看不见的。」用心感受。", "——《小王子》"],
    ["小王子说：「你为你的玫瑰花费的时间，使你的玫瑰变得如此重要。」你是那朵玫瑰。", "——《小王子》"],
    ["史铁生说：「人不是苟活，是选择活着。」你选择了活着。", "——《我与地坛》"],
    ["余华说：「人是为活着本身而活着。」活着本身就是意义。", "——《活着》"],
    ["王小波说：「我活在世上，无非想要明白些道理，遇见些有趣的事。」你正在寻找。", "——《沉默的大多数》"],
    ["三毛说：「如果有来生，要做一棵树，站成永恒。」即使此刻痛苦，也是生命的一部分。", "——《说给自己听》"],
    ["鲁迅说：「希望是附丽于存在的，有存在，便有希望。」你存在，所以你有希望。", "——《华盖集》"],
    ["杨绛说：「我们曾如此期盼外界的认可，到最后才知道，世界是自己的。」你的人生是你自己的。", "——《走到人生边上》"],
    ["莫言说：「世事犹如书籍，一页页被翻过去。」翻过这一页，新的篇章在等你。", "——《生死疲劳》"],
    ["路遥说：「生活不能等待别人来安排，要自己去争取和奋斗。」你正在争取和奋斗。", "——《平凡的世界》"],
    ["弗洛伊德说：「那些无法言说的，会以症状的形式说出来。」你的感受值得被听见。", "——《精神分析导论》"],
    ["荣格说：「与自己和解，是人生最重要的课题。」你正在和解。", "——《回忆·梦·思考》"],
    ["阿德勒说：「人的一切烦恼，都来自于人际关系。」但幸福也来自人际关系。", "——《自卑与超越》"],
    ["马斯洛说：「一个人能成为什么，他就必须成为什么。」你有无限可能。", "——《动机与人格》"],
    ["弗兰克尔说：「在刺激和反应之间，有一个空间，我们有力量选择我们的反应。」", "——《活出意义来》"],
    ["泰戈尔说：「生如夏花之绚烂，死如秋叶之静美。」你的生命正在绚烂。", "——《飞鸟集》"],
    ["惠特曼说：「我辽阔广大，我包罗万象。」你也是包罗万象的。", "——《自我之歌》"],
    ["梭罗说：「我步入丛林，因为我希望生活得有意义。」你也在寻找意义。", "——《瓦尔登湖》"],
    ["歌德说：「自然！她环绕着我们，把我们揽进她的怀里。」你不是孤独的。", "——《歌德谈话录》"],
    ["卢梭说：「人是大自然的作品。」你来自自然，属于自然。", "——《论人类不平等的起源》"],
    ["你值得被爱，不需要任何理由。", "——生活智慧"],
    ["你不是孤独的旅行者。", "——文学"],
    ["每一个裂缝都是光进入的地方。", "——文学"],
    ["你不是你的过去，过去只是你生命故事的一章。", "——心理学"],
    ["你的故事还在继续。", "——文学"],
    ["你不是你的失败，你是你站起来的次数。", "——生活智慧"],
    ["你不是你的恐惧，你是你面对恐惧的勇气。", "——文学"],
    ["你不是你的错误，你是你改正的决心。", "——心理学"],
    ["你不是你的标签，标签只是别人给的。", "——文学"],
    ["你不是你的疾病，你是你选择的面对方式。", "——心理学"],
    ["你不是孤独的，你与整个宇宙相连。", "——哲学"],
    ["你不是一个人，至少你还有自己。", "——存在主义"],
    ["你不是谁的谁，你是你自己。", "——文学"],
    ["你不是你的身体，你是你灵魂的居所。", "——哲学"],
    ["你不是你的情绪，你是你情绪的主人。", "——心理学"]
];

extraChinese.forEach(q => content.push({ story: q[0], source: q[1] }));

return content;
}

// ========== 英文内容库 ==========
const englishContent = generateEnglishContent();

function generateEnglishContent() {
    const content = [];

// Existence
const existenceEN = [
    ["Existence is not a state, but a choice. Every moment, we choose who we become.", "——Sartre, Being and Nothingness"],
    ["One is not born, but rather becomes, a woman. One becomes, through choices.", "——Simone de Beauvoir"],
    ["To be is to do. To do is to be. We are what we do.", "——Sartre"],
    ["The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", "——Albert Camus"],
    ["Freedom is what we do with what is done to us.", "——Jean-Paul Sartre"],
    ["Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.", "——Jean-Paul Sartre"],
    ["Life has no meaning the moment you lose the illusion of being eternal.", "——Jean-Paul Sartre"],
    ["It is not enough to have lived. We should be determined to live for something.", "——Winston Churchill"],
    ["The only true wisdom is in knowing you know nothing.", "——Socrates"],
    ["To live is to suffer, to survive is to find some meaning in the suffering.", "——Friedrich Nietzsche"],
    ["He who has a why to live can bear almost any how.", "——Friedrich Nietzsche"],
    ["Being is the common denominator of all existence.", "——Philosophy"],
    ["Existence precedes essence. You create your own essence through your choices.", "——Jean-Paul Sartre"],
    ["The unexamined life is not worth living.", "——Socrates"],
    ["To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", "——Ralph Waldo Emerson"]
];

// Time
const timeEN = [
    ["Time is the most valuable thing a man can spend.", "——Theophrastus"],
    ["Time is what we want most, but what we use worst.", "——William Penn"],
    ["The two most powerful warriors are patience and time.", "——Leo Tolstoy"],
    ["Time is a created thing. To say 'I don't have time' is to say 'I don't want to'.", "——Lao Tzu"],
    ["Time is the coin of your life. It is the only coin you have, and only you can determine how it will be spent.", "——Carl Sandburg"],
    ["The bad news is time flies. The good news is you're the pilot.", "——Michael Altshuler"],
    ["Time is the school in which we learn, time is the fire in which we burn.", "——Delmore Schwartz"],
    ["Time is a river that sweeps us along, but the soul remembers.", "——Philosophy"],
    ["The present moment is filled with joy and happiness. If you are attentive, you will see it.", "——Thich Nhat Hanh"],
    ["Time is a companion that goes with us on a journey.", "——Star Trek"],
    ["Yesterday is history, tomorrow is a mystery, today is a gift of God.", "——Bill Keane"],
    ["Time is the measure of things.", "——Aristotle"],
    ["Time is the father of truth.", "——French Proverb"],
    ["The only time we have is now.", "——Existentialism"],
    ["Time flies, but you're the pilot.", "——Life Wisdom"]
];

// Exhaustion
const exhaustionEN = [
    ["Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", "——Ralph Marston"],
    ["Almost everything will work again if you unplug it for a few minutes. Including you.", "——Anne Lamott"],
    ["The greatest weapon against stress is our ability to choose one thought over another.", "——William James"],
    ["Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", "——Oprah Winfrey"],
    ["Exhaustion is not a result of too much to do. It is the result of not stopping to be.", "——Unknown"],
    ["When you are tired, rest. Don't quit.", "——Life Wisdom"],
    ["Sometimes the most exhausted thing you can do is not sleep, but surrender.", "——Unknown"],
    ["The greatest gift you can give yourself is a little bit of peace.", "——Life Wisdom"],
    ["You don't have to be strong all the time. Letting down your guard doesn't make you weak.", "——Psychology"],
    ["Rest is not idleness, and to lie sometimes on the grass under trees is by no means a waste of time.", "——John Lubbock"],
    ["Tiredness is the body's way of telling you it needs rest.", "——Health"],
    ["The soul always knows what to do to heal itself. The challenge is to silence the mind.", "——Caroline Myss"],
    ["Let yourself be silently drawn by the strange pull of what you really love.", "——Rumi"],
    ["In the midst of movement and chaos, keep stillness inside of you.", "——Deepak Chopra"],
    ["Sometimes the most productive thing you can do is relax.", "——Mark Black"]
];

// Fresh Start
const freshStartEN = [
    ["Every day is a new beginning. Take a deep breath, smile, and start again.", "——Life Wisdom"],
    ["The only way to do great work is to love what you do. Or learn to love what you do.", "——Steve Jobs"],
    ["No matter how you feel, get up, dress up, and show up.", "——Life Wisdom"],
    ["New beginnings are often disguised as painful endings.", "——Lao Tzu"],
    ["The beginning is the most important part of the work.", "——Plato"],
    ["Every moment is a fresh beginning.", "——T.S. Eliot"],
    ["Begin somewhere. You cannot swim in new waters with old habits.", "——Unknown"],
    ["It is never too late to be what you might have been.", "——George Eliot"],
    ["The secret of change is to focus all of your energy not on fighting the old, but on building the new.", "——Socrates"],
    ["Today is the first day of the rest of your life.", "——Charles Dederich"],
    ["You are never too old to set another goal or to dream a new dream.", "——C.S. Lewis"],
    ["What seems to us as bitter trials are often blessings in disguise.", "——Oscar Wilde"],
    ["The universe is not punishment, not reward, but invitation to grow.", "——Philosophy"],
    ["Every day is a chance to see the world differently.", "——Life Wisdom"],
    ["Let go of who you think you're supposed to be; embrace who you are.", "——Brené Brown"]
];

// Loneliness
const lonelinessEN = [
    ["The greatest thing in the world is to know how to belong to oneself.", "——Michel de Montaigne"],
    ["Loneliness is the poverty of self; solitude is the richness of self.", "——May Sarton"],
    ["I restore myself when I'm alone.", "——Marilyn Monroe"],
    ["The soul that sees beauty may sometimes walk alone.", "——Johann Wolfgang von Goethe"],
    ["Loneliness is not a lack of people around you. It's a lack of purpose.", "——Unknown"],
    ["We are all alone in the end. But that's okay. We were never meant to be permanent.", "——Philosophy"],
    ["Solitude is fine but you need someone to tell that solitude is fine.", "——Konstantin Ji"],
    ["The loneliness you feel is actually an opportunity to reconnect with yourself.", "——Psychology"],
    ["You are not alone. You are never alone. You are with yourself.", "——Life Wisdom"],
    ["There's a difference between being alone and being lonely.", "——Literature"],
    ["The deepest fear we have is not that we are inadequate. It is that we are powerful beyond measure.", "——Brené Brown"],
    ["To live alone is one of the most courageous things a person can do.", "——Unknown"],
    ["Loneliness is the human condition. Cultivate it.", "——Janet Suleiman"],
    ["Your solitude is a gift. It allows you to grow.", "——Psychology"],
    ["The best remedy for loneliness is to be alone with your thoughts.", "——Literature"]
];

// Choice
const choiceEN = [
    ["Between stimulus and response there is a space. In that space is our power to choose.", "——Viktor Frankl"],
    ["It is in our choices that we show what we truly are.", "——J.K. Rowling"],
    ["The future belongs to those who believe in the beauty of their dreams.", "——Eleanor Roosevelt"],
    ["We are our choices.", "——Jean-Paul Sartre"],
    ["You can't go back and make a new start, but you can start now and make a new ending.", "——Dona Smith"],
    ["Every choice you make is a statement of who you are.", "——Life Wisdom"],
    ["The power to choose is yours. Use it wisely.", "——Philosophy"],
    ["When you come to a fork in the road, take it.", "——Yogi Berra"],
    ["You are free to choose, but you are not free from the consequences of your choices.", "——Philosophy"],
    ["Make choices that honor your values and your soul.", "——Psychology"],
    ["Your life is a result of the choices you have made.", "——Unknown"],
    ["There is no right or wrong, only different choices.", "——Life Wisdom"],
    ["The choices we make are ultimately our own responsibility.", "——Philosophy"],
    ["Choose to be optimistic, it feels better.", "——Dalai Lama"],
    ["The greatest gift you can give someone is the freedom to choose.", "——Unknown"]
];

// Self
const selfEN = [
    ["To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", "——Ralph Waldo Emerson"],
    ["Know thyself. This is the beginning of all wisdom.", "——Socrates"],
    ["The privilege of a lifetime is to become who you truly are.", "——Carl Jung"],
    ["To be yourself is everything that I can perhaps be.", "——David Wallace Foster"],
    ["Who you are is defined by what you're willing to struggle for.", "——Mark Manson"],
    ["Your vision will become clear only when you look into your heart.", "——Carl Jung"],
    ["The most terrifying thing is to accept oneself completely.", "——Carl Jung"],
    ["One does not become a self by turning away from one's world but by turning toward it.", "——Paul Tillich"],
    ["I am not what happened to me. I am what I choose to become.", "——Carl Jung"],
    ["The self is not something that exists ready-made in advance. It is something that is constituted through one's activities.", "——Jean-Paul Sartre"],
    ["Become who you are.", "——Friedrich Nietzsche"],
    ["The self is that which can be designated as the identity of a person.", "——Philosophy"],
    ["You are not a drop in the ocean. You are the entire ocean in a drop.", "——Rumi"],
    ["The greatest discovery of my generation is that a human being can alter his life by altering his attitudes.", "——William James"],
    ["You are already everything you are trying to become.", "——Psychology"]
];

// Hope
const hopeEN = [
    ["Hope is being able to see that there is light despite all of the darkness.", "——Desmond Tutu"],
    ["We must accept finite disappointment, but never lose infinite hope.", "——Martin Luther King Jr."],
    ["Hope is the thing with feathers that perches in the soul.", "——Emily Dickinson"],
    ["In the middle of difficulty lies opportunity.", "——Albert Einstein"],
    ["The best way to not feel hopeless is to get up and do something.", "——Barack Obama"],
    ["Hope is the companion of power, and power is the companion of hope.", "——Milton"],
    ["Hope is the last thing ever lost.", "——Italian Proverb"],
    ["Once you choose hope, anything is possible.", "——Christopher Reeve"],
    ["Hope is not a dream but a way of making dreams become reality.", "——Victor Hugo"],
    ["We must look at the light at the end of the tunnel, not just the darkness at the beginning.", "——Life Wisdom"],
    ["Where there is hope, there is life.", "——Literature"],
    ["Hope is a waking dream.", "——Aristotle"],
    ["Hope is the anchor of the soul.", "——Literature"],
    ["There is no medicine like hope.", "——Orison Marden"],
    ["Even the darkest night will end and the sun will rise.", "——Victor Hugo"]
];

// Waiting
const waitingEN = [
    ["Patience is not the ability to wait, but the ability to keep a good attitude while working.", "——Unknown"],
    ["Some things are not going to happen no matter how badly you want them to.", "——Unknown"],
    ["The two hardest tests in life are the ability to begin and the ability to persist.", "——Unknown"],
    ["Wait for the opportunity that matches your purpose.", "——Life Wisdom"],
    ["Be patient. Good things take time.", "——Life Wisdom"],
    ["Sometimes waiting is the best thing you can do.", "——Literature"],
    ["Not everything that is faced can be changed, but nothing can be changed until it is faced.", "——James Baldwin"],
    ["The waiting is the hardest part.", "——Tom Petty"],
    ["Patience is bitter, but its fruit is sweet.", "——Aristotle"],
    ["He who waits, often wins.", "——Spanish Proverb"],
    ["Sometimes good things fall apart so better things can fall together.", "——Marilyn Monroe"],
    ["If you want to be happy, be patient.", "——Leo Tolstoy"],
    ["Adopt the pace of nature: her secret is patience.", "——Ralph Waldo Emerson"],
    ["Waiting is not a sign of weakness. It is a sign of strength.", "——Psychology"],
    ["The best is yet to come.", "——Life Wisdom"]
];

// Growth
const growthEN = [
    ["We do not learn from experience; we learn from reflecting on experience.", "——John Dewey"],
    ["Growth begins when we start to accept our own weakness.", "——Jean Vanier"],
    ["The greatest glory in living lies not in never falling, but in rising every time we fall.", "——Nelson Mandela"],
    ["Personal growth is not a matter of new information. It is a matter of new experience.", "——Unknown"],
    ["Growth is never by mere chance; it is the result of forces working together.", "——James Cash Penney"],
    ["You grow stronger every time you fall.", "——Life Wisdom"],
    ["The only person you are destined to become is the person you decide to be.", "——Ralph Waldo Emerson"],
    ["Change is the end result of all true growth.", "——Unknown"],
    ["Growth is not about becoming someone else. It's about becoming more yourself.", "——Psychology"],
    ["In the middle of difficulty lies opportunity.", "——Albert Einstein"],
    ["The bamboo that bends is stronger than the oak that resists.", "——Japanese Proverb"],
    ["Every setback is a setup for a comeback.", "——Life Wisdom"],
    ["You are growing every day. Even when you don't see it.", "——Psychology"],
    ["Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.", "——Unknown"],
    ["The seed buried in the ground must decompose before the plant can grow.", "——Literature"]
];

// Loss
const lossEN = [
    ["Grief is the price we pay for love.", "——Queen Elizabeth II"],
    ["What we have once enjoyed we can never lose. All that we love deeply becomes a part of us.", "——Helen Keller"],
    ["The risk of loving is losing. The risk of not loving is never truly living.", "——Unknown"],
    ["Loss is nothing else but change, and change is Nature's delight.", "——Marcus Aurelius"],
    ["When you are sorrowful, look again at your heart, and you shall see that in truth you are weeping for that which has been your delight.", "——Kahlil Gibran"],
    ["There is a sacredness in tears. They are not the mark of weakness, but of power.", "——Washington Irving"],
    ["The wound is the place where the Light enters you.", "——Rumi"],
    ["No one ever truly dies as long as someone remembers them.", "——Literature"],
    ["Loss is the teacher that shows us the value of what we have.", "——Psychology"],
    ["In the face of loss, we find strength.", "——Life Wisdom"],
    ["Every ending is a new beginning.", "——Life Wisdom"],
    ["Loss does not make us less. It reveals who we truly are.", "——Literature"],
    ["Those we love don't go away, they walk beside us every day.", "——Unknown"],
    ["The only way out is through.", "——Robert Frost"],
    ["After a storm comes a rainbow.", "——Life Wisdom"]
];

// Courage
const courageEN = [
    ["Courage is not the absence of fear, but rather the judgment that something else is more important than fear.", "——Ambrose Redmoon"],
    ["It takes courage to grow up and become who you really are.", "——E.E. Cummings"],
    ["Courage is the most important of all the virtues because without courage, you can't practice any other virtue consistently.", "——Maya Angelou"],
    ["You cannot swim for new horizons until first you have courage to lose sight of the shore.", "——William Faulkner"],
    ["Courage is resistance to fear, mastery of fear — not absence of fear.", "——Mark Twain"],
    ["Life shrinks or expands in proportion to one's courage.", "——Anais Nin"],
    ["Courage is the capacity to go from one failure to another without losing enthusiasm.", "——Winston Churchill"],
    ["Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.", "——Lao Tzu"],
    ["Have the courage to follow your heart and intuition.", "——Steve Jobs"],
    ["Courage is what it takes to stand up and speak; courage is also what it takes to sit down and listen.", "——Winston Churchill"],
    ["You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.", "——Eleanor Roosevelt"],
    ["Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'", "——Mary Anne Radmacher"],
    ["It is not the strength of the body that counts, but the strength of the spirit.", "——Unknown"],
    ["Fear is a reaction. Courage is a decision.", "——Life Wisdom"],
    ["Courage is the price that Life extracts for granting peace.", "——Amelia Earhart"]
];

// Daily Life
const dailyEN = [
    ["The art of living is more like wrestling than dancing.", "——Marcus Aurelius"],
    ["Life is what happens when you're busy making other plans.", "——John Lennon"],
    ["Enjoy the little things, for one day you may look back and realize they were the big things.", "——Robert Brault"],
    ["The present moment is the only moment available to us, and it is the door to all moments.", "——Thich Nhat Hanh"],
    ["One day in the life is better than no day in the life.", "——Unknown"],
    ["How we spend our days is, of course, how we spend our lives.", "——Annie Dillard"],
    ["Life is available only in the present moment.", "——Thich Nhat Hanh"],
    ["The biggest adventure you can take is to live the life of your dreams.", "——Oprah Winfrey"],
    ["Life is not about finding yourself. Life is about creating yourself.", "——George Bernard Shaw"],
    ["Life is a journey, not a destination.", "——Ralph Waldo Emerson"],
    ["The purpose of life is not to be happy. It is to be useful.", "——Ralph Waldo Emerson"],
    ["Life is not perfect, but it can be beautiful.", "——Life Wisdom"],
    ["Make your life a masterpiece.", "——Life Wisdom"],
    ["Life is short, and it is up to you to make it sweet.", "——Sarah Louise Delany"],
    ["Every day may not be good, but there is good in every day.", "——Alice Morse Earle"]
];

// Breath
const breathEN = [
    ["Breathing is the greatest pleasure in life.", "——Giovanni Papini"],
    ["Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", "——Thich Nhat Hanh"],
    ["Breath is the bridge which connects life to consciousness.", "——Thich Nhat Hanh"],
    ["When you own your breath, nobody can steal your peace.", "——Unknown"],
    ["The mind and body are not separate. What affects one, affects the other. Breath is the bridge.", "——Psychology"],
    ["With every breath, you are either dying or living.", "——Life Wisdom"],
    ["The breath is the string, and your life is the music.", "——Literature"],
    ["Breathe deeply. You are alive.", "——Thich Nhat Hanh"],
    ["One conscious breath in and out is a meditation.", "—— Eckhart Tolle"],
    ["The moment you take a deep breath, you are in your body again.", "——Psychology"],
    ["Breathing is the foundation of everything we do.", "——Life Wisdom"],
    ["Inhale the future, exhale the past.", "——Unknown"],
    ["The present moment is always at your fingertips.", "——Life Wisdom"],
    ["Your breath is your anchor. It keeps you grounded in the present.", "——Psychology"],
    ["Take a deep breath. It's just a bad day, not a bad life.", "——Life Wisdom"]
];

// Tomorrow
const tomorrowEN = [
    ["Tomorrow is another day.", "——Margaret Mitchell, Gone with the Wind"],
    ["The best way to predict the future is to create it.", "——Peter Drucker"],
    ["Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.", "——Mother Teresa"],
    ["Hope smiles from the threshold of the year to come, whispering 'it will be happier'.", "——Alfred Tennyson"],
    ["Tomorrow never comes. Live for today.", "——Life Wisdom"],
    ["Every tomorrow has two handles. We can take hold of it by the handle of anxiety or by the handle of faith.", "——Henry Ward Beecher"],
    ["The only way to have a better tomorrow is to do something today.", "——Unknown"],
    ["Be content with what you have; rejoice in the way things are.", "——Lao Tzu"],
    ["What lies behind us and what lies before us are tiny matters compared to what lies within us.", "——Ralph Waldo Emerson"],
    ["Tomorrow is the thing we are never sure of. That is why it is called tomorrow.", "——Unknown"],
    ["Each day holds a surprise. But only if we expect it can we see, hear, or feel it in advance.", "——Issey Miyake"],
    ["Never stop believing in tomorrow.", "——Life Wisdom"],
    ["Today's accomplishments are tomorrow's foundation.", "——Unknown"],
    ["Each morning we are born again. What we do today matters most.", "——Buddha"],
    ["The future belongs to those who believe in the beauty of their dreams.", "——Eleanor Roosevelt"]
];

// Boundaries
const boundaryEN = [
    ["Daring to set limits is essential to mental health.", "——Psychology"],
    ["Boundaries are not walls to keep people out, but fences to protect the garden within.", "——Unknown"],
    ["Healthy boundaries make healthy relationships.", "——Psychology"],
    ["Saying no is a complete sentence.", "——Life Wisdom"],
    ["You teach others how to treat you by what you allow, what you stop, and what you resist.", "——Unknown"],
    ["Personal boundaries are the limits we set to protect ourselves from being manipulated.", "——Psychology"],
    ["Respect your own boundaries. Others will follow your lead.", "——Unknown"],
    ["The boundary between self and other is where the self begins.", "——Philosophy"],
    ["Knowing your limits is wisdom. Working within them is strength.", "——Unknown"],
    ["Boundaries are not about pushing people away. They are about protecting what matters.", "——Psychology"],
    ["Your life is yours. Your boundaries are yours.", "——Life Wisdom"],
    ["We are responsible for ourselves and for setting appropriate boundaries.", "——Philosophy"],
    ["The quality of our life depends on the quality of our boundaries.", "——Psychology"],
    ["Define your own boundaries or others will define them for you.", "——Unknown"],
    ["The greatest act of self-love is knowing when to say no.", "——Life Wisdom"]
];

// Freedom
const freedomEN = [
    ["Freedom is what we do with what is done to us.", "——Jean-Paul Sartre"],
    ["The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", "——Albert Camus"],
    ["Freedom is not the absence of obligations. It is the ability to choose what we value.", "——Philosophy"],
    ["The greatest gift you can give someone is your freedom.", "——Unknown"],
    ["Liberty is not the power of doing what we like, but the right to do what we ought.", "——John Stuart Mill"],
    ["Freedom is not the absence of commitment, but the ability to choose and commit to something greater.", "——Unknown"],
    ["Freedom is the open window through which pours the sunlight of the human spirit and human intellect.", "——Herbert Hoover"],
    ["The secret of happiness is freedom, the secret of freedom is courage.", "——Carrie Jones"],
    ["Freedom is not a state. It is an act of will.", "——John Stuart Mill"],
    ["You are only as free as you feel.", "——Unknown"],
    ["The human spirit is stronger than anything that can happen to it.", "——C.C. Scott"],
    ["Freedom lies in being bold.", "——Robert Frost"],
    ["The highest result of education is tolerance.", "——Helen Keller"],
    ["Freedom is the right to live as we wish.", "——Epictetus"],
    ["Those who deny freedom to others deserve it not for themselves.", "——Abraham Lincoln"]
];

// Gentleness
const gentlenessEN = [
    ["Gentleness is the bravest form of love.", "——Unknown"],
    ["Tender grass grows after harsh winter.", "——Life Wisdom"],
    ["Be gentle with yourself. You are doing the best you can.", "——Psychology"],
    ["The gentle word brings warmth to a cold day.", "——Unknown"],
    ["Gently is the only way to handle a living soul.", "——Vivian Greene"],
    ["Kindness is the light that dissolves all shadows of suspicion and distrust.", "——Khalil Gibran"],
    ["Tenderness and kindness are not signs of weakness but of strength.", "——Mahatma Gandhi"],
    ["The world belongs to those who let go of the past.", "——Unknown"],
    ["To be tender with the present, we must be gentle with ourselves.", "——Psychology"],
    ["A gentle hand can guide even the hardest heart.", "——Unknown"],
    ["Softness is the greatest strength.", "——Philosophy"],
    ["Gentleness is a great virtue.", "——Unknown"],
    ["Be kind, for everyone you meet is fighting a hard battle.", "——Philo"],
    ["The gentle warrior wins without bloodshed.", "——Chinese Proverb"],
    ["Take it easy. Let life flow gently.", "——Life Wisdom"]
];

// Change
const changeEN = [
    ["The only thing constant in life is change.", "——Heraclitus"],
    ["If you don't like something, change it. If you can't change it, change your attitude.", "——Maya Angelou"],
    ["Be the change you wish to see in the world.", "——Mahatma Gandhi"],
    ["Change your thoughts and you change your world.", "——Norman Vincent Peale"],
    ["It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.", "——Charles Darwin"],
    ["We cannot change our past. We can change the story we tell ourselves about it.", "——Psychology"],
    ["Every act of conscious creation requires us to be in a state of constant transformation.", "——Unknown"],
    ["The snake which cannot cast its skin has to die.", "——Friedrich Nietzsche"],
    ["Life is a journey, not a destination. Things change.", "——Ralph Waldo Emerson"],
    ["Change is inevitable. Growth is optional.", "——Unknown"],
    ["You must be the change you wish to see in the world.", "——Gandhi"],
    ["To improve is to change; to be perfect is to change often.", "——Winston Churchill"],
    ["The secret of change is to focus all of your energy not on fighting the old, but on building the new.", "——Socrates"],
    ["Transformation is not a future state but a present one.", "——Unknown"],
    ["What you are is what you have been. What you'll be is what you do now.", "——Buddha"]
];

// Persistence
const persistenceEN = [
    ["It does not matter how slowly you go as long as you do not stop.", "——Confucius"],
    ["The only impossible journey is the one you never begin.", "——Tony Robbins"],
    ["Perseverance is not a long race; it is many short races one after the other.", "——Walter Elliot"],
    ["Never give in, never give in, never, never, never.", "——Winston Churchill"],
    ["The road to success is dotted with many tempting parking places.", "——Unknown"],
    ["Most of the important things in the world have been accomplished by people who have kept on trying when there seemed to be no hope at all.", "——Dale Carnegie"],
    ["When everything seems to be going against you, remember that the airplane takes off against the wind.", "——Henry Ford"],
    ["Our greatest weakness lies in giving up. The most certain way to succeed is to try just one more time.", "——Thomas Edison"],
    ["I have not failed. I've just found 10,000 ways that won't work.", "——Thomas Edison"],
    ["Fall seven times, stand up eight.", "——Japanese Proverb"],
    ["You may encounter many defeats; you must not be defeated.", "——Maya Angelou"],
    ["It always seems impossible until it's done.", "——Nelson Mandela"],
    ["Courage is not having the strength to go on; it is going on when you don't have the strength.", "——Theodore Roosevelt"],
    ["Persistence guarantees that results are inevitable.", "——Unknown"],
    ["Don't stop when you're tired. Stop when you're done.", "——Life Wisdom"]
];

// 组合所有英文内容
[...existenceEN, ...timeEN, ...exhaustionEN, ...freshStartEN,
 ...lonelinessEN, ...choiceEN, ...selfEN, ...hopeEN,
 ...waitingEN, ...growthEN, ...lossEN, ...courageEN,
 ...dailyEN, ...breathEN, ...tomorrowEN, ...boundaryEN,
 ...freedomEN, ...gentlenessEN, ...changeEN, ...persistenceEN]
.forEach(q => content.push({ story: q[0], source: q[1] }));

// 补充更多英文内容
const extraEnglish = [
    ["The wound is the place where the Light enters you.", "——Rumi"],
    ["In the depth of winter, I finally learned that within me there lay an invincible summer.", "——Albert Camus"],
    ["What lies behind us and what lies before us are tiny matters compared to what lies within us.", "——Ralph Waldo Emerson"],
    ["The only journey is the one within.", "——Rainer Maria Rilke"],
    ["One cannot think well, love well, sleep well, if one has not dined well.", "——Virginia Woolf"],
    ["To dare is to lose one's footing momentarily. To not dare is to lose oneself.", "——Søren Kierkegaard"],
    ["Life appears to me too short to be spent in nursing animosity or registering wrongs.", "——Charlotte Brontë"],
    ["We are all like the bright moon, we shine even when we are not full.", "——Rumi"],
    ["The art of knowing yourself is the beginning of wisdom.", "——Socrates"],
    ["When I let go of what I am, I become what I might be.", "——Lao Tzu"],
    ["Nothing in life is to be feared, it is only to be understood.", "——Marie Curie"],
    ["The only thing we have to fear is fear itself.", "——Franklin D. Roosevelt"],
    ["To love oneself is the beginning of a lifelong romance.", "——Oscar Wilde"],
    ["Happiness is not something ready made. It comes from your own actions.", "——Dalai Lama"],
    ["If you want to lift yourself up, lift up someone else.", "——Booker T. Washington"],
    ["It is during our darkest moments that we must focus to see the light.", "——Aristotle"],
    ["The mind is everything. What you think you become.", "——Buddha"],
    ["Love all, trust a few, do wrong to none.", "——William Shakespeare"],
    ["Two roads diverged in a wood, and I— I took the one less traveled by.", "——Robert Frost"],
    ["Not all those who wander are lost.", "——J.R.R. Tolkien"],
    ["The only way to do great work is to love what you do.", "——Steve Jobs"],
    ["Believe you can and you're halfway there.", "——Theodore Roosevelt"],
    ["It is during our darkest moments that we must focus to see the light.", "——Aristotle"],
    ["The future belongs to those who believe in the beauty of their dreams.", "——Eleanor Roosevelt"],
    ["You miss 100% of the shots you don't take.", "——Wayne Gretzky"],
    ["Whether you think you can or you think you can't, you're right.", "——Henry Ford"],
    ["I have learned over the years that when one's mind is made up, this diminishes fear.", "——Rosa Parks"],
    ["Success is not final, failure is not fatal: it is the courage to continue that counts.", "——Winston Churchill"],
    ["Your time is limited, don't waste it living someone else's life.", "——Steve Jobs"],
    ["The best time to plant a tree was 20 years ago. The second best time is now.", "——Chinese Proverb"],
    ["Your limitation—it's just your imagination.", "——Life Wisdom"],
    ["Push yourself, because no one else is going to do it for you.", "——Unknown"],
    ["Great things never come from comfort zones.", "——Unknown"],
    ["Dream it. Wish it. Do it.", "——Unknown"],
    ["Success doesn't just find you. You have to go out and get it.", "——Unknown"],
    ["The harder you work for something, the greater you'll feel when you achieve it.", "——Unknown"],
    ["Don't stop when you're tired. Stop when you're done.", "——Unknown"],
    ["Wake up with determination. Go to bed with satisfaction.", "——Unknown"],
    ["Little things make big days.", "——Unknown"],
    ["It's going to be hard, but hard does not mean impossible.", "——Unknown"],
    ["Don't wait for opportunity. Create it.", "——Unknown"],
    ["Sometimes we're tested not to show our weaknesses, but to discover our strengths.", "——Unknown"],
    ["The key to success is to focus on goals, not obstacles.", "——Unknown"],
    ["Dream bigger. Do bigger.", "——Unknown"],
    ["Do something today that your future self will thank you for.", "——Unknown"],
    ["You are capable of more than you know.", "——Psychology"],
    ["Be stronger than your excuses.", "——Unknown"],
    ["The only limit is your mind.", "——Unknown"],
    ["Make today so awesome that yesterday gets jealous.", "——Unknown"],
    ["You are enough just as you are.", "——Brené Brown"],
    ["Self-care is not selfish. You cannot serve from an empty vessel.", "——Eleanor Brown"],
    ["Talk to yourself like you would to someone you love.", "——Brené Brown"],
    ["You are worthy of good things.", "——Life Wisdom"],
    ["Your feelings are valid.", "——Psychology"],
    ["Progress, not perfection.", "——Unknown"],
    ["Be patient with yourself.", "——Unknown"],
    ["You are doing better than you think.", "——Life Wisdom"],
    ["It's okay to not be okay.", "——Psychology"],
    ["Healing is not linear.", "——Unknown"],
    ["You don't have to have it all figured out.", "——Unknown"],
    ["Your journey is valid.", "——Unknown"],
    ["Be kind to yourself.", "——Unknown"],
    ["You deserve love and belonging.", "——Brené Brown"],
    ["Comparison is the thief of joy.", "——Theodore Roosevelt"],
    ["You are enough exactly as you are.", "——Unknown"],
    ["Every emotion you feel, everything you think, and everything you do is who you are.", "——Unknown"],
    ["Be yourself. Everyone else is already taken.", "——Oscar Wilde"],
    ["To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", "——Ralph Waldo Emerson"],
    ["You are under no obligation to be the same person you were five minutes ago.", "——Unknown"],
    ["Your authenticity is your superpower.", "——Unknown"],
    ["Don't let anyone dull your sparkle.", "——Unknown"],
    ["What you are is enough.", "——Unknown"],
    ["You are braver than you believe, stronger than you seem, and smarter than you think.", "——A.A. Milne"],
    ["Believe in yourself. You are more powerful than you think.", "——Unknown"],
    ["Your voice matters.", "——Unknown"],
    ["You belong here.", "——Unknown"],
    ["You have a purpose.", "——Unknown"],
    ["Your story matters.", "——Unknown"],
    ["You are worthy.", "——Unknown"],
    ["The world needs what you have.", "——Unknown"],
    ["Your presence matters.", "——Unknown"],
    ["You are making a difference.", "——Unknown"],
    ["You are not alone in this.", "——Unknown"],
    ["Tomorrow is a new day with new possibilities.", "——Unknown"],
    ["This too shall pass.", "——Persian Proverb"],
    ["After every storm comes the sun.", "——Unknown"],
    ["The night is darkest just before dawn.", "——Unknown"],
    ["Every cloud has a silver lining.", "——Unknown"],
    ["When one door closes, another opens.", "——Unknown"],
    ["Difficult roads often lead to beautiful destinations.", "——Unknown"],
    ["The best is yet to come.", "——Unknown"],
    ["You're doing great. Keep going.", "——Unknown"],
    ["One step at a time.", "——Unknown"],
    ["Progress, not perfection.", "——Unknown"],
    ["You've got this.", "——Unknown"],
    ["Keep your head up.", "——Unknown"],
    ["Stay positive.", "——Unknown"],
    ["You've overcome so much.", "——Unknown"],
    ["This is temporary.", "——Unknown"],
    ["You are stronger than you know.", "——Unknown"],
    ["Tomorrow is a fresh start.", "——Unknown"],
    ["Be gentle with yourself today.", "——Unknown"],
    ["You are doing enough.", "——Unknown"]
];

extraEnglish.forEach(q => content.push({ story: q[0], source: q[1] }));

return content;
}

// 获取当前语言的内容池
function getCurrentContent() {
    switch(state.language) {
        case 'zh':
            return [...chineseContent];
        case 'en':
            return [...englishContent];
        case 'both':
            // 随机混合中英文内容
            const combined = [...chineseContent, ...englishContent];
            // 打乱顺序
            for (let i = combined.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [combined[i], combined[j]] = [combined[j], combined[i]];
            }
            return combined;
        default:
            return [...chineseContent];
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
    // Fisher-Yates shuffle
    for (let i = state.contentPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.contentPool[i], state.contentPool[j]] = [state.contentPool[j], state.contentPool[i]];
    }
    state.currentIndex = 0;
}

// Show current content
function showCurrentContent(direction = null) {
    const content = state.contentPool[state.currentIndex];
    mainMessage.textContent = content.story;
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
