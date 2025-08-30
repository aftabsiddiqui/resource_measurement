import { cronService } from '../lib/cronService';

let isInitialized = false;

export async function initializeApp() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Initializing application...');
    
    // Start the daily data fetch cron job
    cronService.startDailyDataFetch();
    
    // Run initial data fetch if database is empty
    // This will check if data was already fetched today
    await cronService.runInitialDataFetch();
    
    isInitialized = true;
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
    // Don't throw error here as it might prevent the app from starting
    // The user can manually trigger data fetch via API
  }
}
