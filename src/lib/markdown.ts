import type { Section } from '@/types';

/**
 * Parse markdown content into sections based on headings.
 * Each ## heading starts a new section.
 */
export function parseSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Partial<Section> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);

    if (headingMatch) {
      // Close previous section
      if (currentSection && currentSection.id) {
        currentSection.end_line = i - 1;
        sections.push(currentSection as Section);
      }

      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      currentSection = {
        id,
        title,
        level,
        start_line: i,
      };
    }
  }

  // Close last section
  if (currentSection && currentSection.id) {
    currentSection.end_line = lines.length - 1;
    sections.push(currentSection as Section);
  }

  return sections;
}

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
