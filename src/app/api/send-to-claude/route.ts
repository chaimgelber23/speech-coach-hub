import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { documentId, slug } = await request.json();

  if (!documentId || !slug) {
    return NextResponse.json({ error: 'Missing documentId or slug' }, { status: 400 });
  }

  // Fetch the document
  const { data: doc, error: docError } = await supabase
    .from('research_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Fetch open (unresolved) comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('document_id', documentId)
    .eq('resolved', false)
    .order('created_at', { ascending: true });

  if (!comments || comments.length === 0) {
    return NextResponse.json({ error: 'No open comments to send' }, { status: 400 });
  }

  // Group comments by section
  const grouped: Record<string, typeof comments> = {};
  for (const c of comments) {
    if (!grouped[c.section_id]) grouped[c.section_id] = [];
    grouped[c.section_id].push(c);
  }

  // Build formatted markdown for Claude
  let md = `# Feedback for: ${doc.title}\n`;
  md += `**File type:** ${doc.status}\n`;
  md += `**Slug:** ${slug}\n`;
  md += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  md += `---\n\n`;
  md += `## Open Comments\n\n`;
  md += `Please review and apply the following feedback to the source file.\n\n`;

  for (const [section, sectionComments] of Object.entries(grouped)) {
    const label = section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    md += `### Section: ${label}\n\n`;
    for (const c of sectionComments) {
      md += `- **[${c.comment_type}]** ${c.content}\n`;
    }
    md += '\n';
  }

  md += `---\n\n`;
  md += `*To apply these changes, open Claude Code and say: "Check my feedback for ${doc.title}"*\n`;

  // Write to coaching/feedback/ directory
  const projectRoot = path.resolve(process.cwd(), '..');
  const feedbackDir = path.join(projectRoot, 'coaching', 'feedback');
  fs.mkdirSync(feedbackDir, { recursive: true });

  const filename = `${slug}-comments.md`;
  const filePath = path.join(feedbackDir, filename);
  fs.writeFileSync(filePath, md, 'utf-8');

  return NextResponse.json({
    success: true,
    file: `coaching/feedback/${filename}`,
    commentCount: comments.length,
  });
}
