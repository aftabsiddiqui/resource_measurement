import { NextApiRequest, NextApiResponse } from 'next';
import { SimpleDataStore } from '../../lib/simpleDataStore';
import { cronService } from '../../lib/cronService';

let isInitialized = false;

export interface InitResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InitResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    if (isInitialized) {
      return res.status(200).json({ 
        success: true, 
        message: 'Application already initialized' 
      });
    }

    console.log('Initializing application services...');
    
    // Start the daily data fetch cron job
    cronService.startDailyDataFetch();
    console.log('Daily cron job started');
    
    // Run initial data fetch if needed
    const result = await SimpleDataStore.fetchAndStoreData();
    
    if (!result.success) {
      console.warn('Initial data fetch failed, but continuing with initialization:', result.error);
    } else {
      console.log('Initial data fetch completed');
    }
    
    isInitialized = true;
    
    res.status(200).json({ 
      success: true, 
      message: 'Application initialized successfully - background services started' 
    });

  } catch (error) {
    console.error('Error initializing application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
