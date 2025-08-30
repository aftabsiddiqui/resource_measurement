import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import axios from 'axios';

const dataDir = path.join(process.cwd(), 'data');
const delegationsFile = path.join(dataDir, 'delegations.json');
const updatesFile = path.join(dataDir, 'updates.json');

export interface DelegationRecord {
  rir: string;
  country_code: string;
  type: 'asn' | 'ipv4' | 'ipv6';
  value: string;
  size: number;
  date: string;
  status: string;
  entity: string;
}

export interface ProcessedData {
  entity: string;
  rir: string;
  country_code: string;
  asn_count: number;
  ipv4_count: number;
  ipv6_count: number;
  asn_prior: boolean;
  ipv4_prior: boolean;
  ipv6_prior: boolean;
}

export class SimpleDataStore {
  private static ensureDataDir() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  static async storeDelegations(records: DelegationRecord[]): Promise<void> {
    this.ensureDataDir();
    
    // Load existing data
    let existingData: DelegationRecord[] = [];
    if (fs.existsSync(delegationsFile)) {
      const fileContent = fs.readFileSync(delegationsFile, 'utf-8');
      existingData = JSON.parse(fileContent);
    }

    // Merge new records (simple deduplication based on key fields)
    const existingKeys = new Set(
      existingData.map(r => `${r.rir}-${r.country_code}-${r.type}-${r.value}-${r.date}-${r.entity}`)
    );

    const newRecords = records.filter(r => 
      !existingKeys.has(`${r.rir}-${r.country_code}-${r.type}-${r.value}-${r.date}-${r.entity}`)
    );

    if (newRecords.length > 0) {
      const allData = [...existingData, ...newRecords];
      fs.writeFileSync(delegationsFile, JSON.stringify(allData, null, 2));
    }
  }

  static async getProcessedData(
    rir: string,
    countryCode: string,
    yearStart: number,
    yearEnd: number
  ): Promise<ProcessedData[]> {
    this.ensureDataDir();
    
    if (!fs.existsSync(delegationsFile)) {
      return [];
    }

    const fileContent = fs.readFileSync(delegationsFile, 'utf-8');
    const allData: DelegationRecord[] = JSON.parse(fileContent);

    // Filter data for entities in the year range
    const entitiesInRange = new Set<string>();
    allData.forEach(record => {
      if (record.rir === rir.toLowerCase() && record.country_code === countryCode.toUpperCase()) {
        const year = parseInt(record.date.substring(0, 4));
        if (year >= yearStart && year <= yearEnd) {
          entitiesInRange.add(record.entity);
        }
      }
    });

    // Process data for each entity
    const entityData: { [entity: string]: ProcessedData } = {};
    
    allData.forEach(record => {
      if (!entitiesInRange.has(record.entity)) return;
      
      const year = parseInt(record.date.substring(0, 4));
      
      if (!entityData[record.entity]) {
        entityData[record.entity] = {
          entity: record.entity,
          rir: record.rir,
          country_code: record.country_code,
          asn_count: 0,
          ipv4_count: 0,
          ipv6_count: 0,
          asn_prior: false,
          ipv4_prior: false,
          ipv6_prior: false
        };
      }

      const data = entityData[record.entity];
      
      if (record.type === 'asn') {
        data.asn_count += record.size;
        if (year < yearStart) data.asn_prior = true;
      } else if (record.type === 'ipv4') {
        data.ipv4_count += 1;
        if (year < yearStart) data.ipv4_prior = true;
      } else if (record.type === 'ipv6') {
        data.ipv6_count += 1;
        if (year < yearStart) data.ipv6_prior = true;
      }
    });

    return Object.values(entityData);
  }

  static async getPrefixData(
    rir: string,
    countryCode: string,
    yearStart: number,
    yearEnd: number
  ): Promise<{ entity: string; ipv4: string[]; ipv6: string[] }[]> {
    this.ensureDataDir();
    
    if (!fs.existsSync(delegationsFile)) {
      return [];
    }

    const fileContent = fs.readFileSync(delegationsFile, 'utf-8');
    const allData: DelegationRecord[] = JSON.parse(fileContent);

    // Get entities in range
    const entitiesInRange = new Set<string>();
    allData.forEach(record => {
      if (record.rir === rir.toLowerCase() && record.country_code === countryCode.toUpperCase()) {
        const year = parseInt(record.date.substring(0, 4));
        if (year >= yearStart && year <= yearEnd) {
          entitiesInRange.add(record.entity);
        }
      }
    });

    // Collect prefix data
    const prefixData: { [entity: string]: { ipv4: string[]; ipv6: string[] } } = {};
    
    allData.forEach(record => {
      if (!entitiesInRange.has(record.entity)) return;
      if (record.type !== 'ipv4' && record.type !== 'ipv6') return;

      if (!prefixData[record.entity]) {
        prefixData[record.entity] = { ipv4: [], ipv6: [] };
      }

      if (record.type === 'ipv4') {
        const prefix = `${record.value}/${Math.log2(256 / record.size)}`;
        prefixData[record.entity].ipv4.push(prefix);
      } else if (record.type === 'ipv6') {
        const prefix = `${record.value}/${record.size}`;
        prefixData[record.entity].ipv6.push(prefix);
      }
    });

    return Object.entries(prefixData).map(([entity, prefixes]) => ({
      entity,
      ipv4: prefixes.ipv4,
      ipv6: prefixes.ipv6
    }));
  }

