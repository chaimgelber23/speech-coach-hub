const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Borrowed stories data
const borrowedStories = [
  {
    title: "The Sleeping Student",
    content: `There's a story in the Gemara about a student who fell asleep in shiur. Now, you'd expect the rebbe to be upset, right? But Rabban Yochanan ben Zakkai wakes him up gently and asks what he was just teaching. The student has no idea - totally blanked out. And here's what gets me: instead of embarrassing him, the rebbe says, 'I see you weren't sleeping. You were traveling to other worlds.' He gave him an out. He preserved his dignity.`,
    source: "chazal",
    tags: ["dignity", "kindness", "teaching"],
    topics: ["bein adam lchaveiro", "chinuch", "benefit of doubt", "kovod habriyos"],
    setup: "Have you ever caught someone doing something embarrassing? What do you do in that moment?",
    core_point: "Protect someone's dignity even when they've done something wrong.",
    gemara_reference: "Sukkah 28a"
  },
  {
    title: "Hillel on the Roof",
    content: `Hillel was dirt poor. Couldn't even afford the half-dinar to get into the beis midrash. So what does he do? He climbs up on the roof in the middle of winter, lies down by the skylight, and listens from there. Snow starts falling. He's freezing. He doesn't move. The next morning, Shemaya and Avtalyon look up and see something blocking the light. They go up and find Hillel, half-frozen, covered in three amos of snow. And what do they say? 'This one is worth breaking Shabbos for.' Not 'why didn't you just ask for help?' Not 'that was stupid.' They saw what mattered: someone who wanted Torah so badly, nothing could stop him.`,
    source: "chazal",
    tags: ["persistence", "desire", "obstacles"],
    topics: ["torah learning", "overcoming obstacles", "no excuses", "poverty"],
    setup: "What would you do for something you really wanted? I mean really wanted.",
    core_point: "When you really want something, you find a way. Excuses fall away.",
    gemara_reference: "Yoma 35b"
  },
  {
    title: "The 400 Zuz Question",
    content: `There's this guy in the Gemara who bets 400 zuz - a lot of money - that he can make Hillel angry. So he picks the worst time: Erev Shabbos, Hillel is in the middle of washing his hair, getting ready for Shabbos. The guy keeps coming back with the most ridiculous questions. 'Why are Babylonians' heads round?' Hillel answers calmly. 'Why are Africans' feet wide?' Hillel answers again. Back and forth. Finally, the guy loses it and says, 'I bet 400 zuz I could make you angry!' And Hillel - still calm - says something I'll never forget: 'Better you should lose 400 zuz, and another 400 zuz, than Hillel should lose his temper.' He valued his character more than any amount of money.`,
    source: "chazal",
    tags: ["anger", "character", "self-control"],
    topics: ["middos", "anger management", "self-control", "difficult people"],
    setup: "What's your breaking point? Everyone has one, right?",
    core_point: "Your character is worth more than any external reward.",
    gemara_reference: "Shabbos 31a"
  },
  {
    title: "The Convert on One Foot",
    content: `A guy comes to Shammai and says, 'I want to convert, but only if you can teach me the entire Torah while I stand on one foot.' Shammai - understandably - pushes him away. This is ridiculous. The Torah has 613 mitzvos, centuries of wisdom, infinite depth. One foot? So the guy goes to Hillel. And Hillel converts him. He says: 'What is hateful to you, do not do to your fellow. That's the whole Torah. The rest is commentary. Now go learn.' Think about that. He didn't say the man was wrong to ask. He didn't say Torah can't be summarized. He found the seed that everything else grows from.`,
    source: "chazal",
    tags: ["essence", "teaching", "conversion"],
    topics: ["what is torah about", "bein adam lchaveiro", "essence of mitzvos", "kiruv"],
    setup: "If you had to explain all of Judaism in one sentence, what would you say?",
    core_point: "Every complex system has a core principle. Find it, and everything else makes sense.",
    gemara_reference: "Shabbos 31a"
  },
  {
    title: "Rabbi Akiva's Beginnings",
    content: `Rabbi Akiva was a shepherd. An am ha'aretz. Forty years old and couldn't even read aleph-beis. One day he's by a stream and sees a rock with a hole worn right through it. Just from water dripping. And he has this thought: 'Water is soft. Stone is hard. But drop by drop, over time, water wins. If water can do that to stone... Torah can do that to me.' He goes home. Sits down with the little kids learning their letters. Starts from zero. At forty. And this man becomes Rabbi Akiva - 24,000 students, one of the greatest minds in our history. It started with a rock and some water.`,
    source: "chazal",
    tags: ["transformation", "persistence", "starting over"],
    topics: ["never too late", "teshuva", "personal growth", "baal teshuva"],
    setup: "Have you ever felt like it's too late? Too late to start learning, too late to change?",
    core_point: "Consistent small efforts, over time, can transform anything.",
    gemara_reference: "Avos d'Rabbi Nosson 6"
  },
  {
    title: "The Fox and the Fish",
    content: `The Romans had outlawed Torah study. Death penalty. And Rabbi Akiva is out there teaching publicly. His friend Pappus says, 'Are you crazy? Aren't you afraid?' Rabbi Akiva tells him a story. A fox sees fish darting around, trying to escape fishermen's nets. The fox says, 'Hey fish! Come up here on land. We'll be safe together.' The fish answer: 'You're supposed to be the clever one? If we're scared in water - where we LIVE - imagine how scared we'd be on land, where we DIE.' Rabbi Akiva looks at Pappus and says, 'Torah is our water. Yes, there's danger in learning. But without Torah? That's not safety. That's death.'`,
    source: "chazal",
    tags: ["purpose", "survival", "meaning"],
    topics: ["why learn torah", "mesiras nefesh", "meaning", "jewish identity"],
    setup: "When things get hard, the instinct is to pull back, right? Protect yourself. Play it safe.",
    core_point: "Running from your purpose isn't safety - it's a slower death.",
    gemara_reference: "Berachos 61b"
  },
  {
    title: "The Laughing Rabbi",
    content: `Four great rabbis are walking through the ruins of Jerusalem after the destruction. They get to where the Temple stood - the holiest place on earth - and a fox runs out. Three of them start crying. Rabbi Akiva starts laughing. They're like, 'What is wrong with you? A fox is walking where only the Kohen Gadol could enter!' And Rabbi Akiva says something brilliant: 'There was a prophecy that this place would become so desolate, foxes would walk here. I just watched it come true - exactly. Word for word. If THAT prophecy came true exactly, then the prophecy that says old men and women will sit peacefully in Jerusalem's streets? That's coming true too.' The same precision that brought destruction guarantees the redemption.`,
    source: "chazal",
    tags: ["hope", "prophecy", "perspective"],
    topics: ["emunah", "jewish history", "tisha bav", "redemption"],
    setup: "When everything falls apart, how do you find hope? Not fake hope - real hope based on something solid.",
    core_point: "If the dark prophecies came true exactly, the light ones will too.",
    gemara_reference: "Makkos 24b"
  },
  {
    title: "The Oven of Achnai",
    content: `There's an argument in the Gemara about whether a certain oven is kosher. Rabbi Eliezer says yes, everyone else says no. Rabbi Eliezer is so sure he's right, he calls on miracles. 'If I'm right, let that tree uproot itself.' The tree flies across the field. They say, 'We don't take proof from trees.' 'Let the river flow backward.' It does. 'We don't take proof from rivers.' Finally he says, 'Let a voice from Heaven prove it.' A voice booms down: 'Rabbi Eliezer is right!' And Rabbi Yehoshua stands up and says, 'Lo bashamayim hi - the Torah is not in Heaven anymore. You gave it to us. WE decide.' And you know what Hashem's response was? He laughed and said, 'My children have defeated Me.' Not angry. Proud. Like a father whose kid finally grew up enough to argue back.`,
    source: "chazal",
    tags: ["torah", "independence", "relationship"],
    topics: ["what is torah learning", "relationship with hashem", "mesorah", "halacha"],
    setup: "What happens when you disagree with God? I mean literally - what if you're sure you're right and a voice from Heaven says you're wrong?",
    core_point: "Torah was given to humans to interpret. Our genuine engagement is what Hashem wants.",
    gemara_reference: "Bava Metzia 59b"
  },
  {
    title: "Nachum Ish Gam Zu",
    content: `There's a man in the Gemara named Nachum. They call him 'Ish Gam Zu' - 'the Gam Zu man' - because no matter what happened to him, he'd say 'Gam zu l'tovah - this too is for good.' The Jews need to send a gift to the Roman Emperor. Delicate diplomatic mission. They pick Nachum because miracles seem to follow him around. He's carrying a chest of jewels. Stays at an inn. While he sleeps, the innkeepers steal the jewels and fill the chest with dirt. He gets to Rome, opens the chest in front of the Emperor, and it's... dirt. This is a death sentence. And Nachum says, 'Gam zu l'tovah.' The Emperor thinks he's being mocked. But then Eliyahu shows up, disguised as an officer, and whispers, 'Maybe this is the miraculous dirt of Avraham that turns into arrows?' They test it - it works - Rome wins a war they were losing. The Emperor fills Nachum's chest with gold.`,
    source: "chazal",
    tags: ["faith", "trust", "perspective"],
    topics: ["emunah", "bitachon", "setbacks", "hidden blessings"],
    setup: "When something goes wrong - really wrong - what's your first reaction?",
    core_point: "You can't always see how something will turn out for good - but trusting it changes how you experience it.",
    gemara_reference: "Taanis 21a"
  },
  {
    title: "Rebbe and the Calf",
    content: `Rebbe - Rabbi Yehuda HaNasi, the compiler of the Mishnah - one of the greatest leaders we ever had. A calf is being led to slaughter and somehow breaks free. It runs to Rebbe and hides its head in his robe, crying. Rebbe looks at it and says, 'Go. This is what you were created for.' Technically true. But the Gemara says because he didn't show compassion in that moment, years of suffering came upon him. Years later, his maid is sweeping the house and is about to sweep away some baby weasels. Rebbe stops her: 'Leave them. Hashem's mercy extends to all His creatures.' And his suffering ended. Same man. Two moments. In one he was right but cold. In one he was warm. That made all the difference.`,
    source: "chazal",
    tags: ["compassion", "mercy", "consequences"],
    topics: ["rachamim", "when being right isnt enough", "middos", "animals"],
    setup: "Have you ever been technically right about something but still felt like you handled it wrong?",
    core_point: "Being right doesn't excuse being cold. Mercy matters even when it's inconvenient.",
    gemara_reference: "Bava Metzia 85a"
  },
  {
    title: "The Baal Shem Tov's Melody",
    content: `There's a story about the Baal Shem Tov on Yom Kippur. Everyone's davening - the holiest day, everyone knows the words, the tunes, the meaning. And there's this shepherd boy in the back. He can't read Hebrew. He doesn't know the prayers. He's sitting there for hours feeling useless while everyone else is connecting to Hashem. Finally, he can't take it anymore. He pulls out his shepherd's flute and starts playing. Just a simple tune - the melody he plays to his sheep. People are horrified. It's YOM KIPPUR. No music! But the Baal Shem Tov raises his hand. He says, 'All day we've been praying, but the gates of Heaven were locked. This boy's pure tune - from his heart, with no pretense - that's what finally opened them.' The one who knew the least gave the most.`,
    source: "heard",
    tags: ["sincerity", "prayer", "simplicity"],
    topics: ["tefillah", "simple jews", "yom kippur", "heart vs head"],
    setup: "Have you ever felt like you didn't belong somewhere religious? Like everyone else knows what they're doing?",
    core_point: "Sincerity reaches where knowledge can't.",
    gemara_reference: "Chassidic tradition"
  },
  {
    title: "The Chofetz Chaim's Store",
    content: `The Chofetz Chaim - the gadol hador, author of the Mishnah Berurah, leader of world Jewry - ran a little grocery store with his wife. And he was fanatical about honesty. If he thought he maybe overcharged someone a few pennies - not definitely, maybe - he would track them down to return the money. If he couldn't find them, he'd set aside the money for tzedakah. And here's my favorite part: a customer comes in, wants to buy something, and the Chofetz Chaim says, 'I've already made enough profit for today. Come back tomorrow.' Who does that? Who turns away business? But to him, taking more than you need - even when it's technically allowed - felt wrong.`,
    source: "heard",
    tags: ["honesty", "integrity", "beyond the law"],
    topics: ["honesty in business", "middos", "lifnim mishuras hadin"],
    setup: "What's the difference between being honest and being a person of integrity?",
    core_point: "True integrity means holding yourself to a higher standard than required.",
    gemara_reference: "Stories of the Chofetz Chaim"
  },
  {
    title: "Rav Moshe and the Pushka",
    content: `Someone once watched Rav Moshe Feinstein - the posek hador, probably the greatest halachic authority of the 20th century - walking through a shul putting money in every single pushka. There were like twenty of them. Some were probably for the same organization. The person asked him, 'Rebbi, why put in every one? Some of these are duplicates.' And Rav Moshe said something I think about all the time: 'When I see a pushka, I feel something - a pull to give. If I don't act on it right now, that feeling will pass. The tzedakah box will still be there tomorrow, but that moment of inspiration won't be. I'm not just giving money - I'm capturing the inspiration before it fades.'`,
    source: "heard",
    tags: ["inspiration", "action", "tzedakah"],
    topics: ["seizing the moment", "tzedakah", "spiritual growth", "procrastination"],
    setup: "Have you ever felt inspired to do something good - and then the moment passed?",
    core_point: "Act on inspiration immediately - it doesn't last.",
    gemara_reference: "Stories of Rav Moshe Feinstein"
  },
  {
    title: "The Maggid and the Peasant",
    content: `Someone once asked a Maggid - a traveling preacher - why he always taught through stories. Why not just say the point directly? The Maggid answered with, of course, a story. He said: 'Truth was wandering from town to town, but no one would let him in. He was naked, you see, and people don't like looking at naked truth. It's uncomfortable. One day Truth met Parable on the road. Parable was wearing beautiful clothes. "Why won't anyone let me in?" Truth asked. Parable said, "Put on some clothes." He gave Truth a beautiful cloak. And from then on, Truth and Parable traveled together. Everywhere they went, doors opened.' That's why we tell stories. Raw truth is too hard to look at. We need to dress it up first.`,
    source: "heard",
    tags: ["stories", "teaching", "truth"],
    topics: ["why tell stories", "teaching methods", "kiruv"],
    setup: "Can I tell you why I love stories so much?",
    core_point: "Stories make truth accessible in a way that direct teaching can't.",
    gemara_reference: "Chassidic tradition"
  },
  {
    title: "The Alshich and the Am Ha'aretz",
    content: `The Alshich - a great Rav in Tzfas - used to give incredibly deep drashot. Serious lomdus. One day he notices the same simple Jew in his audience, week after week. This guy clearly doesn't understand a word - he's an am ha'aretz, never learned. After months of this, the Alshich asks him: 'Why do you keep coming? You can't understand what I'm saying.' And the man answers: 'You're right, Rebbe. I don't understand anything. But I figure this: I'm sitting here listening to Torah. Maybe I don't get it now. But when I get to Olam Haba, I'll ask Hashem to explain it all to me. And He will.' The Alshich was so moved by this answer that he blessed him - and from that day on, the man understood everything.`,
    source: "heard",
    tags: ["showing up", "faith", "persistence"],
    topics: ["why come to shiur", "simple faith", "lishmah"],
    setup: "Why would anyone sit through something they don't understand?",
    core_point: "Sometimes showing up is the whole point, even if you don't understand.",
    gemara_reference: "Traditional story"
  }
];

async function importStories() {
  console.log('Starting import of borrowed stories...\n');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const story of borrowedStories) {
    // Check if story already exists
    const { data: existing } = await supabase
      .from('stories')
      .select('id')
      .eq('title', story.title)
      .single();

    if (existing) {
      console.log(`⏭️  Skipping "${story.title}" (already exists)`);
      skipped++;
      continue;
    }

    // Insert the story
    const { error } = await supabase
      .from('stories')
      .insert({
        title: story.title,
        content: story.content,
        source: story.source,
        tags: story.tags,
        topics: story.topics
      });

    if (error) {
      console.error(`❌ Error importing "${story.title}":`, error.message);
      errors++;
    } else {
      console.log(`✅ Imported "${story.title}"`);
      imported++;
    }
  }

  console.log('\n--- Import Complete ---');
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
}

importStories().catch(console.error);
