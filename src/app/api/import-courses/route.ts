import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Self-Esteem Foundations (from Self Esteem.pdf)
const selfEsteemCourse = {
  title: 'Self-Esteem Foundations',
  description: 'Understanding self-esteem, improving self-talk, accepting yourself, and building significance',
  source_type: 'pdf',
  segments: [
    {
      title: 'Your Strengths & The Value You Bring',
      content: `Before we begin building self-esteem, take stock of what you already have.

Good at:
1. Vision
2. Motivating people
3. Managing people
4. Persistent
5. Driven
6. Clarity / seek clarity
7. Seeing other perspectives
8. Being open to feedback & correct myself
9. Thoughtful
10. Writing Torah
11. Learning Torah
12. Sports
13. Understand the body language of others
14. Holding high standards
15. Resourceful
16. Thinking long term
17. Working well under pressure
18. Zoning in / focused
19. Balanced
20. Sensing when something is off

Value You Bring:
1. Motivate people to believe
2. Think ahead & build clarity
3. Know how to help a person
4. Growth
5. Help others
6. Adjust to situations
7. Sharpen other leaders
8. Help people
9. Help others believe
10. Long term & complete steps
11. Cut away the noise
12. Keep people on target
13. Build trust
14. Simplify systems

Reflection: Read through these lists slowly. Let each one land. These are real strengths.`,
    },
    {
      title: 'What is Self-Esteem?',
      content: `Self-esteem is how you look at yourself.

There are four aspects:
1. Do you love yourself?
2. Do you believe in yourself?
3. Do you value yourself?
4. Do you believe in your inherent worth?

Common Myths:
1. "You need to be better to have self-esteem" — Wrong. You have to TREAT yourself better.
2. "Your brain is wired with low self esteem" — There is no conclusive evidence to this.
3. "It's from your upbringing" — It's from you repeating what you learned as a child. YOU are the one doing it to yourself now.

Reflection: Which of the four aspects do you struggle with most? Where did you first learn to see yourself this way?`,
    },
    {
      title: 'How to Improve Self-Esteem',
      content: `Four ways to improve self-esteem:
1. Improve your relationship with self & how you talk to self
2. Do more things that you're not good at (test your limits)
3. Move towards uncertainty
4. Good relationships

How to Improve Self Talk:
Our default pattern is to attack ourselves, deny things of ourselves & even abuse ourselves with our words.

What is your negative talk? How do you treat yourself throughout the day? When you recognize it, it loses power (give it a name).

Common negative self-talk patterns:
1. "You never get what you want"
2. "You're not smart enough"
3. "You will never learn this"
4. "You will never be comfortable"
5. "You don't know how to make small talk"

Reflection: What are YOUR specific negative self-talk patterns? Write them down. Name each one.`,
    },
    {
      title: 'Why We Attack Ourselves & Perfectionism',
      content: `Why Do We Do This?
We do this since it's built in as a way to motivate ourselves so that we don't stay stagnant. We learn from a young age to motivate ourselves based on how others motivated us — that we need to do better in order to grow.

The problem: When we talk badly about ourselves, we don't like how it feels & this leads us to not want to try new things or get nervous to try. This DESTROYS your self-esteem & prevents you from actually growing.

You are naturally a good person. You don't have to beat yourself into being one.

PERFECTIONISM:
We give ourselves unrealistic expectations and not enough time to get there. We then put ourselves down for not reaching that goal.

The reason: We've experienced failure before and never want to feel that again. So we decide that if we're perfect, we won't have to go through that pain again.

The truth: Failure is part of success. Anyone who ever mastered something did it through failure. You have to learn how to fail if you want to succeed. And that starts with lowering your expectations.

Lowering expectations doesn't prevent accomplishing — it gives you a path so that you can reach your goal if you allow yourself to have patience.

Reflection: What unrealistic standards do you hold? (Look for "Should", "Always", "Never" in your thinking.)`,
    },
    {
      title: 'A New Approach — Commit to Treating Yourself Differently',
      content: `How do you get rid of all the negative self-talk?

You have to commit to treating yourself differently. You need to look at yourself:
1. With respect
2. With love
3. With patience
4. With compassion
5. With kindness
6. With honor

The first step is to DECIDE that you will change the way you treat yourself and not attack yourself. You won't buy into your critic's way of living. You have to be committed to it so that when you fall off, you have the commitment to fall back on.

Ask Yourself:
- What is your commitment?
- Why is it helpful to not criticize yourself?
- Why are you committed to treating yourself the way you want?
- What will it bring you in your life?

Reflection: Write out your commitment today. Make it personal and specific.`,
    },
    {
      title: 'How to Speak to Yourself — Real Kindness',
      content: `You need to give yourself real kindness. Real empathy.

If you're going through something big right now, pause and give yourself empathy for it.

If you're feeling like you're not good enough, slow down. Recognize how hard that is.

Don't jump to a pep talk. First, allow yourself to feel it. Acknowledge your emotions and respond to them with understanding and care.

Only then, when you've truly given yourself that space, can you begin to lift yourself back up.

Encourage yourself. Support yourself. Speak to yourself with praise, respect, and love.

Tell yourself: You're doing a good job.

Reflection: Today, when something doesn't go as planned, pause before reacting. Give yourself 30 seconds of genuine empathy before trying to "fix" anything.`,
    },
    {
      title: 'Seeing the Best in Yourself',
      content: `We don't focus on our strengths & we generally berate ourselves since we didn't do better.

Why do we push away praise & look at the negative?
This comes from the way we motivate ourselves — so that we get better & then we can get acceptance. A person who has everything can still look at himself based on what he is missing.

The truth: We excel by focusing on our strengths. We need to focus on what we are good at and let ourselves praise, compliment and sit in it.

What are your strengths? (3 things — What would others say about you?)
This gives you confidence which allows you to accomplish.

Are you able to let praise in and think about it? Do you allow positivity in?

We find ways to push away energy: "They don't really know me," "They're just saying this to manipulate me," "They're just being nice."

But what if they really meant it? Let that energy in and focus on it regularly.

Exercise: Make a list of your top five strengths and write "I know this because..." for each one. When you focus on your strengths, you give yourself the power to do it.`,
    },
    {
      title: 'Accept All of Yourself',
      content: `We say we will accept ourselves when we do something and then we can let go. The problem is that the bar keeps getting put further out.

What do you reject yourself for? The most common: feelings and results.

Results: You want a certain result and when you don't get it, you reject yourself.
Feelings: Since you feel how you don't want to feel, you reject yourself for feeling that way.

When you accept yourself, you allow yourself to fail. Failure is part of life.

You also have to shift how you view your feelings. We learn to distract ourselves from feelings by being busy, instead of slowing down and feeling.

It takes tremendous courage to take on your feelings. It's OK to feel how you do. You can be angry, anxious, worried — it's part of being a real person.

What we resist persists. When we allow ourselves to feel something, we are lighting a flame to burn it out. Feelings are an energy and they don't mean anything about you.

Reflection: What feelings are you currently pushing away? Can you sit with one of them for 2 minutes today without judging it?`,
    },
    {
      title: 'EFT Tapping for Self-Acceptance',
      content: `EFT (Emotional Freedom Technique) consists of three parts:
1. Tapping on points
2. Begin by saying words of acceptance for what you are experiencing
3. Breathe

How to practice:
- Start with what you notice the most
- If you are about to do something big, ask yourself how it makes you feel
- Give that feeling a number to rate its intensity, then begin tapping
- Focus on the feeling and describe what is happening

When you finish, the feeling may get weaker, stronger, or go away completely. It can also change to another feeling. Go with what is happening in the moment.

Key phrase: "Even if my critic is telling me I cannot do this, I still love and accept myself."

We are not forcing ourselves to love and accept who we are. Rather, we are sending a message that even if the inner critic is speaking, we still choose self-acceptance.

Then add support and encouragement:
- "I am open to the possibility that I can do well, that I can relax, that I can be good"
- "I choose to be on my own side regardless of how it goes"
- "It is okay to feel how I feel"

Reflection: Try one round of EFT today before a challenging moment. Rate your feeling before and after.`,
    },
    {
      title: 'Significance — Finding Real Pride',
      content: `We all need significance and we will get it either in a good way or a bad way.

Good way: Giving ourselves significance in the things that we are good at, focusing on our strengths.

Bad way: Not allowing yourself to feel good about your achievements and receiving significance by bringing others down. It doesn't last because it's not real.

Why do we do this? We tell ourselves we have to be number one in order to be significant. On a deeper level, we think that if we are number one then we will get what we always wanted — but we can get it without it. This is a cycle: we are trying to work to get something that we always had.

The path forward: Start by giving yourself pride for the small things, for the things that you do everyday.

What do you feel proud of?
What would you feel proud of if you wanted to?

The more you give yourself this, the more you will be motivated to grow and create the life that you want.

Reflection: Write down 3 things you did today that you can feel proud of — even small ones. Let yourself sit with that pride.`,
    },
  ],
};

