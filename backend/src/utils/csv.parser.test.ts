import { parseCsvEmails } from './csv.parser';

describe('CSV Parser Utility', () => {
  it('should parse valid emails from standard CSV', () => {
    const csvContent = `email\njohn@example.com\nalice@example.com\nbob@example.com`;
    const result = parseCsvEmails(csvContent);

    expect(result.validEmails).toEqual(['john@example.com', 'alice@example.com', 'bob@example.com']);
    expect(result.totalDetected).toBe(3);
    expect(result.duplicatesRemoved).toBe(0);
    expect(result.invalidIgnored).toBe(0);
  });

  it('should remove duplicate emails and count them correctly', () => {
    const csvContent = `email\njohn@example.com\nJOHN@EXAMPLE.COM\nalice@example.com`;
    const result = parseCsvEmails(csvContent);

    expect(result.validEmails).toEqual(['john@example.com', 'alice@example.com']);
    expect(result.totalDetected).toBe(2);
    expect(result.duplicatesRemoved).toBe(1);
  });

  it('should ignore invalid email entries and count them', () => {
    const csvContent = `email\njohn@example.com\nnot-an-email@bad\nalice@example.com`;
    const result = parseCsvEmails(csvContent);

    expect(result.validEmails).toEqual(['john@example.com', 'alice@example.com']);
    expect(result.invalidIgnored).toBe(1);
  });

  it('should intelligently extract emails from multi-column CSVs', () => {
    const csvContent = `Name,Email,Age\nJohn Doe,john@example.com,30\nAlice Smith,alice@example.com,25`;
    const result = parseCsvEmails(csvContent);

    expect(result.validEmails).toEqual(['john@example.com', 'alice@example.com']);
    expect(result.totalDetected).toBe(2);
  });
});
