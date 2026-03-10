import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const TOPICS = [
  'a surprising fact about octopuses',
  'why mornings are difficult',
  'the appeal of vintage fashion',
  'how clouds form',
  'the history of pizza',
  'why cats knock things off tables',
  'the benefits of walking in nature',
  'how compilers optimize code',
  'the psychology of color in marketing',
  'why some people talk in their sleep',
  'the mathematics behind music harmony',
  'how sourdough starter works',
  'the engineering of suspension bridges',
  'why we find sunsets beautiful',
  'the economics of street food vendors',
  'how migrating birds navigate',
  'the evolution of written language',
  'why time feels slower when you are bored',
  'the science of fermentation in kimchi',
  'how noise-canceling headphones work',
  'why coffee smells so good',
  'how bees communicate with dance',
  'the physics of skateboarding tricks',
  'why some songs get stuck in your head',
  'the chemistry of cooking an egg',
  'how ancient Romans built roads',
  'the science of optical illusions',
  'why yawning is contagious',
  'how plants communicate underground',
  'the origins of chess',
  'why old books smell a certain way',
  'how the stock market works',
  'the biology of dreaming',
  'why ice is slippery',
  'how GPS satellites stay synchronized',
  'the history of chocolate',
  'why leaves change color in autumn',
  'how fingerprints are unique',
  'the physics of a boomerang',
  'why we get goosebumps',
  'how coral reefs form',
  'the invention of the printing press',
  'why spicy food makes you sweat',
  'how submarines work',
  'the psychology of procrastination',
  'why we laugh',
  'how magnets work at the atomic level',
  'the history of video games',
  'why the ocean is salty',
  'how vaccines train the immune system',
];

