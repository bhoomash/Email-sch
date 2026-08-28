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
      logger.info({ index: EMAILS_INDEX }, '✓ Elasticsearch index initialized');
    }
    logger.info('✓ Elasticsearch connected');
  } catch (error) {
    logger.warn({ error }, '✗ Elasticsearch connection failed or deferred');
  }
}

export async function checkElasticsearchHealth(): Promise<boolean> {
  try {
    const health = await esClient.cluster.health({});
    const isOk = health.status === 'green' || health.status === 'yellow';
    if (isOk) {
      logger.info('✓ Elasticsearch health verified');
    } else {
      logger.warn({ status: health.status }, '✗ Elasticsearch cluster status degraded');
    }
    return isOk;
  } catch (error) {
    logger.warn('✗ Elasticsearch connection failed');
    return false;
  }
}
