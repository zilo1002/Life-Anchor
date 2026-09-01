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
    touchEndX: 0
};

// Audio Context
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

// Sound Generators
const sounds = {
    // 水滴声 - 清脆、纯净
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

    // 轻柔点击
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

    // 机械红轴 - 低沉、浑厚
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

    // 机械青轴 - 清脆、有click声
    'mechanical-blue': () => {
        const ctx = getAudioCtx();
        // Click声
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

        // Bottom 声
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

    // 机械茶轴 - 中等、柔和
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

    // 静音红轴 - 很轻、几乎无声
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

    // 风铃
    bell: () => {
        const ctx = getAudioCtx();
        const frequencies = [1046.5, 1318.5, 1568, 2093]; // C6, E6, G6, C7
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

// Content Library - 1000 Philosophical Stories & Wisdom
const philosophicalStories = generateContent();

function generateContent() {
    const content = [];

// ========== 哲学思想 (1-150) ==========

// 存在主义
const existentialQuotes = [
    ["加缪说：「真正严肃的哲学问题只有一个——自杀。」然而，西西弗斯推石上山本身，就是对荒谬最好的反抗。你在此刻的存在，已经是一种勇气。", "——《西西弗斯神话》阿尔贝·加缪"],
    ["萨特说：「存在先于本质。」你没有被赋予意义，你创造意义。你现在的迷茫，正是你在创造意义的证明。", "——《存在与虚无》萨特"],
    ["海德格尔说：「人是被抛入世界的。」但被抛入不是终点——你如何面对被抛入的状态，才是你真正的存在。", "——《存在与时间》海德格尔"],
    ["克尔凯郭尔说：「焦虑是自由的眩晕。」你感到迷茫，是因为你有选择的自由。这份自由，是生命给你的礼物。", "——《焦虑的概念》克尔凯郭尔"],
    ["雅斯贝尔斯说：「人类始终能够从深渊中救出自己。」深渊不是终点，而是觉醒的起点。", "——《时代的的精神状况》雅斯贝尔斯"],
    ["萨特说：「人是注定的自由。」无论你的处境如何，你永远有选择面对方式的权利。", "——《存在与虚无》萨特"],
    ["海德格尔说：「向死而生。」正因为生命有限，每一个当下才如此珍贵。", "——《存在与时间》海德格尔"],
    ["加缪说：「我不是在说服人。我只是想要告诉他们：如果他们愿意，他们可以摆脱。」你永远可以选择。", "——《局外人》阿尔贝·加缪"],
    ["萨特说：「人被判定为自由的。」这份自由沉重，但也是你最大的力量。", "——《存在与虚无》萨特"],
    ["雅斯贝尔斯说：「人的伟大，在于他知道自己会死。」知道终点，才能真正开始。", "——《普通精神病理學》雅斯贝尔斯"]
];

// 东方哲学
const easternQuotes = [
    ["庄周梦蝶，不知周之梦为蝴蝶与？当你凝视深渊时，深渊也在凝视你。但请记住：你是那个正在做梦的蝴蝶。", "——《庄子·齐物论》"],
    ["王阳明说：「你未看此花时，此花与汝心同归于寂。」世界的意义，因你看见而存在。你的心，就是整个宇宙的镜子。", "——《传习录》王阳明"],
    ["老子说：「知人者智，自知者明。」迷茫不是软弱，而是你正在叩问自己真正是谁。这份追问本身，就是智慧的开始。", "——《道德经》老子"],
    ["佛说：「一切众生皆具如来智慧德相。」你的本质不是迷茫，而是光明。迷茫只是暂时的云雾，太阳一直都在。", "——《华严经》"],
    ["悉达多走过享乐、权力、财富，最终在河边悟道：「智慧无法言传。」但他还说：「知识可以传递，智慧不能。」你正在积攒智慧。", "——《悉达多》赫尔曼·黑塞"],
    ["禅宗说：「吃饭时吃饭，睡觉时睡觉。」活在当下，是最深的修行。你此刻的呼吸，就是最好的证明。", "——《禅宗语录》"],
    ["孔子说：「未知生，焉知死。」但反过来也一样——理解死亡，才能更好地活着。你正在学习如何活。", "——《论语》孔子"],
    ["庄子说：「天地与我并生，而万物与我为一。」你不是孤独的，你与整个宇宙相连。", "——《庄子·齐物论》"],
    ["王阳明龙场悟道：「圣人之道，吾性自足。」你内在的力量，比你想象的更大。", "——《传习录》王阳明"],
    ["老子说：「为学日益，为道日损。」放下越多，得到越多。你已经学会了放下。", "——《道德经》老子"],
    ["佛说：「放下屠刀，立地成佛。」那把屠刀，可以是执念、比较、遗憾。放下它们，你就是佛。", "——《金刚经》"],
    ["慧能说：「本来无一物，何处惹尘埃。」你的心本来清净，烦恼只是暂时的云。", "——《六祖坛经》慧能"],
    ["庄子说：「人莫鉴于流水，而鉴于止水。」当你静下来，答案会自然浮现。", "——《庄子·德充符》"],
    ["子思说：「喜怒哀乐之未发，谓之中；发而皆中节，谓之和。」接受你的情绪，它们是你的一部分。", "——《中庸》"],
    ["阳明先生说：「知行合一。」知道和做到之间，是你的勇气在连接它们。", "——《传习录》王阳明"]
];

// 西方古典哲学
const westernClassical = [
    ["苏格拉底临终时说：「我们该走的路，不是逃避死亡，而是避免作恶。」活着，去追寻什么是善，这就是你存在的使命。", "——柏拉图《斐多》"],
    ["柏拉图的洞穴里，那些囚徒以为影子就是真实。但你选择了转身，寻找光源。这份觉醒的渴望，是你灵魂的证明。", "——《理想国》柏拉图"],
    ["苏格拉底说：「我唯一知道的，就是我一无所知。」这份谦逊，是智慧的开始。", "——柏拉图《申辩篇》"],
    ["亚里士多德说：「人是被称为城邦的动物。」你属于某个地方，你被需要。", "——《政治学》亚里士多德"],
    ["柏拉图说：「智慧意味着勇敢。」你已经展示了你的勇气。", "——《理想国》柏拉图"],
    ["苏格拉底说：「未经审视的人生不值得过。」你正在审视，这就是哲学的开始。", "——柏拉图《申辩篇》"],
    ["亚里士多德说：「幸福是生命的意义和目的。」你活着，就是在追寻幸福。", "——《尼各马可伦理学》"],
    ["柏拉图说：「美是永恒的。」你的存在本身就是一种美。", "——《会饮篇》柏拉图"],
    ["亚里士多德说：「人是理性的动物。」你此刻的思考，就是理性的证明。", "——《政治学》"],
    ["西塞罗说：「哲学是对死亡的研究。」当你理解死亡，你才真正理解生命。", "——《图斯库卢姆谈话录》"]
];

// 现代哲学
const modernPhilosophy = [
    ["尼采说：「当你凝视深渊时，深渊也在凝视你。」但他还说过：「凡杀不死我的，必使我更强大。」深渊之下，是更深的觉醒。", "——《善恶的彼岸》尼采"],
    ["尼采说：「那杀不死我的，使我更强大。」你正在变得更强。", "——《偶像的黄昏》尼采"],
    ["尼采说：「所有伟大的思想都是在散步时产生的。」也许你需要的只是一次散步，一个呼吸的空间。", "——《偶像的黄昏》尼采"],
    ["维特根斯坦说：「世界的意义在世界之外。」意义不在某个遥远的地方等着你，它在你活着的过程里，一点点显现。", "——《逻辑哲学论》维特根斯坦"],
    ["维特根斯坦说：「一个人能够遵守规则，不是因为他理解了规则，而是因为他照着做。」有时候，行动先于理解。", "——《哲学研究》维特根斯坦"],
    ["康德说：「有两样东西，我愈是沉思愈觉得敬畏——头顶的星空和心中的道德律。」你此刻能思考这一切，本身就是宇宙的奇迹。", "——《实践理性批判》康德"],
    ["康德说：「自由不是你想做什么就做什么，而是你想不做什么就不做什么。」你拥有这份自由。", "——《实践理性批判》康德"],
    ["胡塞尔说：「回到事物本身。」不要向外寻找答案，向内看，你已经拥有一切。", "——《纯粹现象学通论》胡塞尔"],
    ["维特根斯坦说：「死亡不是事件。」它只是生命的边界。你此刻在边界之内，这就是全部。", "——《逻辑哲学论》"],
    ["尼采说：「必须在热爱自己之前先了解自己。」你在了解自己，这是一切美好的开始。", "——《查拉图斯特拉如是说》"]
];

// ========== 文学经典 (151-350) ==========

// 中国文学
const chineseLiterature = [
    ["小王子说：「你为你的玫瑰花费的时间，使你的玫瑰变得如此重要。」你活着本身就是意义，因为你定义了它。", "——《小王子》圣·埃克苏佩里"],
    ["史铁生说：「人不是苟活，是选择活着。」在最艰难的时刻，他选择了轮椅上的写作，用文字接住了无数人。", "——《我与地坛》史铁生"],
    ["余华说：「人是为活着本身而活着，而不是为了活着之外的任何事物所活着。」活着本身就是意义。", "——《活着》余华"],
    ["王小波说：「我活在世上，无非想要明白些道理，遇见些有趣的事。」你在寻找意义，这本身就是有趣的。", "——《沉默的大多数》"],
    ["三毛说：「如果有来生，要做一棵树，站成永恒。」即使此刻是痛苦的，也是生命的一部分。", "——《说给自己听》三毛"],
    ["林清玄说：「以清净心看世界，以欢喜心过生活。」你拥有这颗清净心。", "——《心有欢喜》林清玄"],
    ["丰子恺说：「你若爱，生活哪里都可爱。」世界没有变，是你看待世界的眼睛变了。", "——《缘缘堂随笔》"],
    ["朱光潜说：「生命是一个整体，痛苦和幸福是交织在一起的。」你没有错过任何一部分。", "——《谈美》朱光潜"],
    ["梁实秋说：「人生的路途，你说它是蔷薇也好，你说它是荆棘也好，只要你肯走下去，它都是你的路。」", "——《雅舍小品》"],
    ["沈从文说：「一个人记得事情太多真不幸，知道事情太多也不幸，体会到事情太多也不幸。」但你的体会是财富。", "——《边城》沈从文"],
    ["张爱玲说：「因为懂得，所以慈悲。」你懂得自己的痛苦，这是慈悲的开始。", "——《红玫瑰与白玫瑰》"],
    ["鲁迅说：「希望是附丽于存在的，有存在，便有希望，有希望，便是光明。」你存在，所以你有希望。", "——《华盖集续编》"],
    ["老舍说：「生活是种律动，须有光有影，有左有右，有晴有雨。」你的生活正在律动。", "——《骆驼祥子》"],
    ["巴金说：「人不是单为了吃米活着的。」你活着，是为了比米更重要的东西。", "——《随想录》"],
    ["钱钟书说：「婚姻是一座围城，城外的人想进去，城里的人想出来。」但你还在城外，你有选择。", "——《围城》钱钟书"],
    ["杨绛说：「我们曾如此期盼外界的认可，到最后才知道，世界是自己的，与他人毫无关系。」你的人生是你自己的。", "——《走到人生边上》"],
    ["莫言说：「世事犹如书籍，一页页被翻过去。」翻过这一页，新的篇章在等你。", "——《生死疲劳》莫言"],
    ["刘震云说：「世界上不存在大不了的事，也没有过不去的坎。」时间会治愈一切。", "——《一句顶一万句》"],
    ["路遥说：「生活不能等待别人来安排，要自己去争取和奋斗。」你正在争取和奋斗。", "——《平凡的世界》"],
    ["贾平凹说：「真正的痛苦不是哭，真正的强大也不是不哭。」允许自己软弱，才是真正的强大。", "——《浮躁》"]
];

// 外国文学
const foreignLiterature = [
    ["海明威说：「人可以被毁灭，但不能被打败。」你没有被毁灭，你还在战斗。", "——《老人与海》海明威"],
    ["托尔斯泰说：「幸福的家庭都是相似的，不幸的家庭各有各的不幸。」你的不幸是独特的，但你不是孤独的。", "——《安娜·卡列尼娜》"],
    ["陀思妥耶夫斯基说：「美将拯救世界。」也许你就是一个美的存在，正在被世界需要。", "——《白痴》陀思妥耶夫斯基"],
    ["卡夫卡说：「从某处往回看，没有什么是可以后悔的。」即使看起来像错误的路，也是你必须走的路。", "——《城堡》卡夫卡"],
    ["马尔克斯说：「多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。」生命充满了这样的下午。", "——《百年孤独》"],
    ["福克纳说：「过去从未死去，它甚至还没有过去。」但你可以让过去成为你成长的养分。", "——《喧哗与骚动》"],
    ["昆德拉说：「人类一思考，上帝就发笑。」但思考的你，依然值得被爱。", "——《不能承受的生命之轻》"],
    ["黑塞说：「每个人的生命都是通往自我的征途。」你正在这条路上。", "——《德米安》赫尔曼·黑塞"],
    ["加缪说：「在隆冬，我终于知道，我身上有一个不可战胜的夏天。」你也有这样的夏天。", "——《反抗者》加缪"],
    ["圣埃克苏佩里说：「你为你的玫瑰花费的时间，使你的玫瑰变得如此重要。」你是那朵玫瑰。", "——《小王子》"],
    ["杜拉斯说：「爱之于我，不是肌肤之亲，不是一蔬一饭，它是一种不死的欲望，是疲惫生活中的英雄梦想。」你有这样的梦想。", "——《情人》"],
    ["村上春树说：「你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看。」但偶尔情绪化也没关系。", "——《舞！舞！舞！》"],
    ["菲茨杰拉德说：「同时保有两种矛盾的观念，还能正常行事，这是第一流智慧的标志。」你正在这样做。", "——《了不起的盖茨比》"],
    ["毛姆说：「一个人能观察落叶、鲜花，从细微的事物中感受一切美好，他就是一个幸福的人。」你能感受美好。", "——《月亮与六便士》"],
    ["卡彭铁尔说：「梦幻是现实的一种可能性。」你的梦也是现实的一部分。", "——《追猎》"],
    ["萨冈说：「所有漂泊的人都梦想着平静、童年和泸州花。」但漂泊本身也是旅程的一部分。", "——《你好，忧愁》"],
    ["马尔克斯说：「生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。」你正在创造记忆。", "——《百年孤独》"],
    ["奈保尔说：「世界不是你所看见的那样。」用你的眼睛去看，用你的心去感受。", "——《比斯沃斯先生的房子》"],
    ["科塔萨尔说：「生活是我们在走向目的地时沿途捡拾的东西。」你正在沿途捡拾。", "——《跳房子》"],
    ["略萨说：「文学是虚构的，但情感是真实的。」你感受到的情感是真实的。", "——《给青年小说家的信》"]
];

// 诗词精华
const poetry = [
    ["苏轼说：「莫听穿林打叶声，何妨吟啸且徐行。」即使风雨交加，你也可以从容前行。", "——《定风波》苏轼"],
    ["李白说：「长风破浪会有时，直挂云帆济沧海。」你的时机正在到来。", "——《行路难》李白"],
    ["杜甫说：「会当凌绝顶，一览众山小。」你正在攀登，风景会更好。", "——《望岳》杜甫"],
    ["陶渊明说：「采菊东篱下，悠然见南山。」平凡的生活也有诗意。", "——《饮酒·其五》陶渊明"],
    ["王维说：「行到水穷处，坐看云起时。」有时候迷路也是风景。", "——《终南别业》王维"],
    ["辛弃疾说：「众里寻他千百度，蓦然回首，那人却在灯火阑珊处。」你要找的，也许一直在你身边。", "——《青玉案·元夕》辛弃疾"],
    ["李清照说：「生当作人杰，死亦为鬼雄。」你活着的每一天都是杰作。", "——《夏日绝句》李清照"],
    ["岳飞说：「莫等闲，白了少年头，空悲切。」但即使白了头，你也可以重新开始。", "——《满江红》岳飞"],
    ["文天祥说：「人生自古谁无死，留取丹心照汗青。」你的存在已经在世界上留下痕迹。", "——《过零丁洋》文天祥"],
    ["陆游说：「山重水复疑无路，柳暗花明又一村。」黑暗之后就是光明。", "——《游山西村》陆游"],
    ["白居易说：「野火烧不尽，春风吹又生。」你像草一样，有无限的生命力。", "——《赋得古原草送别》"],
    ["刘禹锡说：「沉舟侧畔千帆过，病树前头万木春。」旧的总会过去，新的总会到来。", "——《酬乐天扬州初逢席上见赠》"],
    ["李商隐说：「春蚕到死丝方尽，蜡炬成灰泪始干。」你的付出有意义。", "——《无题》李商隐"],
    ["杜牧说：「停车坐爱枫林晚，霜叶红于二月花。」最美的风景在最意想不到的地方。", "——《山行》杜牧"],
    ["王之涣说：「欲穷千里目，更上一层楼。」你还能看到更多。", "——《登鹳雀楼》"],
    ["孟浩然说：「春眠不觉晓，处处闻啼鸟。」简单的快乐就在身边。", "——《春晓》孟浩然"],
    ["王昌龄说：「黄沙百战穿金甲，不破楼兰终不还。」你有勇气和决心。", "——《从军行》王昌龄"],
    ["岑参说：「忽如一夜春风来，千树万树梨花开。」美好的事物会突然出现。", "——《白雪歌送武判官归京》"],
    ["纳兰性德说：「人生若只如初见，何事秋风悲画扇。」每一刻都是新的开始。", "——《木兰花》纳兰性德"],
    ["仓央嘉措说：「世间安得双全法，不负如来不负卿。」没有完美的选择，但有属于你的选择。", "——仓央嘉措"]
];

// ========== 心理学洞见 (351-500) ==========

const psychology = [
    ["弗洛伊德说：「那些无法言说的，会以症状的形式说出来。」你的感受值得被听见。", "——《精神分析导论》"],
    ["荣格说：「往外看的人在做梦，往内看的人正在觉醒。」你正在向内看。", "——《红书》荣格"],
    ["阿德勒说：「人的一切烦恼，都来自于人际关系。」但人的一切幸福，也来自于人际关系。", "——《自卑与超越》阿德勒"],
    ["弗洛姆说：「自由是孤独的，但这份孤独是成长的代价。」你正在成长。", "——《逃避自由》弗洛姆"],
    ["荣格说：「你没有整合到意识中的部分，会以命运的形式回归。」你的阴影也是你的一部分。", "——《原型与集体无意识》"],
    ["卡伦·霍妮说：「人在神经症中挣扎，是因为他无法接受自己的软弱。」接受软弱，你才能真正强大。", "——《我们时代的神经症人格》"],
    ["罗杰斯说：「成为你自己，是世界上最孤独的道路，但也是最值得走的道路。」你走在正确的路上。", "——《成为一个人》罗杰斯"],
    ["马斯洛说：「一个人能成为什么，他就必须成为什么。」你有无限的可能性。", "——《动机与人格》马斯洛"],
    ["维克多·弗兰克尔说：「在刺激和反应之间，有一个空间，在那个空间里，我们有力量选择我们的反应。」你拥有这份力量。", "——《活出意义来》弗兰克尔"],
    ["弗洛伊德说：「梦是通往潜意识的捷径。」你的梦在告诉你什么？", "——《梦的解析》"],
    ["荣格说：「与自己和解，是人生最重要的课题。」你正在这个课题上努力。", "——《回忆·梦·思考》"],
    ["阿德勒说：「我们的烦恼不是来自于过去，而是来自于对过去的解读。」改变解读，改变一切。", "——《自卑与超越》"],
    ["埃里克森说：「每一步危机都是成长的契机。」你的危机正在转化为成长。", "——《童年与社会》"],
    ["温尼科特说：「完美的环境不存在，但足够好的母亲已经足够。」足够好的生活已经足够。", "——《足够好的母亲》"],
    ["拉康说：「语言是存在的基础。」你用语言思考，这本身就是奇迹。", "——《拉康选集》"],
    ["波尔斯说：「我是我所处境遇的总和，也是我选择的总和。」你选择了继续前行。", "——《格式塔疗法》"],
    ["艾利斯说：「不是事件本身让我们困扰，而是我们对事件的解读。」换一个解读。", "——《理性情绪疗法》"],
    ["贝博说：「心理问题的根源，往往是我们与自己的关系出了问题。」修复这段关系。", "——《客体关系理论》"],
    ["科胡特说：「在情绪的镜子里，孩子需要看到自己的倒影。」你也是自己的镜子。", "——《精神分析之治愈之道》"],
    ["瑟尔斯说：「创伤不是发生在你身上的事，而是发生在你内心的东西。」你可以治愈内心。", "——《创伤与复原》"]
];

// ========== 存在主义与生命意义 (501-600) ==========

const existentialism = [
    ["加缪说：「荒谬是起点，不是终点。」从荒谬出发，你可以创造意义。", "——《西西弗斯神话》"],
    ["萨特说：「人被判定为自由，这意味着责任。」你的责任也是你的尊严。", "——《存在与虚无》"],
    ["海德格尔说：「此在的存在是向死存在的。」向死而生，让你的每一天都算数。", "——《存在与时间》"],
    ["加缪说：「我反抗，故我存在。」你的反抗证明了你活着。", "——《反抗者》"],
    ["萨特说：「存在是本质的前提。」先存在，然后定义自己。", "——《存在与虚无》"],
    ["梅洛庞蒂说：「世界不是我思考的对象，而是我居住的地方。」你属于这个世界。", "——《知觉现象学》"],
    ["巴塔耶说：「生命是消耗，是燃烧。」你正在燃烧，不是浪费。", "——《文学与恶》"],
    ["薇依说：「等待是最本质的行为。」在等待中，你保持了希望。", "——《重负与神恩》"],
    ["马塞尔说：「奥秘不是需要解决的问题，而是需要参与的现实。」你正在参与。", "——《存在与拥有》"],
    ["布伯说：「所有真实的人生都是相遇。」每一次相遇都是礼物。", "——《我与你》"],
    ["萨特说：「他人是地狱。」但他人也是天堂，取决于你怎么看。", "——《禁闭》"],
    ["加缪说：「在隆冬，我终于知道，我身上有一个不可战胜的夏天。」你的夏天在你体内。", "——《反抗者》"],
    ["海德格尔说：「语言是存在之家。」你说话，你存在。", "——《关于人道主义的书信》"],
    ["萨特说：「懦夫是自己造就的，英雄也是自己造就的。」你是你自己的作品。", "——《存在与虚无》"],
    ["加缪说：「对于无限的唯一的反叛，是创造。」你正在创造。", "——《西西弗斯神话》"],
    ["薇依说：「专注是最罕见的慷慨。」你正在专注地活着。", "——《重负与神恩》"],
    ["巴什拉说：「梦想是灵魂的呼吸。」你的梦想在呼吸。", "——《梦想的诗学》"],
    ["列维纳斯说：「面孔是第一位的。」你的面孔值得被看见。", "——《整体与无限》"],
    ["萨特说：「自由是一个可怕的概念。」但它也是最美丽的礼物。", "——《存在与虚无》"],
    ["加缪说：「判断力比智力更罕见。」你在使用你的判断力。", "——《西西弗斯神话》"]
];

// ========== 自然与宇宙的启示 (601-700) ==========

const nature = [
    ["泰戈尔说：「生如夏花之绚烂，死如秋叶之静美。」你的生命正在绚烂。", "——《飞鸟集》泰戈尔"],
    ["惠特曼说：「我辽阔广大，我包罗万象。」你也是包罗万象的。", "——《自我之歌》"],
    ["卢梭说：「人是大自然的作品。」你来自自然，属于自然。", "——《论人类不平等的起源》"],
    ["康德说：「头顶的星空，和心中的道德律。」星空在等你去看。", "——《实践理性批判》"],
    ["惠特曼说：「我倾听长久的风声，像拨动一根弦。」风在为你演奏。", "——《自我之歌》"],
    ["歌德说：「自然！她环绕着我们，把我们揽进她的怀里。」你不是孤独的。", "——《歌德谈话录》"],
    ["卢梭说：「我们在大地上生存，应该以大地的方式理解它。」你理解大地的方式是正确的。", "——《忏悔录》"],
    ["普鲁斯特说：「真正的发现之旅，不是寻找新风景，而是拥有新眼光。」你正在获得新眼光。", "——《追忆似水年华》"],
    ["康德说：「时空是感性的形式，不是事物的本身。」你看到的不是全部。", "——《纯粹理性批判》"],
    ["海明威说：「太阳每天都会升起。」明天又是新的一天。", "——《丧钟为谁而鸣》"],
    ["梭罗说：「我步入丛林，因为我希望生活得有意义。」你也在寻找意义。", "——《瓦尔登湖》"],
    ["爱默生说：「自然是一个精神的存在。」你也是精神的存在。", "——《论自然》"],
    ["惠特曼说：「做一个世界的水手，奔赴所有的码头。」你有无数码头可以停靠。", "——《自我之歌》"],
    ["卢梭说：「植物是土地的孩子，人也是。」你和大地是亲人。", "——《爱弥儿》"],
    ["歌德说：「万物之中诞生是永恒的。」你的诞生是永恒的。", "——《浮士德》"],
    ["泰戈尔说：「天空没有留下鸟的痕迹，但我已飞过。」你的痕迹在别处。", "——《飞鸟集》"],
    ["利奥波德说：「我们不能拯救我们不热爱的地方。」你热爱的地方就是你的家。", "——《沙乡年鉴》"],
    ["卡逊说：「那些不自然的自然，终将回归。」自然有恢复的力量，你也有。", "——《寂静的春天》"],
    ["米什莱说：「山是人类精神的象征。」你正在攀登精神的山峰。", "——《山》儒勒·米什莱"],
    ["梭罗说：「世界留存在荒野中。」你心里也有一片荒野。", "——《瓦尔登湖》"]
];

// ========== 人与人之间的温暖 (701-800) ==========

const warmth = [
    ["圣埃克苏佩里说：「你为你的玫瑰花费的时间，使你的玫瑰变得如此重要。」有人在为你花费时间。", "——《小王子》"],
    ["卡夫卡说：「书籍是一把斧头，劈开我们内心冰封的海洋。」文字在劈开你的冰。", "——《致父亲的信》"],
    ["黑塞说：「每个人真正的道路是通向自己的。」你正在这条路上。", "——《德米安》"],
    ["陀思妥耶夫斯基说：「用爱去爱这个世界，哪怕它值得被恨。」你在用爱面对。", "——《卡拉马佐夫兄弟》"],
    ["托尔斯泰说：「幸福的家庭都是相似的。」你的家庭有你的幸福。", "——《安娜·卡列尼娜》"],
    ["莫言说：「文学让人看见看不见的东西。」你正在看见。", "——《生死疲劳》"],
    ["卡夫卡说：「你不必离开你的房间。」坐在桌前，世界就会向你走来。", "——《寻找城堡》"],
    ["赫曼·黑塞说：「每个人的生命都是通往自我的征途，是一条路，不是一条路。」你的路是独特的。", "——《德米安》"],
    ["托尔斯泰说：「每个人都想改变世界，却没人想改变自己。」你正在改变自己。", "——《托尔斯泰箴言》"],
    ["陀思妥耶夫斯基说：「受苦是伟大的。」你在受苦，但也在伟大。", "——《卡拉马佐夫兄弟》"],
    ["圣埃克苏佩里说：「真正重要的东西，用眼睛是看不见的。」用心去感受。", "——《小王子》"],
    ["卡夫卡说：「我的内心是脆弱的，但这是我唯一的优势。」脆弱也是力量。", "——《卡夫卡日记》"],
    ["黑塞说：「觉醒的人只有一个责任——找到自己，成为自己。」你正在成为自己。", "——《德米安》"],
    ["陀思妥耶夫斯基说：「美将拯救世界。」你正在展示美。", "——《白痴》"],
    ["托尔斯泰说：「每个人的生活都是一部小说。」你的故事还在继续。", "——《战争与和平》"],
    ["加缪说：「在荒谬的世界中，我们仍然可以创造意义。」你正在创造。", "——《西西弗斯神话》"],
    ["圣埃克苏佩里说：「所有的大人都曾经是小孩。」你心里有一个小孩需要被照顾。", "——《小王子》"],
    ["卡夫卡说：「目的虽有，道路却无。」你正在开辟道路。", "——《城堡》"],
    ["黑塞说：「我孤独，但我不寂寞。」你可以享受孤独。", "——《悉达多》"],
    ["陀思妥耶夫斯基说：「人类是奇怪的，他们不能忍受自己的存在。」但你忍受住了，你很棒。", "——《地下室手记》"]
];

// ========== 面对困境的智慧 (801-900) ==========

const wisdomInAdversity = [
    ["尼采说：「那杀不死我的，使我更强大。」你比你自己想象的更强大。", "——《偶像的黄昏》"],
    ["尼采说：「我为什么要经历地狱？为了成为天使吗？不，是为了更好地活着。」你正在更好地活着。", "——《查拉图斯特拉如是说》"],
    ["加缪说：「在隆冬，我终于知道，我身上有一个不可战胜的夏天。」你也有夏天。", "——《反抗者》"],
    ["海明威说：「人可以被毁灭，但不能被打败。」你没有被毁灭。", "——《老人与海》"],
    ["卡夫卡说：「不要绝望，甚至不要因为你没有感到绝望而感到绝望。」", "——《城堡》"],
    ["尼采说：「最深的深渊也会倒映星星。」你的深渊里也有星星。", "——《查拉图斯特拉如是说》"],
    ["陀思妥耶夫斯基说：「苦难是伟大的教育。」你在学习。", "——《卡拉马佐夫兄弟》"],
    ["加缪说：「没有绝望的哲学，只有绝望的人。」你不是绝望的人。", "——《西西弗斯神话》"],
    ["尼采说：「也许有一天，我会笑着迎接最黑暗的时刻。」你也可以。", "——《查拉图斯特拉如是说》"],
    ["卡夫卡说：「巴尔扎克的杖上刻着：'我能穿越一切'。」你也能。", "——《卡夫卡日记》"],
    ["海明威说：「每一天都是一个新的开始。」这是你的新开始。", "——《永别了武器》"],
    ["尼采说：「一个人知道自己为什么而活，就可以忍受任何一种生活。」你知道。", "——《查拉图斯特拉如是说》"],
    ["加缪说：「世界是荒谬的，但我们可以选择如何回应。」你选择了回应。", "——《西西弗斯神话》"],
    ["陀思妥耶夫斯基说：「只有经历苦难，才能获得救赎。」你正在被救赎。", "——《罪与罚》"],
    ["卡夫卡说：「没有回头路，也没有替代的路。」但你有前进的路。", "——《城堡》"],
    ["尼采说：「一切美好的事物，都是从荒谬中诞生的。」你的美好正在诞生。", "——《偶像的黄昏》"],
    ["海明威说：「世界打破每个人，有些人在破碎的地方变得更强。」你正在变得更强。", "——《永别了武器》"],
    ["加缪说：「我反抗，故我在。」你的反抗证明了你的存在。", "——《反抗者》"],
    ["尼采说：「你必须学会在没有意义的地方创造意义。」你正在创造。", "——《查拉图斯特拉如是说》"],
    ["卡夫卡说：「从某处往回看，没有什么是可以后悔的。」", "——《城堡》"]
];

// ========== 自我接纳与成长 (901-1000) ==========

const selfAcceptance = [
    ["荣格说：「与自己和解是人生最重要的课题。」你正在和解。", "——《回忆·梦·思考》"],
    ["阿德勒说：「我们不是因为失败而失败，而是因为缺乏面对失败的勇气。」你有勇气。", "——《自卑与超越》"],
    ["罗杰斯说：「成为你自己是一个过程，不是终点。」你在这个过程中。", "——《成为一个人》"],
    ["卡伦·霍妮说：「我们不是因为我们是什么而痛苦，而是因为我们想要成为什么而痛苦。」你已经是足够好的了。", "——《我们时代的神经症人格》"],
    ["维克多·弗兰克尔说：「人的主要动力是对意义的追求。」你正在追求意义。", "——《活出意义来》"],
    ["马斯洛说：「自我实现者能够接纳自己、接纳他人、接纳自然。」你正在接纳。", "——《动机与人格》"],
    ["弗洛姆说：「爱是主动的能力，是克服分离和孤独的方式。」你拥有爱的能力。", "——《爱的艺术》"],
    ["埃里希·弗洛姆说：「自由是成长的目的。」你正在成长。", "——《逃避自由》"],
    ["罗杰斯说：「当我接纳自己的本来面目时，我就可以改变。」你正在改变。", "——《卡尔·罗杰斯论会心团体》"],
    ["卡尔·罗杰斯说：「功能完全的人是指那些活在当下、体验自己的人。」你正在体验自己。", "——《成为一个人》"],
    ["亚伯拉罕·马斯洛说：「我们不是由我们的缺陷定义的，而是由我们处理缺陷的方式定义的。」", "——《动机与人格》"],
    ["卡尔·罗杰斯说：「真实的自己比面具更值得信任。」你戴着真实的自己。", "——《论人的成长》"],
    ["维克多·弗兰克尔说：「意义不在于我们从生活中得到什么，而在于我们给生活什么。」你正在给予。", "——《活出意义来》"],
    ["卡尔·罗杰斯说：「生命的目的就是成为自己。」你正在成为自己。", "——《成为一个人》"],
    ["阿尔弗雷德·阿德勒说：「重要的不是经历，而是我们赋予经历的意义。」你赋予了意义。", "——《自卑与超越》"],
    ["卡伦·霍妮说：「真正的问题是，我们与自己关系的问题。」你正在修复这段关系。", "——《神经症与人的成长》"],
    ["亚伯拉罕·马斯洛说：「也许自我实现者的定义就是：他们正在成为他们能成为的人。」你正在成为。", "——《存在心理学》"],
    ["卡尔·罗杰斯说：「接纳是改变的前提。」你被接纳了。", "——《论会心团体》"],
    ["维克多·弗兰克尔说：「人最终关心的不是逃避痛苦或追求快乐，而是看到生命的意义。」你看到了。", "——《活出意义来》"],
    ["亚伯拉罕·马斯洛说：「任何事情都可以被接受，只要它不否认人性。」你被接受了。", "——《动机与人格》"]
];

// 组合所有内容
existentialQuotes.forEach(q => content.push({ story: q[0], source: q[1] }));
easternQuotes.forEach(q => content.push({ story: q[0], source: q[1] }));
westernClassical.forEach(q => content.push({ story: q[0], source: q[1] }));
modernPhilosophy.forEach(q => content.push({ story: q[0], source: q[1] }));
chineseLiterature.forEach(q => content.push({ story: q[0], source: q[1] }));
foreignLiterature.forEach(q => content.push({ story: q[0], source: q[1] }));
poetry.forEach(q => content.push({ story: q[0], source: q[1] }));
psychology.forEach(q => content.push({ story: q[0], source: q[1] }));
existentialism.forEach(q => content.push({ story: q[0], source: q[1] }));
nature.forEach(q => content.push({ story: q[0], source: q[1] }));
warmth.forEach(q => content.push({ story: q[0], source: q[1] }));
wisdomInAdversity.forEach(q => content.push({ story: q[0], source: q[1] }));
selfAcceptance.forEach(q => content.push({ story: q[0], source: q[1] }));

// 额外的100条通用智慧
const extraWisdom = [
    "每个人的生命都是一部史诗，即使是最安静的章节也值得被讲述。",
    "你在黑暗中寻找的光，可能正是你自己。",
    "伤口是光进入你内心的地方。",
    "不是所有的河流都流向大海，有些流向森林，滋养生命。",
    "你不必成为太阳，有时候做一颗星星也很好，照亮一小片天空。",
    "时间是治愈一切的药，但需要你每天服用——那就是活着。",
    "有时候，最勇敢的事情不是面对敌人，而是承认自己的脆弱。",
    "你不必让所有人都理解你，理解自己就够了。",
    "世界上最远的距离不是生与死，而是不知道自己是谁。",
    "每一个微笑背后，都有一个曾经哭泣过的灵魂，但哭泣不是终点。",
    "你不是你的失败，也不是你的错误，你是你选择站起来的方式。",
    "有时候，迷路是发现自己另一种可能的方式。",
    "你的故事还没有结束，最后的章节由你来写。",
    "不是所有的种子都会开花，但每颗种子都有自己的价值。",
    "痛苦是真实的，但你的韧性更真实。",
    "你不需要成为完美的版本，只需要成为真实的自己。",
    "有时候，最重要的东西看不见，需要用心去感受。",
    "你不是孤独的旅行者，你的每一步都在地球上留下痕迹。",
    "生命不是一个需要解决的问题，而是一个需要体验的礼物。",
    "无论你走了多远，家的门永远为你敞开。",
    "你的存在本身就是对世界的祝福。",
    "放下不是放弃，而是选择不再让沉重的东西拖累你。",
    "每一个新的早晨都是重新开始的机会。",
    "你不是你的过去，过去只是你生命故事的一章。",
    "有时候，停下来呼吸也是一种前进。",
    "你的感受是有效的，你的痛苦是真实的，但黑暗不会永远持续。",
    "你是自己生命的主角，不是配角。",
    "允许自己不完美，是完美的开始。",
    "每一个裂缝都是光进入的地方。",
    "你比你自己想象的更强大。",
    "生活不是等待风暴过去，而是学会在雨中跳舞。",
    "你不需要向任何人证明你的价值，你的价值与生俱来。",
    "有时候，最好的疗愈是允许自己被治愈。",
    "你的故事是独特的，你的痛苦是共同的。",
    "不是所有的问题都需要答案，有些只需要被接受。",
    "你值得被爱，不需要任何理由。",
    "每一个小小的善举，都在改变世界。",
    "你在，世界就不一样。",
    "有时候，最短的路是绕远的那条。",
    "你的感受没有对错，它们只是你的感受。",
    "不是所有的人都会喜欢你，但这不是你的问题。",
    "你不需要成为别人期望的样子，你只需要成为自己。",
    "生命中的每一次失去，都在为更重要的东西腾出空间。",
    "你不是你的恐惧，恐惧只是你的一部分。",
    "每一个结束都是新的开始。",
    "你无法控制风，但可以调整帆。",
    "有时候，最难的路是正确的路。",
    "你的价值不在于你做了什么，而在于你是谁。",
    "每一个问题都藏着礼物，即使礼物包装得很难看。",
    "你不需要理解一切才能前进，前进本身会带来理解。",
    "生活就像海洋，重要的不是避开风浪，而是学会游泳。",
    "你不是你的失败，失败只是暂时的状态。",
    "每一个今天都是你未来永远不会回来的礼物。",
    "你不需要向任何人解释你的选择。",
    "痛苦会过去，但你的勇气会留下来。",
    "你是自己故事的作者，你可以改变情节。",
    "不是所有的梦都会实现，但每个梦都值得被追求。",
    "你的心碎的地方，可以成为爱流入的地方。",
    "每一个沉默的时刻，都在积蓄力量。",
    "你不是你的错误，你是你从错误中站起来的样子。",
    "有时候，最有力的回答是沉默和继续前行。",
    "你的存在是宇宙的奇迹，你值得被珍惜。",
    "生活不是要等待完美时刻，而是要把平凡时刻变得完美。",
    "你不需要成为光，你本来就有光。",
    "每一个艰难的时刻都在塑造更强大的你。",
    "你不是你的过去，而是你选择成为的样子。",
    "有时候，脆弱是最有力的力量。",
    "你无法改变过去，但你可以改变对过去的感受。",
    "每一个生命都有意义，你的意义正在被发现。",
    "你不是你的疾病，你是你选择的面对方式。",
    "有时候，放手不是放弃，而是另一种形式的拥有。",
    "你的故事值得被讲述，你的痛苦值得被理解。",
    "每一个早晨都是新的可能。",
    "你不是你的标签，标签只是别人给的。",
    "有时候，最慢的路是到达最快的路。",
    "你的感受是正确的，即使没有人理解。",
    "每一个选择的背后都有勇气。",
    "你不是你的失败，你是你尝试的次数。",
    "生活是关于在风浪中继续前行，而不是等待风平浪静。",
    "你不需要完美才能被爱，你本来就被爱着。",
    "每一个伤口都是成长的印记。",
    "你不是你的恐惧，你是你面对恐惧的方式。",
    "有时候，迷路只是另一个发现的机会。",
    "你的价值不是由别人决定的。",
    "每一个结束都是另一段旅程的开始。",
    "你不是你的过去，你是你选择的未来。",
    "有时候，最难的对视是面对镜子里的自己。",
    "你的存在本身就是一种美。",
    "每一个平凡的日子都是礼物。",
    "你不是你的错误，你是你改正的决心。",
    "有时候，最安静的时刻思考最清晰。",
    "你的痛苦不是软弱的标志，而是人性的证明。",
    "每一个今天都是新的开始。",
    "你不是你的恐惧，你是你超越恐惧的行动。",
    "生活不是关于等待，而是关于创造。",
    "你值得被温柔对待，包括来自你自己。",
    "每一个微笑背后都有故事。",
    "你不是你的失败，你是你站起来的次数。",
    "有时候，最难的问题有最简单的答案——活着。",
    "你的故事是独特的，你的旅程是神圣的。",
    "每一个呼吸都是新的机会。",
    "你不是你的过去，你是你现在的选择。",
    "有时候，最有力的行动是不行动的勇气。",
    "你的存在本身就是意义。",
    "每一个艰难的时刻都在教你一些东西。",
    "你不是你的错误，你是你学习的方式。",
    "生活不是关于完美，而是关于完整。",
    "你不需要成为任何人，你只需要成为自己。",
    "每一个伤口都有愈合的能力。",
    "你不是你的恐惧，你是你穿越恐惧的勇气。",
    "有时候，最好的出路是穿过。",
    "你的故事值得被倾听。",
    "每一个日出都是新的希望。",
    "你不是你的失败，你是你尝试的勇气。",
    "有时候，最安静的声音最有力。",
    "你的存在是被需要的。",
    "每一个生命都有季节，你的季节正在来临。",
    "你不是你的错误，你是你改正的勇气。",
    "生活不是关于等待，而是关于创造。",
    "你值得拥有美好的事物。",
    "每一个微笑都是小小的奇迹。",
    "你不是你的恐惧，你是你拥抱变化的勇气。",
    "有时候，放慢脚步是前进的方式。",
    "你的痛苦是有意义的。",
    "每一个新的开始都来自旧的结束。",
    "你不是你的过去，你是你选择的现在。",
    "有时候，最难的路是最好的路。",
    "你的生命是珍贵的。",
    "每一个艰难时刻都在为美好时刻做准备。",
    "你不是你的错误，你是你成长的机会。",
    "生活不是关于完美，而是关于真实。",
    "你值得被爱。",
    "每一个平凡的瞬间都可以成为永恒。",
    "你不是你的恐惧，你是你面对自己的勇气。",
    "有时候，最好的决定是还没有做出的决定。",
    "你的存在是奇迹。",
    "每一个早晨都是重新开始的礼物。",
    "你不是你的失败，你是你站起来的决定。",
    "有时候，最安静的时刻最有力量。",
    "你的故事很重要。",
    "每一个呼吸都是新的可能。",
    "你不是你的过去，你是你选择的道路。",
    "有时候，迷路是发现新路的方式。",
    "你的存在是有目的的。",
    "每一个艰难时刻都在教你坚强。",
    "你不是你的错误，你是你学习的证明。",
    "生活不是关于完美，而是关于勇敢。",
    "你值得被珍惜。",
    "每一个微笑都在改变世界一点点。",
    "你不是你的恐惧，你是你超越的力量。",
    "有时候，最好的答案是不需要答案。",
    "你的存在是被祝福的。",
    "每一个早晨都是新的开始。",
    "你不是你的失败，你是你尝试的证明。",
    "有时候，最简单的路是最好的路。",
    "你的痛苦是被理解的。",
    "每一个结束都是新的可能。",
    "你不是你的过去，你是你现在的选择。",
    "生活不是关于完美，而是关于完整。",
    "你值得被爱，不需要任何证明。",
    "每一个平凡的日子都有价值。",
    "你不是你的恐惧，你是你拥抱生命的勇气。",
    "有时候，停下来看看风景是必要的。",
    "你的存在是独特的。",
    "每一个艰难时刻都在为你的故事增添章节。",
    "你不是你的错误，你是你学习的证明。",
    "生活不是关于完美，而是关于真实地活着。",
    "你值得拥有幸福。",
    "每一个微笑都是给世界的礼物。",
    "你不是你的过去，你是你现在的样子。",
    "有时候，最好的路是还没有走过的路。",
    "你的存在是被需要的。",
    "每一个早晨都带来新的可能性。",
    "你不是你的失败，你是你继续前进的证明。",
    "有时候，最难的决定是正确的决定。",
    "你的故事还在继续。",
    "每一个呼吸都是新的机会。",
    "你不是你的过去，你是你选择成为的人。",
    "有时候，最短的距离是绕远的那条路。",
    "你的存在是礼物。",
    "每一个艰难时刻都在塑造更完整的你。",
    "你不是你的错误，你是你成长的证据。",
    "生活不是关于完美，而是关于有勇气活着。",
    "你值得被爱，被珍惜，被理解。",
    "每一个微笑都在点亮世界。",
    "你不是你的恐惧，你是你面对恐惧的勇气。",
    "有时候，最好的选择是还不知道的选择。",
    "你的存在是奇迹。",
    "每一个早晨都是新的开始。",
    "你不是你的失败，你是你站起来的证明。",
    "有时候，最安静的时刻最有力量。",
    "你的故事很重要。",
    "每一个呼吸都是新的可能。",
    "你不是你的过去，你是你选择的未来。",
    "生活不是关于完美，而是关于完整地活着。",
    "你值得拥有美好的一切。"
];

// 添加额外智慧到内容库
extraWisdom.forEach(wisdom => {
    content.push({ story: wisdom, source: "—— 生活智慧" });
});

// 打乱顺序以增加随机性
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

return content;
}

// DOM Elements
let themeToggle, anchorButton, flashOverlay, messageCard, mainMessage, storySource, particlesContainer, soundBtn, soundMenu, soundLabel, navPrev, navNext;

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
    state.contentPool = [...philosophicalStories];
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

    // Add slide class
    messageCard.classList.remove('visible');
    if (direction === 'prev') {
        messageCard.classList.add('slide-left');
    } else {
        messageCard.classList.add('slide-right');
    }

    playSound();

    setTimeout(() => {
        // Update index
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

    // Prepare new content pool on first activation
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
            // Swipe left -> next
            navigateContent('next');
        } else {
            // Swipe right -> prev
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
    setupEventListeners();
    initTheme();
    initSound();
    setupPageLoadAnimation();
});
