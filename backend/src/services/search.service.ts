import { esClient, EMAILS_INDEX } from '../config/elasticsearch.js';
import { logger } from '../utils/logger.js';

export interface EmailSearchDoc {
  id: string;
  campaignId: string;
  senderId: string;
  userId: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  scheduledAt: Date | string;
  sentAt?: Date | string | null;
  createdAt: Date | string;
}

export class SearchService {
  static async indexEmail(doc: EmailSearchDoc): Promise<void> {
    try {
      await esClient.index({
        index: EMAILS_INDEX,
        id: doc.id,
        document: {
          ...doc,
          scheduledAt: new Date(doc.scheduledAt).toISOString(),
          sentAt: doc.sentAt ? new Date(doc.sentAt).toISOString() : null,
          createdAt: new Date(doc.createdAt).toISOString(),
        },
      });
    } catch (error) {
      logger.warn({ error, emailId: doc.id }, 'Elasticsearch indexing failed (Database authoritative)');
    }
  }

  static async updateEmailStatus(
    emailId: string,
    status: string,
    sentAt?: Date | null,
    errorMessage?: string | null
  ): Promise<void> {
    try {
      await esClient.update({
        index: EMAILS_INDEX,
        id: emailId,
        doc: {
          status,
          sentAt: sentAt ? sentAt.toISOString() : null,
          ...(errorMessage ? { errorMessage } : {}),
        },
      });
    } catch (error) {
      logger.warn({ error, emailId }, 'Elasticsearch update failed (Database authoritative)');
    }
  }

  static async searchUserEmails(userId: string, queryText: string): Promise<any[]> {
    try {
      const response = await esClient.search({
        index: EMAILS_INDEX,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: queryText,
                  fields: ['recipient^3', 'subject^2', 'body', 'status'],
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: [
              {
                term: { userId },
              },
            ],
          },
        },
      });

      return response.hits.hits.map((hit) => hit._source);
    } catch (error) {
      logger.error({ error, userId, queryText }, 'Elasticsearch search query failed');
      return [];
    }
  }
}
