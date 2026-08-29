import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { Queue, Job } from 'bullmq';

/**
 * Resilient BullMQ adapter for Bull Board.
 * Automatically catches Redis connection errors when Redis is offline or re-connecting,
 * preventing 500 Internal Server Errors on the /admin/queues dashboard.
 */
export class SafeBullMQAdapter extends BullMQAdapter {
  constructor(queue: Queue<any>) {
    super(queue as any);
  }

  async getJobCounts() {
    try {
      return await super.getJobCounts();
    } catch (err) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: 0,
        prioritized: 0,
        'waiting-children': 0,
        latest: 0,
      } as any;
    }
  }

  async getJobs(jobStatuses: any[], pagination?: any) {
    try {
      return await super.getJobs(jobStatuses, pagination);
    } catch (err) {
      return [];
    }
  }

  async isPaused() {
    try {
      return await super.isPaused();
    } catch (err) {
      return false;
    }
  }

  async getRedisInfo() {
    try {
      return await super.getRedisInfo();
    } catch (err) {
      return 'Redis Status: Disconnected (In-Process Fallback Mode Active)';
    }
  }

  async getJob(id: string): Promise<Job<any, any, string> | undefined> {
    try {
      return await super.getJob(id);
    } catch (err) {
      return undefined;
    }
  }

  async getJobLogs(id: string): Promise<string[]> {
    try {
      return await super.getJobLogs(id);
    } catch (err) {
      return [];
    }
  }

  async clean(jobStatus: any, grace: number) {
    try {
      return await super.clean(jobStatus, grace);
    } catch (err) {
      return;
    }
  }

  async pause() {
    try {
      return await super.pause();
    } catch (err) {
      return;
    }
  }

  async resume() {
    try {
      return await super.resume();
    } catch (err) {
      return;
    }
  }

  async empty() {
    try {
      return await super.empty();
    } catch (err) {
      return;
    }
  }

  async promoteAll() {
    try {
      return await super.promoteAll();
    } catch (err) {
      return;
    }
  }
}
