import * as cron from 'node-cron';
import { SimpleDataStore } from './simpleDataStore';

class CronService {
  private static instance: CronService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {}

  static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  startDailyDataFetch(): void {
    // Stop existing job if running
    this.stopJob('daily-data-fetch');
    
    // Run daily at 2 AM UTC
    const task = cron.schedule('0 2 * * *', async () => {
      console.log('Starting scheduled data fetch...');
      const result = await SimpleDataStore.fetchAndStoreData();
      
      if (result.success) {
        console.log(`Scheduled data fetch completed successfully. Records: ${result.recordsCount}`);
      } else {
        console.error(`Scheduled data fetch failed: ${result.error}`);
      }
    }, {
      timezone: "UTC"
    });

    this.jobs.set('daily-data-fetch', task);
    
    console.log('Daily data fetch cron job started (runs at 2 AM UTC)');
  }

  async runInitialDataFetch(): Promise<void> {
    console.log('Running initial data fetch...');
    const result = await SimpleDataStore.fetchAndStoreData();
    
    if (result.success) {
      console.log(`Initial data fetch completed successfully. Records: ${result.recordsCount}`);
    } else {
      console.error(`Initial data fetch failed: ${result.error}`);
      throw new Error(result.error);
    }
  }

  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`Stopped cron job: ${jobName}`);
    }
  }

  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  getJobStatus(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    return job ? true : false;
  }

  isJobActive(jobName: string): boolean {
    return this.getJobStatus(jobName);
  }
}

export const cronService = CronService.getInstance();
