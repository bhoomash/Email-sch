export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'RATE_LIMITED';

export interface EmailItem {
  id: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: EmailStatus;
  attempts: number;
  bullJobId: string;
  messageId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: {
    email: string;
  };
  campaign?: {
    subject: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmailListResponse {
  success: boolean;
  data: {
    items: EmailItem[];
    pagination: Pagination;
  };
}