// Self-Esteem Part 2 (from Self Esteem part 2.pdf)
const selfEsteemPart2Course = {
  title: 'Social Skills & Confidence',
  description: 'Master social skills, body language, conversation, friendships, groups, and building confidence',
  source_type: 'pdf',
  segments: [
    {
      title: 'Master Social Skills — Mindset',
      content: `Key principles before building social skills:

1. Talent is overrated — what matters most is practice.
2. Do not give up prematurely. Growth often looks like an upward climb, then a plateau, and then another climb.
3. Trust yourself. Deep down, you already have the ability to do this.
4. Be mindful of how you react to setbacks or bad results.
5. Rejection is inevitable. Not everyone will like you, and not every interaction will go well. This is normal and can actually help you grow.
6. Be willing to try new skills, even if they feel uncomfortable at first.
7. Be bold. Boldness is rewarded.

Reflection: Which of these 7 principles do you need to hear most right now? Why?`,
    },
    {
      title: 'Confident Body Language',
      content: `Two parts to how you present yourself: your body and your tone.

Poor body language makes conversation harder to get off the ground. You cannot just know what to do — you have to actually do it:

1. Stand tall. Imagine a string on top of your head gently pulling you upward. Practice by standing against a wall, then stepping away while keeping that posture.

2. Take up space. This shows that you belong where you are and that you are comfortable being present.

3. Smile. Use a slight smile to show that you are comfortable with who you are. Everyone appreciates when others like and approve of them.

4. Move with conviction. The more intent and purpose you have in your movement, the more strength you project. Walk with direction. Make full, deliberate gestures.

Practice today: Pick ONE of these four to focus on all day. Notice how it changes your interactions.`,
    },
    {
      title: 'Body Language Part 2 + AM Power Ritual',
      content: `More body language essentials:

1. Eye contact — Connect by showing you are interested in the conversation. Look the other person in the eyes when speaking. Practice by experimenting with making and holding eye contact in everyday interactions.

2. Talk louder — When we feel less confident, we tend to speak more quietly. Consciously raise your volume so your words carry.

3. Speak with authority — Since you are the one saying it, own your words. Speak clearly and with conviction.

AM POWER RITUAL:
All those who are successful do something in the morning that sets them up for the day. To create change, you need to begin with focus.

How to do it:
- Breathe deeply
- Bring yourself into a state of gratitude and appreciation — really feel it
- Connect to your inner power, awaken your boldness, and tap into your creativity
- Do NOT start the day in reaction mode
- Focus on three things in your life that you are grateful for and give them your full attention

Reflection: Set up your morning power ritual tomorrow. What 3 things are you grateful for?`,
    },
    {
      title: 'Create Engaging Conversation — Identity',
      content: `Mindset is key to setting yourself up for success.

Who you believe you are will determine your success. If you tell yourself that you are not good at conversations and give yourself reasons for it, it becomes part of your identity and that will limit you.

You will not try, you will put in only half the effort, or you will give up in the middle and confirm to yourself that you are not good at it.

The truth is, you can thrive and really enjoy conversations if you learn how to do it. We can all change and learn new skills — so why hold yourself back?

You can choose to say: "I am casual and comfortable in conversation. I am an effective communicator."

You have to decide how you want to be and how you want others to perceive you. Pick a few positive statements about yourself, tell yourself they are true, and practice living them until they become your reality.

Reflection: Write your new conversation identity. "I am ___." Say it to yourself 3 times today.`,
    },
    {
      title: 'Starting Conversations',
      content: `If you can casually and comfortably start conversations, think about how many doors will open for you in life.

To start conversations, you must take action. You cannot build confidence if you are passive. When you go to an event, make it a habit to immediately go and talk to someone. This leaves an imprint on your subconscious that this is what you do.

You must also be willing to drive a conversation — taking it somewhere, guiding it, and making decisions about its direction.

A simple way to start: Use the environment you are in. Make a statement or ask a question.
- Ask open-ended questions: "How was your experience?" or "Is this your first time here?"
- Notice details around you and think about what you could comment on
- Be bold, say what comes to mind

Remember: When you start a conversation, each person is in their own mental space. If you talk for a minute, you can bring them out of their bubble into the shared bubble you create.

Practice: Today, start one conversation with someone you wouldn't normally talk to.`,
    },
    {
      title: 'Creating Engaging Conversations — The Three R\'s',
      content: `Engaging conversations open the door to meaningful connections. A good conversation blends asking questions, making statements, and active listening.

Statements — The Three R's:
1. Restatement — Summarize what the person just said
2. Reflection — Speak to their feelings. State how a situation made them feel
3. Relating — Share something from your own experience that connects to theirs

Questions:
Follow your natural curiosity about a topic and let the conversation grow from there.
- Open-ended questions: Start with "how" or "what" to invite more detailed answers
- Closed questions: Can work well, but use them thoughtfully

Tip — Chunking up and chunking down:
You can break down conversation elements into categories (chunking up) or zoom in on specific details (chunking down). Example: Talking about cars → move up to transportation in general, or go deeper into a specific model.

Practice: In your next conversation, try using at least one of each R (Restate, Reflect, Relate).`,
    },
    {
      title: 'Four Layers of Connection',
      content: `You need to be able to enjoy conversations as they happen. There are four layers of connection:

1. Superficial — Safe, polite conversation. Not very connecting. You can start here but need to go deeper.

2. Safe personal data — "I work here," "I do this." Next level, but still not very connecting because it doesn't involve vulnerability.

3. Real emotions and values — Talking about things you genuinely feel strongly about. More vulnerable, gives insight into who you are. Ask: "Why do I like this?" "What is interesting about this to you?" Without emotion or passion, conversation will feel boring.

4. Authentic vulnerability — Sharing personal experiences that were truly difficult. This is where REAL connection happens. The fear is rejection, but if we always avoid that fear, we never reach real relationships.

Another key: Be passionate about what you are talking about. Be descriptive and enthusiastic. When you find your real self and put it out there, you will naturally attract people who are open to that connection.

Reflection: What layer do you usually stay at? What would it take to go one layer deeper?`,
    },
    {
      title: 'Your Friend Status & How to Make Friends',
      content: `When we are connected to people, we feel happier.

What does friendship mean to you? A friend is someone you enjoy being with, someone you can talk to and share with. Don't settle for relationships just because they are convenient. Choose friends who bring value and meaning into your life.

How to actually make friends:

1. Meet people — When you are in "friend mode," you can't stay isolated. Start by talking about things you like. Share your interests.

2. Do activities you already enjoy — Even if no one you know is doing them yet, go anyway. You'll naturally meet others drawn to the same things.

3. Use conversation skills — Friendships don't happen instantly. You'll notice different levels of connection with different people. Deeper friendships take time.

4. It's okay for friendships to end — Not every connection is meant to last forever, and that doesn't take away from its value.

Reflection: Are there activities you enjoy but haven't pursued because no one you know does them? Consider going anyway.`,
    },
    {
      title: 'Making Outstanding Friendships & Relationships',
      content: `What do you really want from a friendship? To laugh, to connect, to have someone there for you, someone you can talk to openly.

If you want that from a friend, you need to bring it yourself. Show up with loyalty, care, and openness.

Friendships grow through testing — notice how someone responds. Do they listen? Do they stand by you when it's not convenient? That is where trust is built.

To deepen a friendship: shared experiences. Going through things together creates a bond words alone can't.

Creating Outstanding Relationships:
Let go of the idea that relationships don't work. Most fail because people don't put in the effort.

You have to be willing to be seen by your partner. When you hold back, you weaken the connection. When you share openly, you invite closeness and trust.

Real love comes when you allow yourself to be vulnerable. Express yourself honestly. Be comfortable being who you are. Show love — say it, give it, live it.

Reflection: Think of one relationship you'd like to deepen. What is one vulnerable thing you could share?`,
    },
    {
      title: 'The Right Mindset for Groups',
      content: `Groups are a different level, a different game.

The most common mindset entering a group is FEAR — fear of being rejected, fear of not being wanted. But we can change our approach.

The key mindset: Assured Approval.
- Don't walk in looking for signs of disapproval
- Imagine people already want you there
- Tell yourself: "People want to talk to me, people are glad I am here"

Another shift: Think about how you greet a friend. You walk in warmly, with a smile. Approach groups the same way. People feel it subconsciously and respond in kind.

Ask yourself: What do you bring to this group? Everyone brings something — knowledge, personality, questions, or simply positive energy.

When entering a group, the most important thing is to make a clear decision. There is no right or wrong decision, so act with confidence and go for it.

Reflection: Before your next group interaction, set your mindset: "I belong here. People want me here."`,
    },
    {
      title: 'How to Join & Exit Groups',
      content: `JOINING A GROUP:
You cannot be passive. Do not stand on the outside waiting for an invitation.
- Assert yourself — you have the right to be there like everyone else
- Show up with confidence: good eye contact, strong voice, bold presence
- You can say: "I hate to interrupt, but I want to ask a question"
- Listen to what is being discussed, add yourself when there's a pause

BREAKING OUT OF LIMBO:
When you feel awkward at an event:
1. Identify the state you are in and disrupt the pattern
2. Breathe — focus on your breath and your feet to get out of your head
3. Expand your vision — hold out your fingers and notice how far you can see
4. Change your self-talk — tell yourself a new, more supportive story
5. Take action quickly — go engage with someone right away

EXITING A GROUP:
Give yourself permission to leave. A simple line works:
"It was great talking with you, I now have to..."

This shows that you value your own time and communicates confidence.

Practice: At your next event, join at least one group conversation. Use the "I hate to interrupt" line if needed.`,
    },
    {
      title: 'Being the Center of Attention',
      content: `Many people shy away from being the center of attention. But by doing so, we miss opportunities and hold ourselves back from reaching the next level.

To grow, you need leadership — you have to be willing to step into that space.

Often we let our self-criticism rise in these moments. We wait for permission instead of stepping forward. But to become a leader you have to claim your space. You have the right to be heard, and you matter.

Two main tools to engage people:

1. Non-verbal presence — Speak with volume, use gestures, carry yourself with confidence.

2. Storytelling — Stories draw people in. Use details, paint the scene, help others visualize it. Tap into the emotions, hold them, draw them out. Highlight what you learned, what was surprising, what makes it fascinating.

Think of great communicators like Tony Robbins or Les Brown — what sets them apart is not only what they say but how much energy and feeling they bring.

When you break through the fear, you discover that being the center of attention can actually be fun.

Reflection: Practice telling one story today with energy and detail. Don't hold back.`,
    },
    {
      title: 'Levels of Confidence & A Life of Confidence',
      content: `Where are you on the confidence scale?

1. Depressed/low self-esteem — feeling down and unworthy
2. Downhearted — sadness, loneliness, no hope for the future
3. A little hope — beginning to sense possibility
4. Questioning phase — searching for success, noticing small wins
5. Emerging confidence — starting to see yourself as capable, but still tension and anxiety
6. Confidence — able to interact from a place of strength, while still challenging yourself
7. Balanced confidence — living with ease, knowing yourself, stable even during setbacks
8. Deep confidence — a settled sense of self, inner bounce, fully identifying with who you've become

You can move between these levels at different times. Notice where you spend most of your time.

A LIFE OF CONFIDENCE:
Confidence is not just about feeling good — it is about DIRECTION. To live with confidence, you need a goal and commit to actions that align with who you are.

The question: Am I fulfilling my potential?

Reflection: Where are you right now on this scale? Where do you want to be? What is one thing you can do today to move one level up?`,
    },
  ],
};

