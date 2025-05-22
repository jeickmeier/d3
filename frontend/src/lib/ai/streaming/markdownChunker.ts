// New helper module for markdown-aware chunking

export type ChunkDetector = (buffer: string) => string | null | undefined;

export const CHUNKING_REGEXPS = {
  line: /\n+/m,
  list: /.{8}/m,
  word: /\S+\s+/m,
};

export function createMarkdownChunker() {
  let isInCodeBlock = false;
  let isInTable = false;
  let isInList = false;
  let isInLink = false;
  let isInEquation = false;
  const chunk: ChunkDetector = (buffer: string) => {
    // Code block detection
    if (/```[^\s]+/.test(buffer)) {
      isInCodeBlock = true;
    } else if (isInCodeBlock && buffer.includes("```")) {
      isInCodeBlock = false;
    }

    // Link detection
    if (buffer.includes("http") || buffer.includes("https")) {
      isInLink = true;
    } else if (buffer.includes("\n") && isInLink) {
      isInLink = false;
    }

    // List detection (bullet characters at start of a line, e.g. "- " or "* ")
    const listBulletRegex = /(^|\n)\s*([*+-])\s+/;
    if (listBulletRegex.test(buffer)) {
      isInList = true;
    } else if (buffer.includes("\n") && isInList) {
      isInList = false;
    }

    // Table detection
    if (!isInTable && buffer.includes("|")) {
      isInTable = true;
    } else if (isInTable && buffer.includes("\n\n")) {
      isInTable = false;
    }

    // Equation detection
    if (buffer.includes("$$")) {
      if (isInEquation) {
        isInEquation = false;
      } else {
        isInEquation = true;
      }
    }

    // Determine which regex to use
    let match: RegExpExecArray | null;
    if (isInCodeBlock || isInTable || isInLink || isInEquation) {
      match = CHUNKING_REGEXPS.line.exec(buffer);
    } else if (isInList) {
      match = CHUNKING_REGEXPS.list.exec(buffer);
    } else {
      match = CHUNKING_REGEXPS.word.exec(buffer);
    }

    if (!match) {
      return null;
    }

    return buffer.slice(0, match.index) + match[0];
  };

  const delay = (buffer: string) => {
    // mark buffer as used to satisfy linter
    void buffer;
    // Longer delay for code blocks and tables
    return isInCodeBlock || isInTable ? 100 : 30;
  };

  return { chunk, delay };
}
