export interface CsvParseResultFrontend {
  validEmails: string[];
  totalDetected: number;
  duplicatesRemoved: number;
  invalidIgnored: number;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function parseCsvFrontend(content: string): CsvParseResultFrontend {
  const lines = content.split(/\r?\n/);
  const detected: string[] = [];
  let invalidCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    const tokens = line.split(/[,;\t]/);
    for (const token of tokens) {
      const cleaned = token.trim().replace(/^["']|["']$/g, '');
      if (!cleaned) continue;

      if (['email', 'emails', 'recipient', 'recipients', 'email_address'].includes(cleaned.toLowerCase())) {
        continue;
      }

      if (EMAIL_REGEX.test(cleaned)) {
        detected.push(cleaned.toLowerCase());
      } else if (cleaned.includes('@')) {
        invalidCount++;
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
