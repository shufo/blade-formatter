function splitByLines(content: string): Array<string> {
  return content.split('\n');
}

function isCommentedLine(line: string): boolean {
  return line.trim().startsWith('*');
}

function isMultiline(lines: Array<string>): boolean {
  return lines.length > 1;
}

function addPrefixToLine(line: string): string {
  const prefix = ' ';

  return `${prefix}${line}`;
}

/**
 * Formats php comment
 *
 * @param comment
 * @returns string
 */
export function formatPhpComment(comment: string): string {
  const lines = splitByLines(comment);

  if (!isMultiline(lines)) {
    return comment;
  }

  let nonCommentLineExists = false;

  const mapped = lines.map((line: string, row: number) => {
    if (row === 0) {
      return line;
    }

    if (nonCommentLineExists) {
      return line;
    }

    if (!isCommentedLine(line)) {
      nonCommentLineExists = true;
      return line;
    }

    const trimmedLine = line.trim();

    return addPrefixToLine(trimmedLine);
  });

  return mapped.join('\n');
}

export default {
  formatPhpComment,
};
