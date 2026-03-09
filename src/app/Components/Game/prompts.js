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

export function getRandomPrompt(type = 'text') {
  const pool = type === 'draw' ? drawPrompts : textPrompts;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomAIResponse() {
  return aiResponses[Math.floor(Math.random() * aiResponses.length)];
}
