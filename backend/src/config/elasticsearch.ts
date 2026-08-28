import { Client } from '@elastic/elasticsearch';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const esClient = new Client({
  node: env.ELASTICSEARCH_URL,
});

export const EMAILS_INDEX = 'emails';

export async function initElasticsearch(): Promise<void> {
  try {
    const indexExists = await esClient.indices.exists({ index: EMAILS_INDEX });
    if (!indexExists) {
      await esClient.indices.create({
        index: EMAILS_INDEX,
        mappings: {
          properties: {
            id: { type: 'keyword' },
            campaignId: { type: 'keyword' },
            senderId: { type: 'keyword' },
            userId: { type: 'keyword' },
            recipient: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            subject: { type: 'text' },
            body: { type: 'text' },
            status: { type: 'keyword' },
            scheduledAt: { type: 'date' },
            sentAt: { type: 'date' },
            createdAt: { type: 'date' },
          },
        },
      });
      logger.info({ index: EMAILS_INDEX }, 'Elasticsearch index created successfully');
    }
  } catch (error) {
    logger.warn({ error }, 'Elasticsearch initialization deferred or unavailable');
  }
}

export async function checkElasticsearchHealth(): Promise<boolean> {
  try {
    const health = await esClient.cluster.health({});
    return health.status === 'green' || health.status === 'yellow';
  } catch (error) {
    logger.warn('Elasticsearch health check failed');
    return false;
  }
}
