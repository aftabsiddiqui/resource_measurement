import { NextApiRequest, NextApiResponse } from 'next';
import { SimpleDataStore } from '../../lib/simpleDataStore';

export interface DelegationSummaryResponse {
  success: boolean;
  data?: {
    summary: {
      [entity: string]: {
        asn: string;
        ipv4: string;
        ipv6: string;
        hasPrior: boolean;
      };
    };
    totalSummary: {
      asn: number;
      ipv4: number;
      ipv6: number;
    };
    delegatedPrefixes: {
      [entity: string]: {
        ipv4: string[];
        ipv6: string[];
      };
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DelegationSummaryResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { rir, country, yearStart, yearEnd } = req.query;

    // Validate required parameters
    if (!rir || !country || !yearStart || !yearEnd) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: rir, country, yearStart, yearEnd'
      });
    }

    const rirStr = String(rir);
    const countryStr = String(country);
    const startYear = parseInt(String(yearStart));
    const endYear = parseInt(String(yearEnd));

    if (isNaN(startYear) || isNaN(endYear)) {
      return res.status(400).json({
        success: false,
        error: 'yearStart and yearEnd must be valid numbers'
      });
    }

    // Get processed data from simple data store
    const [processedData, prefixData] = await Promise.all([
      SimpleDataStore.getProcessedData(rirStr, countryStr, startYear, endYear),
      SimpleDataStore.getPrefixData(rirStr, countryStr, startYear, endYear)
    ]);

    // Transform data to match frontend expectations
    const summary: { [entity: string]: any } = {};
    const totalSummary = { asn: 0, ipv4: 0, ipv6: 0 };

    processedData.forEach(item => {
      summary[item.entity] = {
        asn: `${item.asn_count}${item.asn_prior ? '*' : ''}`,
        ipv4: `${item.ipv4_count}${item.ipv4_prior ? '*' : ''}`,
        ipv6: `${item.ipv6_count}${item.ipv6_prior ? '*' : ''}`,
        hasPrior: item.asn_prior || item.ipv4_prior || item.ipv6_prior
      };

      totalSummary.asn += item.asn_count;
      totalSummary.ipv4 += item.ipv4_count;
      totalSummary.ipv6 += item.ipv6_count;
    });

    // Transform prefix data
    const delegatedPrefixes: { [entity: string]: { ipv4: string[]; ipv6: string[] } } = {};
    prefixData.forEach(item => {
      delegatedPrefixes[item.entity] = {
        ipv4: item.ipv4,
        ipv6: item.ipv6
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary,
        totalSummary,
        delegatedPrefixes
      }
    });

  } catch (error) {
    console.error('Error processing delegation summary request:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