// Bonus Self-Esteem (from Bonus Self Esteem.pdf)
const bonusCourse = {
  title: 'Bonus: Conversation Mastery & Self-Acceptance',
  description: 'Seven tips for conversation mastery, party confidence, and radical self-acceptance',
  source_type: 'pdf',
  segments: [
    {
      title: 'Seven Tips — Transform "I Am" & Model Success',
      content: `TIP 1: Transform the "I Am"
If you think of yourself as awkward or not good at conversation, that belief shapes how you act. Change your self-definition. Instead of "I am bad at this," imagine the kind of conversationalist you want to become. Then practice. Most of a good conversation happens in your mindset and preparation before you even speak.

TIP 2: Adopt a Modeling Mindset
When you see someone confident, don't feel small in comparison. Study what they are doing that makes them effective. Ask: what habits, tone, or body language are they using that I can learn from? This is called modeling. At the same time, develop flexibility — conversations require you to adapt, take small risks, and try different approaches.

Reflection: Who is someone you admire for their conversation skills? What specifically do they do that you can model?`,
    },
    {
      title: 'Seven Tips — Active, Questions & Sharing',
      content: `TIP 3: Shift from Passive to Active
Don't sit back and hope conversation unfolds on its own. Take the lead. Ask questions, bring up topics, steer the direction. Being active means participating fully instead of waiting passively.

TIP 4: Engage with Questions
Questions shape the flow and build real connection. Listen closely, then ask follow-ups that show genuine curiosity. Treat the person as if you are already friends. In the beginning most people feel awkward, but with persistence the dialogue becomes natural.

TIP 5: Ask and Share Information
A good conversation is not an interview. Balance questions with sharing your own experiences, stories, or insights. This builds trust and keeps things flowing naturally.

Practice: In your next 3 conversations, consciously balance asking and sharing.`,
    },
    {
      title: 'Seven Tips — Starters & Joining Groups',
      content: `TIP 6: Use Starters and Momentum
Every conversation needs a spark. Have a few conversation starters ready — something light, situational, or personal. Your goal is to get past the first minute, because once the ball is rolling, it's much easier to maintain momentum.

TIP 7: Learn to Join Groups
Watch the dynamic and notice who is leading. Focus your attention there, then add a comment or question that connects to what is being said. Remind yourself that they would probably enjoy including you. Politely say "I do not want to interrupt," then step in with confidence.

Becoming a conversation master is not overnight. It requires consistent practice and investment of time. The more you apply these tools, the more natural conversations become.

Practice: Prepare 3 conversation starters before your next social event.`,
    },
    {
      title: '3 Ways to Enjoy a Party When You Are Shy',
      content: `Parties can feel overwhelming if you're shy. The key is to shift your mindset.

1. Be a Leader in Your Own Life
Most people at a party are also looking around, unsure. When you take initiative, you create momentum. Before you go in, decide what you want — connection, fun, or even just practice. Take action: introduce yourself, start conversations, join an activity.

2. Ask the Right Questions
Come prepared with a few questions that can spark conversation. Keep them open and genuine. Turn down your inner filter. When you ask sincerely and listen closely, conversations feel natural.

3. Focus on What Went Right
After a party, don't replay every awkward moment. Train your mind to focus on what worked:
- What did I do differently this time?
- What three things did I enjoy?
- What small steps showed I was improving?

Two Techniques to Let Go of Negative Thoughts:
- Breathe and Release: Close eyes, deep breath, exhale with a sigh, tell yourself "Who cares."
- Catch and Release: Notice the replay, label it, take a breath, return to present. Like releasing a fish — acknowledge it, then let it go.

Reflection: After your next social event, write down 3 things that went RIGHT.`,
    },
    {
      title: 'Three Elements of Engaging Conversation & Radical Self-Acceptance',
      content: `THREE ELEMENTS OF ENGAGING CONVERSATION:

1. What you say — The words themselves, questions and statements
2. How you listen — How present and attentive you are
3. How you look — Your nonverbal communication, expressions, body language

When we try to start a conversation and fear rejection, we can either push forward and continue engaging, or give up. Choose to push forward.

RADICAL SELF ACCEPTANCE:
1. Fire Your Critic — Change how you talk to yourself
2. Identity Change — What identity do you want? Decide it and live it.

These are the foundations. Fire the critic that has been running the show. Choose your identity deliberately instead of accepting the one you were given by circumstance.

Reflection: What identity have you been carrying that you didn't choose? What identity do you WANT? Write it down and commit to it.`,
    },
  ],
};

