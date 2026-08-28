import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { checkRedisHealth } from '../config/redis.js';
import { checkElasticsearchHealth } from '../config/elasticsearch.js';

export class HealthController {
  static async getHealth(req: Request, res: Response) {
    const [dbOk, redisOk, esOk] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkElasticsearchHealth(),
    ]);

    const isHealthy = dbOk && redisOk;

    const statusCode = isHealthy ? 200 : 503;

    return res.status(statusCode).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: dbOk ? 'up' : 'down',
        redis: redisOk ? 'up' : 'down',
        elasticsearch: esOk ? 'up' : 'down',
        queue: redisOk ? 'up' : 'down',
      },
    });
  }
}
