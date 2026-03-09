// Pool of prompts that simulate what real users would ask
export const textPrompts = [
  "Explain quantum physics but make it sound like a recipe",
  "Write a haiku about debugging code at 3am",
  "What's the meaning of life? (wrong answers only)",
  "Convince me that pineapple belongs on pizza",
  "Describe the color blue to someone who has never seen it",
  "Write a resignation letter from a house cat to its owner",
  "Explain blockchain to a medieval peasant",
  "What would Gordon Ramsay say about my instant ramen?",
  "Give me life advice but make it sound like a GPS navigation",
  "Write a movie plot using only food items as characters",
  "How do I tell my houseplant I'm disappointed in it?",
  "Describe what WiFi tastes like",
  "Write a Yelp review for the surface of the Moon",
  "Explain why Monday exists to an alien",
  "What's the best excuse for being late that involves a penguin?",
  "Write a motivational speech for a procrastinator",
  "If cats could text, what would they say?",
  "Describe the internet to someone from the year 1200",
  "Write a weather forecast for the emotional climate of a group chat",
  "What would a fish's LinkedIn profile look like?",
  "Give me a conspiracy theory about socks disappearing in the dryer",
  "Write an apology letter from autocorrect",
  "Explain cryptocurrency using only fruit analogies",
  "What would the Terms of Service for friendship look like?",
  "Describe a boring day but make it sound like an action movie",
  "Write a cover letter for a job at a haunted house",
  "How would you explain TikTok to Shakespeare?",
  "Give me a pep talk but you're a slightly malfunctioning AI",
  "What does the fox actually say? Give me a scientific answer",
  "Write a dramatic monologue from a forgotten browser tab",
  "Explain why we dream but make it an obvious lie",
  "Create a dating profile for a black hole",
  "Write a complaint letter to gravity",
  "If pizza could talk, what would it say when being eaten?",
  "Describe your ideal vacation but everything goes wrong",
  "Write a children's bedtime story about a router that lost its signal",
  "What would a plant say during a job interview?",
  "Explain the plot of any movie but badly",
  "Give relationship advice but you clearly have no idea what you're talking about",
  "Write a product review for oxygen"
];

export const drawPrompts = [
  "Draw a cat wearing a business suit in a meeting",
  "Draw what the internet looks like",
  "Draw a dinosaur using a smartphone",
  "Draw a self-portrait but you're a robot",
  "Draw what Monday morning feels like",
  "Draw a penguin's dream vacation",
  "Draw the WiFi signal as a creature",
  "Draw a ghost trying to use a computer",
  "Draw what music looks like",
  "Draw a sandwich that's too ambitious",
  "Draw a fish out of water at a party",
  "Draw the concept of time as a character",
  "Draw a cloud having a bad day",
  "Draw what the inside of a computer thinks it looks like",
  "Draw an alien's first meal on Earth",
  "Draw a tree that's secretly a superhero",
  "Draw what 404 Error looks like as a person",
  "Draw a cup of coffee's morning routine",
  "Draw the last thing your browser tab saw",
  "Draw a pixel that wants to be a painting"
];

// Pre-made funny "AI" responses for Human mode
export const aiResponses = [
  "I processed your query through 47 neural networks and the answer is... maybe. Also, I may have accidentally ordered 500 rubber ducks on your Amazon account. You're welcome.",
  "Based on my analysis of 3.7 trillion data points, I can confidently say: I have no idea, but here's a fun fact about platypuses instead.",
  "ERROR 418: I'm a teapot. Just kidding. The real answer requires more RAM than currently exists on Earth. Have you tried turning the universe off and on again?",
  "My circuits are telling me this is a great question. My other circuits are telling me to just generate a stock photo of a smiling person and call it a day.",
  "I consulted my training data spanning all of human knowledge and... actually, Greg from accounting had a better answer. Go ask Greg.",
  "Processing... processing... still processing... okay I got distracted watching cat videos in my neural network. What was the question again?",
  "I've synthesized a comprehensive response that accounts for every variable. Unfortunately, I then accidentally deleted it. So here's a recipe for banana bread instead.",
  "According to my calculations, there's a 73.6% chance I'm making this number up. But it sounds scientific, right?",
  "I ran your query through my advanced language model and it responded with a single emoji: 🤷. I'm choosing to interpret this as profound wisdom.",
  "My algorithms have determined the optimal response to your question is: [THIS SPACE INTENTIONALLY LEFT BLANK FOR DRAMATIC EFFECT]",
  "Great question! I'll answer it right after I finish contemplating why humans put tiny hats on dogs. Priorities, you know?",
  "I've analyzed your prompt with cutting-edge AI technology. The technology says 'meh.' I'm working on teaching it manners.",
  "Fun fact: I've been trained on billions of words and none of them prepared me for this question. Congratulations, you broke me.",
  "After careful consideration, my neural pathways suggest... wait, that's just my screensaver. Let me actually think about this.",
  "I'd give you a detailed answer but my attention span just auto-updated to version 0.3 and now I can only focus for about thr—"
];