// Affirmations (from Affirmations.pdf)
const affirmationsCourse = {
  title: 'Daily Affirmations',
  description: 'Personal affirmations connecting to purpose, identity, and self-worth',
  source_type: 'text',
  segments: [
    {
      title: 'Purpose & Identity Affirmations',
      content: `Read these slowly. Let each one land. Say them out loud.

• Hashem is unlimited, guiding every detail of the world. My effort is only hishtadlus — the outcome is entirely up to Him.

• My task is to focus on what I'm doing in this moment, be present and have the awareness that each mitzvah connects me to Hashem.

• Through my actions, I am bringing kedusha into the world, helping uplift and repair it with every small step.

• Connecting to Hashem, Who is unlimited, is the best thing for me physically and spiritually.

• My identity is a warrior for Hashem — fighting the physical world and elevating it to become spiritual.`,
    },
    {
      title: 'Self-Worth Affirmations',
      content: `Read these slowly. Let each one land. Say them out loud.

• I am worthy. I am loved. I love myself. Hashem loves me.

• I am good exactly as I am. I can breathe, relax, and allow myself to simply be.

• I am grounded. I do not need anything external to complete me. I am grateful to be me.

• I am holy. Each step I take has purpose and is mesakein something in this world.

• I am blessed to be part of Klal Yisroel.

Take a moment now to breathe. Let these truths settle in. They are not aspirations — they are reality.`,
    },
  ],
};