  static async recordUpdate(date: string, recordsCount: number, status: string): Promise<void> {
    this.ensureDataDir();
    
    let updates: any[] = [];
    if (fs.existsSync(updatesFile)) {
      const fileContent = fs.readFileSync(updatesFile, 'utf-8');
      updates = JSON.parse(fileContent);
    }

    // Remove existing entry for the same date
    updates = updates.filter(u => u.date !== date);
    
    // Add new entry
    updates.push({
      date,
      recordsCount,
      status,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(updatesFile, JSON.stringify(updates, null, 2));
  }

  static async getLastUpdateDate(): Promise<string | null> {
    this.ensureDataDir();
    
    if (!fs.existsSync(updatesFile)) {
      return null;
    }

    const fileContent = fs.readFileSync(updatesFile, 'utf-8');
    const updates = JSON.parse(fileContent);
    
    if (updates.length === 0) return null;
    
    updates.sort((a: any, b: any) => b.date.localeCompare(a.date));
    return updates[0].date;
  }

  static async fetchAndStoreData(): Promise<{ success: boolean; recordsCount: number; error?: string }> {
    try {
      console.log('Starting data fetch from RIR NRO stats...');
      
      // Always fetch fresh data on startup - removed daily check
      console.log('Fetching fresh data from RIR sources...');

      // Fetch data from the URL using axios with streaming
      console.log('Fetching data with axios streaming...');
      const response = await axios.get('https://ftp.ripe.net/pub/stats/ripencc/nro-stats/latest/nro-delegated-stats', {
        headers: {
          'User-Agent': 'curl/8.0.0',
          'Accept': 'text/plain, application/octet-stream',
          'Cache-Control': 'no-cache'
        },
        timeout: 120000, // 2 minute timeout
        responseType: 'stream', // Use streaming for large files
        maxContentLength: 100 * 1024 * 1024, // 100MB limit
        maxBodyLength: 100 * 1024 * 1024
      });

      const contentLength = parseInt(response.headers['content-length'] || '0');
      console.log(`Connected successfully. Content-Length: ${contentLength ? Math.round(contentLength / 1024 / 1024) + 'MB' : 'unknown'}`);

      // Collect streamed data
      const text = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        let totalSize = 0;
        let lastProgressTime = Date.now();

        response.data.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
          totalSize += chunk.length;
          
          // Log progress every 10MB or every 30 seconds
          const now = Date.now();
          if (totalSize % (10 * 1024 * 1024) < chunk.length || (now - lastProgressTime) > 30000) {
            const progress = contentLength ? Math.round((totalSize / contentLength) * 100) : 0;
            console.log(`Progress: ${Math.round(totalSize / 1024 / 1024)}MB${contentLength ? ` / ${Math.round(contentLength / 1024 / 1024)}MB (${progress}%)` : ''}...`);
            lastProgressTime = now;
          }
        });

        response.data.on('end', () => {
          const totalMB = Math.round(totalSize / 1024 / 1024);
          console.log(`Download completed successfully: ${totalMB}MB`);
          const data = Buffer.concat(chunks).toString('utf-8');
          resolve(data);
        });

        response.data.on('error', (error: any) => {
          reject(error);
        });
      });

      console.log('Data fetched successfully, parsing...');

      // Parse CSV data
      const parsed = Papa.parse(text, {
        delimiter: '|',
        skipEmptyLines: true,
      });

      if (!parsed.data || parsed.data.length === 0) {
        throw new Error('No data received from RIR source');
      }

      // Filter and format data
      const delegationRecords: DelegationRecord[] = [];
      
      for (const row of parsed.data as string[][]) {
        // Skip header and summary rows
        if (row.length < 8 || !row[0] || row[0].startsWith('#') || row[0] === 'version') {
          continue;
        }

        const [rir, countryCode, type, value, size, date, status, entity] = row;

        // Only process actual delegation records
        if (type && ['asn', 'ipv4', 'ipv6'].includes(type) && entity && entity.trim() !== '') {
          delegationRecords.push({
            rir: rir.toLowerCase(),
            country_code: countryCode.toUpperCase(),
            type: type as 'asn' | 'ipv4' | 'ipv6',
            value: value,
            size: parseInt(size) || 0,
            date: date,
            status: status || 'assigned',
            entity: entity.trim()
          });
        }
      }

      console.log(`Parsed ${delegationRecords.length} delegation records`);

      if (delegationRecords.length === 0) {
        throw new Error('No valid delegation records found in data');
      }

      // Store in JSON file
      await this.storeDelegations(delegationRecords);
      
      // Record the update
      const today = new Date().toISOString().split('T')[0];
      await this.recordUpdate(today, delegationRecords.length, 'success');

      console.log(`Successfully stored ${delegationRecords.length} records`);

      return { 
        success: true, 
        recordsCount: delegationRecords.length 
      };

    } catch (error) {
      console.error('Error fetching and storing data:', error);
      
      // Record failed update
      const today = new Date().toISOString().split('T')[0];
      try {
        await this.recordUpdate(today, 0, `error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } catch (recordError) {
        console.error('Error recording failed update:', recordError);
      }

      return { 
        success: false, 
        recordsCount: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