const HUMAN_SENTENCES = [
  "honestly my cat just knocked my coffee off the desk for the third time this week and im starting to think shes doing it on purpose lol",
  "does anyone else get that thing where you walk into a room and completely forget why you went there?? happens to me like 5 times a day",
  "ok hot take but pineapple on pizza is actually fire and i will die on this hill",
  "just spent 3 hours debugging only to realize i had a typo in a variable name. i want to cry",
  "my grandma makes the best lasagna in the world and no i will not be taking questions on this",
  "idk why but rainy days make me so productive?? like give me grey skies and a cup of tea and i become unstoppable",
  "tried to make sourdough last weekend and it turned out like a brick. my family still ate it tho so thats love i guess",
  "ngl i just watched a 45 minute video essay about the history of velcro and i regret nothing",
  "you ever just lay in bed at 2am thinking about that embarrassing thing you said in 7th grade? no? just me? cool",
  "my coworker microwaves fish in the office kitchen every single day and honestly its a form of workplace violence",
  "the way my dog looks at me when i eat cheese... like buddy i know you want some but this is MY cheese",
  "i accidentally called my teacher 'mom' in front of the whole class once and i still think about it 15 years later",
  "unpopular opinion but fall is overrated. yeah the leaves are pretty but its basically just everything dying in warm colors",
  "why do i always get my best ideas in the shower when i cant write anything down smh",
  "just found out my neighbor has been feeding my cat treats which explains why shes been ignoring me lately lmao",
  "i swear the wifi in my apartment has a personal vendetta against me. works fine for everyone else but drops the second i join a video call",
  "bought a houseplant last month. its already dying. i follow all the instructions but i think plants can sense my energy and theyre not into it",
  "anyone else think raisins in cookies should be illegal? biting into what you think is a chocolate chip cookie and getting a raisin is actual betrayal",
  "my 4 year old asked me where the sun goes at night and when i tried to explain she said 'thats boring' and walked away. fair honestly",
  "been trying to learn guitar for 6 months now and i can play exactly one song. its wonderwall. im sorry.",
  "i put my shirt on inside out this morning and didnt notice until lunch. nobody told me. i work in an office with 30 people.",
  "my uber driver just asked me if i believe in aliens and now were 20 minutes into the most intense debate of my life",
  "i googled my symptoms and webmd said i have 3 days to live so thats cool. its probably just allergies but who knows at this point",
  "just realized ive been paying for a gym membership for 8 months and ive gone exactly twice. both times i just sat in the sauna",
  "my mom still prints out directions from google maps. like on paper. with a printer. in 2026.",
  "someone at work asked me what i do for fun and i panicked and said 'laundry'. i dont even like laundry",
  "the amount of times ive typed 'sounds good!' in an email when nothing sounds good is honestly impressive",
  "i just sneezed so hard my back cracked and honestly it was the best thing thats happened to me all week",
  "my roommate eats cereal at 11pm every night like clockwork. i can hear the spoon hitting the bowl through the wall. its oddly comforting",
  "tried to parallel park today and after the 4th attempt i just drove to a different parking lot. some battles are not worth fighting",
  "i love how my phone autocorrects 'hell' to 'he'll' like no apple i meant what i said",
  "just had a staring contest with a squirrel outside my window and i think he won",
  "my friend said 'we should hang out soon!' 3 months ago and we still havent hung out. this is adult friendship i guess",
  "im at the age where i get excited about a new sponge for the kitchen. this is my life now",
  "accidentally liked someones instagram post from 2019 while stalking their profile. might have to move countries",
  "the audacity of my alarm clock going off every morning like i didnt specifically hate mornings yesterday too",
  "just watched my cat stare at a wall for 10 minutes straight. either hes seeing ghosts or hes having an existential crisis. relatable either way",
  "i told myself id go to bed early tonight and here i am at 1am reading wikipedia articles about the bermuda triangle",
  "my dentist asked if i floss daily and i lied with such confidence that i almost believed myself",
  "spent $40 on groceries to cook at home then ordered doordash anyway. i am the problem",
  "why does every recipe blog need a 2000 word essay about their childhood before telling me how to make pasta. just give me the recipe please",
  "i waved back at someone who wasnt waving at me and now i have to move to a new city",
  "my dog stepped on my laptop and somehow opened 47 tabs and changed my wallpaper. hes more tech savvy than my dad",
  "the wifi password at my parents house is still 'password123' and honestly i respect the commitment to chaos",
  "just found a french fry from last week in my coat pocket and honestly debated eating it for longer than id like to admit",
  "every time i say 'ill be there in 5 minutes' i am lying and we all know it",
  "my coworker signs every email with 'warm regards' and i cant tell if shes genuinely warm or passively aggressive",
  "tried to meal prep on sunday. by wednesday everything in the containers looked suspicious. back to sandwiches it is",
  "i was today years old when i found out you can peel a banana from the bottom and my whole life has been a lie",
  "my neighbor has been doing renovations for 6 months. at this point i think he's building a second house inside his house",
];

export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { success } = rateLimit(request, {
    limit: 20,
    windowMs: 60000,
    prefix: 'aih',
    globalLimit: 600,
    globalWindowMs: 3600000,
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Take a breather and try again.' },
      { status: 429 }
    );
  }

  try {
    const isAI = Math.random() < 0.5;

    if (!isAI) {
      const text = HUMAN_SENTENCES[Math.floor(Math.random() * HUMAN_SENTENCES.length)];
      return NextResponse.json({ text, answer: 'human' });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({
        text: 'The intersection of quantum mechanics and everyday life reveals fascinating patterns that challenge our understanding of reality itself.',
        answer: 'ai',
      });
    }

    recordCall('ai-or-human');

    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const rand = Math.floor(Math.random() * 99999);

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful writer. Write exactly 1-2 short sentences about the given topic. Be informative and natural. Do not use quotation marks around your response. Do not start with "Did you know" or similar clichés. Just state something interesting directly.',
        },
        {
          role: 'user',
          content: `Write 1-2 short sentences about: ${topic}. Seed: ${rand}`,
        },
      ],
      max_tokens: 100,
      temperature: 1.1,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      'Language models process tokens sequentially, applying attention mechanisms to weigh the relevance of each input element against all others in the sequence.';

    return NextResponse.json({ text, answer: 'ai' });
  } catch (error) {
    console.error('AI or Human API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong generating the round.' },
      { status: 500 }
    );
  }
}