async function importCourse(course: typeof selfEsteemCourse) {
  // Upsert the course
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('title', course.title)
    .single();

  let courseId: string;

  if (existing) {
    courseId = existing.id;
    // Delete old segments
    await supabase.from('course_segments').delete().eq('course_id', courseId);
    // Update course
    await supabase
      .from('courses')
      .update({
        description: course.description,
        source_type: course.source_type,
        total_segments: course.segments.length,
      })
      .eq('id', courseId);
  } else {
    const { data: newCourse, error } = await supabase
      .from('courses')
      .insert({
        title: course.title,
        description: course.description,
        source_type: course.source_type,
        total_segments: course.segments.length,
      })
      .select()
      .single();
    if (error || !newCourse) return { error: error?.message || 'Failed to create course' };
    courseId = newCourse.id;
  }

  // Insert segments
  const segments = course.segments.map((seg, i) => ({
    course_id: courseId,
    segment_number: i + 1,
    title: seg.title,
    content: seg.content,
    completed: false,
  }));

  const { error: segError } = await supabase.from('course_segments').insert(segments);
  if (segError) return { error: segError.message };

  return { courseId, title: course.title, segments: segments.length };
}

export async function POST() {
  const results = [];

  for (const course of [selfEsteemCourse, selfEsteemPart2Course, bonusCourse, affirmationsCourse]) {
    const result = await importCourse(course);
    results.push(result);
  }

  // Also add affirmations as rituals
  const affirmationRituals = [
    {
      name: 'Morning Affirmations — Purpose & Identity',
      description: 'Read purpose & identity affirmations slowly and out loud',
      category: 'affirmation',
      frequency: 'daily',
      content: 'Hashem is unlimited, guiding every detail of the world. My effort is only hishtadlus. My task is to focus on what I\'m doing in this moment. Through my actions, I am bringing kedusha into the world. My identity is a warrior for Hashem.',
      sort_order: 1,
      active: true,
    },
    {
      name: 'Morning Affirmations — Self-Worth',
      description: 'Read self-worth affirmations slowly and out loud',
      category: 'affirmation',
      frequency: 'daily',
      content: 'I am worthy. I am loved. I love myself. Hashem loves me. I am good exactly as I am. I am grounded. I am holy. I am blessed to be part of Klal Yisroel.',
      sort_order: 2,
      active: true,
    },
    {
      name: 'AM Power Ritual',
      description: 'Breathe deeply, gratitude, connect to inner power, awaken boldness',
      category: 'meditation',
      frequency: 'daily',
      content: 'Breathe deeply. Bring yourself into a state of gratitude — really feel it. Connect to your inner power. Focus on three things you are grateful for.',
      sort_order: 0,
      active: true,
    },
  ];

  for (const ritual of affirmationRituals) {
    const { data: existingRitual } = await supabase
      .from('rituals')
      .select('id')
      .eq('name', ritual.name)
      .single();

    if (!existingRitual) {
      await supabase.from('rituals').insert(ritual);
    }
  }

  return NextResponse.json({
    success: true,
    courses: results,
    message: 'Imported 4 courses and 3 daily rituals from Self-Improvement PDFs',
  });
}
