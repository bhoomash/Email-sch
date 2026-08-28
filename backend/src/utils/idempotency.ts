export function generateBullJobId(emailId: string): string {
  return `email-${emailId}`;
}

export function getRateLimitKey(senderId: string, timestamp: Date | number = new Date()): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  
  return `email-rate:${senderId}:${year}${month}${day}${hour}`;
}

export function getSlackNotificationKey(senderId: string, hourWindow: string): string {
  return `slack-rate-limit-notified:${senderId}:${hourWindow}`;
}

export function getSenderLastSentKey(senderId: string): string {
  return `sender-last-sent:${senderId}`;
}
