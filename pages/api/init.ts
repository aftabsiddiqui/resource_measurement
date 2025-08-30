import { NextApiRequest, NextApiResponse } from 'next';

export interface InitResponse {
  success: boolean;
  message: string;
  status?: {
    initialized: boolean;
    cronActive: boolean;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InitResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Simple status check - real initialization happens in delegations API
    res.status(200).json({ 
      success: true, 
      message: 'Server is running. Auto-initialization happens on first data request.',
      status: {
        initialized: true,
        cronActive: true
      }
    });

  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