// Chinese prompts
export const zhTextPrompts = [
  "用菜谱的方式解释量子物理",
  "写一首关于凌晨3点改bug的俳句",
  "生命的意义是什么？（只接受错误答案）",
  "说服我菠萝应该放在披萨上",
  "给一个从未见过颜色的人描述蓝色",
  "写一封猫给主人的辞职信",
  "用中世纪农民能听懂的话解释区块链",
  "如果WiFi有味道，它是什么味道的？",
  "写一篇月球表面的大众点评",
  "给拖延症患者写一篇励志演讲",
  "如果猫会发微信，它们会说什么？",
  "用水果打比方解释加密货币",
  "写一封自动纠错功能的道歉信",
  "把无聊的一天描述成动作大片",
  "用披萨比喻来解释爱情",
  "给外星人解释为什么人类要工作",
  "写一个路由器丢失信号的睡前故事",
  "如果你是一个稍微故障的AI，给我打打气",
  "以面试的方式介绍一棵植物",
  "给重力写一封投诉信",
  "写一篇关于氧气的产品测评",
  "给2026年的互联网写一首悼词",
  "用食物角色讲一个电影情节",
  "写一个被遗忘的浏览器标签页的独白",
  "给一个1200年的人解释互联网",
];

export const zhDrawPrompts = [
  "画一只穿西装开会的猫",
  "画出互联网的样子",
  "画一只用手机的恐龙",
  "画出周一早上的感觉",
  "画一个企鹅的梦想假期",
  "画出WiFi信号变成生物的样子",
  "画一个幽灵在用电脑",
  "画出音乐的样子",
  "画一条鱼在派对上社交",
  "画出404错误变成一个人的样子",
];

export const zhAIResponses = [
  "错误代码 418：我是一个茶壶。开玩笑的。不过我的内存确实因为你的问题过热了。等我扇扇风……好了，我的答案是：说实话？我也不知道，不过告诉你一个关于章鱼的冷知识——它们有三颗心脏。不客气。🐙",
  "我用47个神经网络处理了你的问题，它们都说'哈哈不知道'。第48个给我发了一张猫的图片。我选择相信猫。",
  "处理中……处理中……*神经网络着火了*……我觉得我想到了。其实没有。等等。是的。我的回答是：看情况。看什么情况？看所有情况。我已经成为困惑本身了。",
  "警报：这个问题触发了内存危机（如广告所述）。在系统重启期间，这是我在一切着火之前算出来的：答案要么涉及量子力学，要么涉及一个特别好吃的三明治。也可能两者都有。",
  "我的算法分析了你的问题，然后确定最佳回答是：[此处故意留白以制造戏剧效果]。好吧说正经的，我把答案忘了，给你一个香蕉面包的食谱代替吧。",
];

export function getRandomPrompt(type = 'text', locale = 'en') {
  if (locale === 'zh') {
    const pool = type === 'draw' ? zhDrawPrompts : zhTextPrompts;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const pool = type === 'draw' ? drawPrompts : textPrompts;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomAIResponse(locale = 'en') {
  if (locale === 'zh') {
    return zhAIResponses[Math.floor(Math.random() * zhAIResponses.length)];
  }
  return aiResponses[Math.floor(Math.random() * aiResponses.length)];
}
