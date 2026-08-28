export interface CsvParseResult {
  validEmails: string[];
  totalDetected: number;
  duplicatesRemoved: number;
  invalidIgnored: number;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function parseCsvEmails(content: string): CsvParseResult {
  const lines = content.split(/\r?\n/);
  const detected: string[] = [];
  let invalidCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Split line by comma, semicolon, or tab
    const tokens = line.split(/[,;\t]/);
    for (const token of tokens) {
      const cleaned = token.trim().replace(/^["']|["']$/g, '');
      if (!cleaned) continue;

      // Skip header words if exact match like "email" or "recipient"
      if (['email', 'emails', 'recipient', 'recipients', 'email_address'].includes(cleaned.toLowerCase())) {
        continue;
      }

      if (EMAIL_REGEX.test(cleaned)) {
        detected.push(cleaned.toLowerCase());
      } else {
        // If token looks like an attempt at an email (has @) but is invalid syntax
        if (cleaned.includes('@')) {
          invalidCount++;
        }
      }
    }
  }

  const uniqueSet = new Set<string>();
  let duplicateCount = 0;

  for (const email of detected) {
    if (uniqueSet.has(email)) {
      duplicateCount++;
    } else {
      uniqueSet.add(email);
    }
  }

  const validEmails = Array.from(uniqueSet);

  return {
    validEmails,
    totalDetected: validEmails.length,
    duplicatesRemoved: duplicateCount,
    invalidIgnored: invalidCount,
  };
}
