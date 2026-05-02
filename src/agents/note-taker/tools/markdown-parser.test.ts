/**
 * Tests for markdown-parser tool
 * Following TDD - tests written before implementation
 */

import { describe, it, expect } from 'vitest';
import {
  parseFrontmatter,
  extractMermaidBlocks,
  extractMathBlocks,
  extractCodeBlocks,
  extractInlineCode,
  extractImages,
  parseNote,
  type ParsedNote,
  type MermaidBlock,
  type MathBlock,
  type CodeBlock,
  type ImageReference,
} from './markdown-parser.js';

describe('markdown-parser', () => {
  describe('parseFrontmatter', () => {
    it('should parse valid frontmatter with basic fields', () => {
      const markdown = `---
title: Test Note
tags: [test, example]
created: 2026-05-03
---

Content here`;

      const result = parseFrontmatter(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Note');
        expect(result.data.tags).toEqual(['test', 'example']);
        // gray-matter auto-parses dates to Date objects
        expect(result.data.created).toBeInstanceOf(Date);
        expect((result.data.created as Date).toISOString().split('T')[0]).toBe('2026-05-03');
      }
    });

    it('should parse frontmatter with arrays', () => {
      const markdown = `---
tags: [trading, psychology, emotions]
related: [Note 1, Note 2]
---

Content`;

      const result = parseFrontmatter(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(['trading', 'psychology', 'emotions']);
        expect(result.data.related).toEqual(['Note 1', 'Note 2']);
      }
    });

    it('should parse frontmatter with nested objects', () => {
      const markdown = `---
title: Complex Note
metadata:
  author: Joseph
  version: 1.0
---

Content`;

      const result = parseFrontmatter(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toEqual({
          author: 'Joseph',
          version: 1.0,
        });
      }
    });

    it('should handle missing frontmatter', () => {
      const markdown = `# Just Content

No frontmatter here`;

      const result = parseFrontmatter(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it('should handle malformed YAML', () => {
      const markdown = `---
title: Bad YAML
tags: [unclosed
---

Content`;

      const result = parseFrontmatter(markdown);

      // Should return error gracefully
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.message).toContain('Failed to parse frontmatter');
      }
    });

    it('should preserve content after frontmatter', () => {
      const markdown = `---
title: Test
---

# Heading

Content here`;

      const result = parseFrontmatter(markdown);

      expect(result.success).toBe(true);
      // Frontmatter extraction shouldn't modify the original markdown
    });
  });

  describe('parseNote - full parsing', () => {
    it('should parse complete note with frontmatter and content', () => {
      const markdown = `---
title: Complete Note
tags: [test]
---

# Content

This is the content.`;

      const result = parseNote(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.frontmatter.title).toBe('Complete Note');
        expect(result.data.content).toContain('# Content');
        expect(result.data.content).toContain('This is the content.');
      }
    });

    it('should parse note with only frontmatter', () => {
      const markdown = `---
title: Only Frontmatter
---`;

      const result = parseNote(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.frontmatter.title).toBe('Only Frontmatter');
        expect(result.data.content).toBe('');
      }
    });

    it('should parse note with only content (no frontmatter)', () => {
      const markdown = `# Just Content

No frontmatter in this note.`;

      const result = parseNote(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.frontmatter).toEqual({});
        expect(result.data.content).toContain('# Just Content');
      }
    });
  });

  describe('extractMermaidBlocks', () => {
    it('should extract mermaid code blocks', () => {
      const content = `Some text

\`\`\`mermaid
graph TD
  A --> B
\`\`\`

More text`;

      const blocks = extractMermaidBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].content).toContain('graph TD');
      expect(blocks[0].content).toContain('A --> B');
    });

    it('should handle multiple mermaid blocks in one note', () => {
      const content = `\`\`\`mermaid
graph LR
  A --> B
\`\`\`

Text between

\`\`\`mermaid
sequenceDiagram
  Alice->>John: Hello
\`\`\``;

      const blocks = extractMermaidBlocks(content);

      expect(blocks).toHaveLength(2);
      expect(blocks[0].content).toContain('graph LR');
      expect(blocks[1].content).toContain('sequenceDiagram');
    });
  });

  describe('extractMathBlocks', () => {
    it('should extract inline math', () => {
      const content = 'This is $x^2 + y^2 = z^2$ inline math.';

      const blocks = extractMathBlocks(content);

      const inlineBlocks = blocks.filter((b) => b.type === 'inline');
      expect(inlineBlocks).toHaveLength(1);
      expect(inlineBlocks[0].content).toBe('x^2 + y^2 = z^2');
    });

    it('should extract block math', () => {
      const content = `Some text

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

More text`;

      const blocks = extractMathBlocks(content);

      const blockMath = blocks.filter((b) => b.type === 'block');
      expect(blockMath).toHaveLength(1);
      expect(blockMath[0].content).toContain('\\int_0^\\infty');
    });

    it('should extract mixed inline and block math', () => {
      const content = `Inline $a + b$ and block:

$$
c = \\sqrt{a^2 + b^2}
$$

And more inline $x = 5$.`;

      const blocks = extractMathBlocks(content);

      expect(blocks).toHaveLength(3);
      expect(blocks.filter((b) => b.type === 'inline')).toHaveLength(2);
      expect(blocks.filter((b) => b.type === 'block')).toHaveLength(1);
    });
  });

  describe('extractCodeBlocks', () => {
    it('should extract fenced code blocks', () => {
      const content = `Some text

\`\`\`javascript
function hello() {
  console.log('Hello');
}
\`\`\`

More text`;

      const blocks = extractCodeBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].language).toBe('javascript');
      expect(blocks[0].content).toContain('function hello()');
    });

    it('should extract inline code', () => {
      const content = 'Use `console.log()` to print and `const x = 5` for variables.';

      const inlineCode = extractInlineCode(content);

      expect(inlineCode).toHaveLength(2);
      expect(inlineCode).toContain('console.log()');
      expect(inlineCode).toContain('const x = 5');
    });

    it('should preserve language tags and content', () => {
      const content = `\`\`\`typescript
interface User {
  name: string;
}
\`\`\`

\`\`\`python
def hello():
    print("Hello")
\`\`\``;

      const blocks = extractCodeBlocks(content);

      expect(blocks).toHaveLength(2);
      expect(blocks[0].language).toBe('typescript');
      expect(blocks[1].language).toBe('python');
      expect(blocks[0].content).toContain('interface User');
      expect(blocks[1].content).toContain('def hello()');
    });
  });

  describe('extractImages', () => {
    it('should extract markdown images', () => {
      const content = 'Here is an image: ![Chart](./charts/xauusd.png) in the text.';

      const images = extractImages(content);

      expect(images).toHaveLength(1);
      expect(images[0].altText).toBe('Chart');
      expect(images[0].path).toBe('./charts/xauusd.png');
    });

    it('should extract image alt text and paths separately', () => {
      const content = `![Trading Setup](./images/setup.png)

Some text

![Analysis](https://example.com/analysis.jpg)`;

      const images = extractImages(content);

      expect(images).toHaveLength(2);
      expect(images[0].altText).toBe('Trading Setup');
      expect(images[0].path).toBe('./images/setup.png');
      expect(images[1].altText).toBe('Analysis');
      expect(images[1].path).toBe('https://example.com/analysis.jpg');
    });
  });

  describe('parseNote - mixed content', () => {
    it('should parse note with all element types', () => {
      const markdown = `---
title: Complex Note
tags: [code, math, diagrams]
---

# Trading Analysis

Some text with $inline math$ here.

\`\`\`python
def calculate():
    return 42
\`\`\`

Block math:

$$
profit = revenue - cost
$$

Diagram:

\`\`\`mermaid
graph LR
  A --> B
\`\`\`

Image: ![Chart](./chart.png)

More text with \`inline code\`.`;

      const result = parseNote(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        const parsed = result.data;

        // Frontmatter
        expect(parsed.frontmatter.title).toBe('Complex Note');
        expect(parsed.frontmatter.tags).toEqual(['code', 'math', 'diagrams']);

        // Content preserved
        expect(parsed.content).toContain('Trading Analysis');

        // Special blocks extracted
        expect(parsed.codeBlocks).toHaveLength(1);
        expect(parsed.codeBlocks[0].language).toBe('python');

        expect(parsed.mathBlocks.length).toBeGreaterThan(0);

        expect(parsed.mermaidBlocks).toHaveLength(1);

        expect(parsed.images).toHaveLength(1);
        expect(parsed.images[0].altText).toBe('Chart');

        expect(parsed.inlineCode.length).toBeGreaterThan(0);

        // Content without special blocks (for TF-IDF)
        expect(parsed.contentWithoutSpecialBlocks).not.toContain('```');
        expect(parsed.contentWithoutSpecialBlocks).not.toContain('$$');
        expect(parsed.contentWithoutSpecialBlocks).toContain('Trading Analysis');
      }
    });

    it('should preserve original content with all elements intact', () => {
      const markdown = `---
title: Test
---

Text with \`code\` and $math$ and ![image](path.png).`;

      const result = parseNote(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        // Original content should be preserved exactly
        expect(result.data.content).toContain('`code`');
        expect(result.data.content).toContain('$math$');
        expect(result.data.content).toContain('![image](path.png)');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const markdown = '';

      const result = parseNote(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.frontmatter).toEqual({});
        expect(result.data.content).toBe('');
        expect(result.data.codeBlocks).toEqual([]);
        expect(result.data.mathBlocks).toEqual([]);
        expect(result.data.mermaidBlocks).toEqual([]);
        expect(result.data.images).toEqual([]);
        expect(result.data.inlineCode).toEqual([]);
      }
    });

    it('should handle large files (performance)', () => {
      // Create a large markdown file (10,000 lines)
      const lines: string[] = ['---', 'title: Large File', '---', ''];
      for (let i = 0; i < 10000; i++) {
        lines.push(`Line ${i}: Some content here`);
        if (i % 100 === 0) {
          lines.push('', '```javascript', `console.log(${i});`, '```', '');
        }
      }
      const markdown = lines.join('\n');

      const startTime = Date.now();
      const result = parseNote(markdown);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});
