import { NextApiRequest, NextApiResponse } from 'next';
import { SimpleDataStore } from '../../lib/simpleDataStore';

export interface DataUpdateResponse {
  success: boolean;
  message?: string;
  recordsCount?: number;
  error?: string;
}

// Disable response size limit for large data operations
export const config = {
  api: {
    responseLimit: '50mb',
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataUpdateResponse>
) {
  if (req.method === 'POST') {
    // Manual data update
    try {
      const result = await SimpleDataStore.fetchAndStoreData();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Data updated successfully',
          recordsCount: result.recordsCount
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to update data'
        });
      }
    } catch (error) {
      console.error('Error in manual data update:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  } 
  else if (req.method === 'GET') {
    // Get update status
    try {
      res.status(200).json({
        success: true,
        message: 'Simple data store is active'
      });
    } catch (error) {
      console.error('Error getting update status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
