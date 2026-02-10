// Daily Story Capture Prompts - 30 Day Rotation

export interface StoryPrompt {
  day: number;
  category: 'today' | 'past' | 'people' | 'triggers' | 'open';
  prompt: string;
  followUp?: string;
}

export const STORY_PROMPTS: StoryPrompt[] = [
  // Week 1: TODAY Questions (Present Awareness)
  { day: 1, category: 'today', prompt: "What's one thing that happened today that surprised you - even a little?" },
  { day: 2, category: 'today', prompt: "Did you have any conversation today that made you think? What was said?" },
  { day: 3, category: 'today', prompt: "What moment today made you feel something - frustration, joy, curiosity, anything?" },
  { day: 4, category: 'today', prompt: "Did you notice anything today that others probably walked past?" },
  { day: 5, category: 'today', prompt: "What's something you learned today - from a sefer, a person, or an experience?" },
  { day: 6, category: 'today', prompt: "Was there a moment today where you had to make a choice? What did you choose?" },
  { day: 7, category: 'today', prompt: "What's one thing you saw today that you want to remember?" },

  // Week 2: PAST Questions (Memory Excavation)
  { day: 8, category: 'past', prompt: "Think of a teacher/rebbe. What's ONE thing they said or did that stuck with you?" },
  { day: 9, category: 'past', prompt: "What's a time you were wrong about something you were sure about?" },
  { day: 10, category: 'past', prompt: "Who's someone who believed in you? What did they do or say?" },
  { day: 11, category: 'past', prompt: "What's a place that holds a memory? Describe the place and what happened there.", followUp: "What do you see? What do you feel?" },
  { day: 12, category: 'past', prompt: "What's something difficult you went through that changed you?" },
  { day: 13, category: 'past', prompt: "When did you witness someone do the right thing when it would've been easier not to?" },
  { day: 14, category: 'past', prompt: "What's a question about life/Torah/Hashem that you wrestled with? Did you find an answer?" },

  // Week 3: PEOPLE Questions
  { day: 15, category: 'people', prompt: "Who taught you something without knowing they were teaching?" },
  { day: 16, category: 'people', prompt: "Think of your father/mother. What's one specific moment you remember?" },
  { day: 17, category: 'people', prompt: "Who's someone you admire? What specifically do you admire about them?" },
  { day: 18, category: 'people', prompt: "Think of a chavrusa or student. What moment stands out?" },
  { day: 19, category: 'people', prompt: "Who showed you what NOT to do? What did you learn?" },
  { day: 20, category: 'people', prompt: "Who surprised you - someone you misjudged, for better or worse?" },
  { day: 21, category: 'people', prompt: "Who do you wish you could thank? What would you say?" },

  // Week 4: SPECIFIC TRIGGERS
  { day: 22, category: 'triggers', prompt: "Think of a shul you've been in. What memory comes?" },
  { day: 23, category: 'triggers', prompt: "Think of a sefer. Is there one that changed how you think? What happened?" },
  { day: 24, category: 'triggers', prompt: "Think of a Shabbos. Any specific one stand out? Why?" },
  { day: 25, category: 'triggers', prompt: "Think of a simcha - wedding, bris, bar mitzvah. Any moment stay with you?" },
  { day: 26, category: 'triggers', prompt: "Think of a difficult time - illness, loss, hardship. What got you through?" },
  { day: 27, category: 'triggers', prompt: "Think of a trip or journey. What happened that was unexpected?" },
  { day: 28, category: 'triggers', prompt: "Think of food/a meal. Any meal carry a memory?" },

  // Days 29-30: OPEN
  { day: 29, category: 'open', prompt: "What keeps coming back to you that you haven't captured yet?" },
  { day: 30, category: 'open', prompt: "Look at your recent captures. What patterns do you see? What wants more attention?" },
];

export const CATEGORY_LABELS: Record<StoryPrompt['category'], string> = {
  today: 'Present Awareness',
  past: 'Memory Excavation',
  people: 'People',
  triggers: 'Specific Triggers',
  open: 'Open Reflection',
};

export const CATEGORY_COLORS: Record<StoryPrompt['category'], string> = {
  today: 'bg-blue-100 text-blue-800',
  past: 'bg-purple-100 text-purple-800',
  people: 'bg-green-100 text-green-800',
  triggers: 'bg-orange-100 text-orange-800',
  open: 'bg-gray-100 text-gray-800',
};

// Get today's prompt based on cycle
export function getTodaysPrompt(captureCount: number): StoryPrompt {
  const dayIndex = captureCount % 30;
  return STORY_PROMPTS[dayIndex];
}

// Get prompt by day number (1-30)
export function getPromptByDay(day: number): StoryPrompt | undefined {
  return STORY_PROMPTS.find(p => p.day === day);
}
