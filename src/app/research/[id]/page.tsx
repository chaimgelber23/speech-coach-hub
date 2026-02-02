'use client';

import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import DocumentViewer from '@/components/research/DocumentViewer';
import DocumentEditor from '@/components/research/DocumentEditor';
import CommentPanel from '@/components/research/CommentPanel';
import SectionNav from '@/components/research/SectionNav';
import type { Comment } from '@/types';

// Demo research content (would come from Supabase)
const demoContent = `# Kiddush on Friday Night — Deep Research

> Comprehensive knowledge base. Real sources inside. Learn this. Own this.

---

## 1. THE CUSTOM — What Kiddush Looks Like

Friday night. Family comes home from shul. Table set — white tablecloth, challah covered with a second cloth on top (SA OC 271:9 — cloth below AND above the bread), candles lit. The one leading Kiddush stands (for Vayechulu), takes a cup of wine in his right hand (Rambam Hilchos Shabbos 29:6), and recites Kiddush. Everyone listens. They drink, wash for bread, and begin the Shabbos meal.

**Key customs and variations:**
- **Standing vs. sitting:** The Arizal stands for the entire Kiddush out of respect for Shabbos. The Rema says standing is permitted but sitting is preferable — sitting creates a "keviyus" (established setting) which is better for being motzi others.
- **Looking at candles:** The Rema says to look toward the Shabbos candles during Kiddush. (SA OC 271:10)
- **The cup:** Hold in right hand, elevated at least a tefach (handbreadth) above the table. Rinsed inside and outside. (Rambam 29:6)

## 2. HALACHOS — Comprehensive

### 2A. The Source and Nature of the Obligation

**Torah source:** "Zachor es yom haShabbos l'kadsho" — Remember the Shabbos day to sanctify it (Shemos 20:8, the Fourth of the Ten Commandments).

**Rambam (Hilchos Shabbos 29:1):** "It is a positive Torah commandment to sanctify the Shabbos day with words — words of praise and holiness at its entrance and its departure."

**The wine is d'Rabbanan:** The Sages ordained that this verbal sanctification be done specifically over wine (Rambam 29:5). If you have no wine and no bread, you can still fulfill the Torah obligation by saying the words alone.

### 2B. The Cup

| Requirement | Details |
|---|---|
| **Size** | At least a revi'is (quarter-log). Standard: ~4.4 oz. |
| **Fullness** | Must be full. Up to ¼ inch below rim is ok. |
| **Condition** | Should not be cracked or broken. |
| **Preparation** | Rinsed inside and outside. |

## 3. THE REASONING — Why Kiddush?

**Sefer HaChinuch (Mitzvah 31):** By verbally declaring the holiness of Shabbos, we implant in our hearts the foundational belief that Hashem created the world. Shabbos is the "os" — the sign between Hashem and Israel.

**Rambam (Guide for the Perplexed 2:31):** Shabbos serves two purposes: rest for the body and a reminder of Creation. Kiddush is the verbal anchor that ties the physical rest to its spiritual meaning.

## 4. WHAT WE SAY — The Text

**Vayechulu:**
וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל צְבָאָם

"The heavens and earth were completed, and all their hosts."

**Borei Pri HaGafen:**
בָּרוּךְ אַתָּה ה' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן

**The Kiddush Bracha itself:**
בָּרוּךְ אַתָּה ה'... אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְרָצָה בָנוּ

## 5. CHAZAL — Teachings of the Sages

**Gemara Pesachim 106a:** "Zachor es yom haShabbos l'kadsho" — remember it over wine. From here we learn that Kiddush is said over a cup of wine.

**Gemara Shabbos 119b:** Rav Hamnuna said: Anyone who prays on Friday evening and says Vayechulu — it's as if he became a partner with Hashem in the creation of the world.

## 6. MACHSHAVA — Deeper Meaning

**Maharal (Tiferes Yisrael ch. 40):** Shabbos is not merely a day of rest but the PURPOSE of creation. The week exists for Shabbos, not the other way around. Kiddush is the moment we verbally recognize that purpose.

**Sefas Emes (Bereishis 5631):** Through Kiddush we are "mekadesh" — separating and elevating. Just as Hashem separated the seventh day, we separate ourselves from the mundane through the act of verbal sanctification.`;

const demoComments: Comment[] = [
  {
    id: '1',
    document_id: '1',
    section_id: '1-the-custom--what-kiddush-looks-like',
    content: 'This is a great opening. Very visual and grounding. Maybe add a personal memory of Kiddush to make it even more relatable.',
    comment_type: 'great',
    resolved: false,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: '2',
    document_id: '1',
    section_id: '2-halachos--comprehensive',
    content: 'This section is dense. Need to pick the 3-5 most important halachos for the chavrusa and save the rest for reference.',
    comment_type: 'simplify',
    resolved: false,
    created_at: '2026-01-20T10:15:00Z',
  },
  {
    id: '3',
    document_id: '1',
    section_id: '3-the-reasoning--why-kiddush',
    content: 'Need a story here. Something about why verbal declaration matters — maybe a personal experience of how saying something out loud changed how you felt about it.',
    comment_type: 'add-story',
    resolved: false,
    created_at: '2026-01-21T14:00:00Z',
  },
  {
    id: '4',
    document_id: '1',
    section_id: '5-chazal--teachings-of-the-sages',
    content: 'The "partner in creation" Gemara is powerful. How do we make this land? Need to build up to it so they feel the weight of it.',
    comment_type: 'question',
    resolved: false,
    created_at: '2026-01-22T09:00:00Z',
  },
];

export default function ResearchDocPage() {
  const [comments, setComments] = useState(demoComments);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(demoContent);

  function addComment(sectionId: string, text: string, type: Comment['comment_type']) {
    const newComment: Comment = {
      id: String(Date.now()),
      document_id: '1',
      section_id: sectionId,
      content: text,
      comment_type: type,
      resolved: false,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
  }

  function resolveComment(id: string) {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  }

  const sectionCommentCounts: Record<string, number> = {};
  comments
    .filter((c) => !c.resolved)
    .forEach((c) => {
      sectionCommentCounts[c.section_id] = (sectionCommentCounts[c.section_id] || 0) + 1;
    });

  const sectionComments = selectedSection
    ? comments.filter((c) => c.section_id === selectedSection)
    : [];

  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/research">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <Header
            title="Kiddush on Friday Night"
            description="Deep Research"
          />
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Eye size={16} className="mr-1" /> View Mode
            </>
          ) : (
            <>
              <Edit3 size={16} className="mr-1" /> Edit Mode
            </>
          )}
        </Button>
        <Badge variant="outline">
          {comments.filter((c) => !c.resolved).length} open comments
        </Badge>
      </div>

      <div className="flex gap-4">
        {/* Table of Contents */}
        <div className="w-48 shrink-0 hidden lg:block">
          <SectionNav
            content={content}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            commentCounts={sectionCommentCounts}
          />
        </div>

        {/* Document Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <DocumentEditor
              content={content}
              onChange={setContent}
            />
          ) : (
            <DocumentViewer
              content={content}
              selectedSection={selectedSection}
              onSelectSection={setSelectedSection}
              commentCounts={sectionCommentCounts}
            />
          )}
        </div>

        {/* Comments Panel */}
        <div className="w-80 shrink-0 hidden md:block">
          <CommentPanel
            comments={sectionComments}
            selectedSection={selectedSection}
            onAddComment={addComment}
            onResolveComment={resolveComment}
          />
        </div>
      </div>
    </div>
  );
}
