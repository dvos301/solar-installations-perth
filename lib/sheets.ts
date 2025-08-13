import { google } from 'googleapis';
import { SolarData, SiteData, InstallerData } from './types';
import fs from 'fs';
import path from 'path';

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SHEET_ID_2 = process.env.GOOGLE_SHEET_ID_2;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

// Check for required environment variables
if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  console.error('Missing environment variables:', {
    GOOGLE_SHEET_ID: !!GOOGLE_SHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!GOOGLE_PRIVATE_KEY
  });
  throw new Error('Missing Google Sheets API credentials. Please check your environment variables.');
}

// Initialize Google Sheets API with robust private key processing for Vercel
let processedPrivateKey: string;
try {
  let rawKey = GOOGLE_PRIVATE_KEY;
  
  // Method 1: Handle escaped newlines (common in .env files)
  if (rawKey.includes('\\n')) {
    rawKey = rawKey.replace(/\\n/g, '\n');
  }
  
  // Method 2: Handle single-line keys (Vercel environment variables)
  if (!rawKey.includes('\n') && rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
    // Extract the key content between headers using regex
    const keyMatch = rawKey.match(/-----BEGIN PRIVATE KEY-----(.+?)-----END PRIVATE KEY-----/);
    if (keyMatch) {
      const keyContent = keyMatch[1].replace(/\s/g, '');
      // Add proper line breaks every 64 characters (standard PEM format)
      const formattedContent = keyContent.match(/.{1,64}/g)?.join('\n') || keyContent;
      rawKey = `-----BEGIN PRIVATE KEY-----\n${formattedContent}\n-----END PRIVATE KEY-----`;
    }
  }
  
  // Method 3: Clean up any extra whitespace
  processedPrivateKey = rawKey
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n')
    .trim();
    
  // Validate the key format
  if (!processedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Private key missing proper header');
  }
  if (!processedPrivateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Private key missing proper footer');
  }
  
  console.log('✅ Private key processed successfully');
} catch (error) {
  console.error('❌ Error processing private key:', error);
  console.error('Private key format (first 50 chars):', GOOGLE_PRIVATE_KEY?.substring(0, 50));
  throw new Error(`Invalid private key format: ${error}`);
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: processedPrivateKey,
    type: 'service_account',
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// File-based cache for build-time persistence
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'solar-data.json');
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const MIN_REQUEST_INTERVAL = 200; // 200ms between requests

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Global cache and synchronization
let cachedData: SiteData | null = null;
let cacheTimestamp: number = 0;
let fetchPromise: Promise<SiteData> | null = null;
let lastRequestTime = 0;

// File-based cache functions
function readCacheFile(): { data: SiteData | null, timestamp: number } {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheContent = fs.readFileSync(CACHE_FILE, 'utf8');
      const parsed = JSON.parse(cacheContent);
      return { data: parsed.data, timestamp: parsed.timestamp };
    }
  } catch (error) {
    console.warn('Failed to read cache file:', error);
  }
  return { data: null, timestamp: 0 };
}

function writeCacheFile(data: SiteData, timestamp: number): void {
  try {
    const cacheContent = { data, timestamp };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheContent, null, 2));
    console.log('Cache file written successfully');
  } catch (error) {
    console.warn('Failed to write cache file:', error);
  }
}

async function rateLimitedDelay() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

export async function fetchSolarData(): Promise<SiteData> {
  const now = Date.now();
  
  // Check memory cache first
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Returning memory cached data');
    return cachedData;
  }
  
  // Check file cache
  const { data: fileData, timestamp: fileTimestamp } = readCacheFile();
  if (fileData && (now - fileTimestamp) < CACHE_DURATION) {
    console.log('Returning file cached data');
    cachedData = fileData;
    cacheTimestamp = fileTimestamp;
    return fileData;
  }
  
  // If a fetch is already in progress, wait for it
  if (fetchPromise) {
    console.log('Waiting for existing fetch to complete...');
    return await fetchPromise;
  }
  
  // Start new fetch with proper synchronization
  fetchPromise = performDataFetch();
  
  try {
    const result = await fetchPromise;
    return result;
  } finally {
    fetchPromise = null;
  }
}

async function performDataFetch(): Promise<SiteData> {

  try {
    console.log('Performing fresh data fetch from Google Sheets...');
    await rateLimitedDelay();
    
    // Fetch data from first sheet (solar systems data)
    const response1 = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A:Z', // Get all columns to be future-proof
    });

    const rows1 = response1.data.values;
    if (!rows1 || rows1.length === 0) {
      throw new Error('No data found in the first sheet');
    }

    const headers1 = rows1[0] as string[];
    const dataRows1 = rows1.slice(1);

    // Map rows to objects using headers
    const allData: SolarData[] = dataRows1.map(row => {
      const item: SolarData = {
        suburb: '',
        brand: '',
        installer_name: '',
        rating: '',
        reviews_count: '',
        main_brands: '',
        featured_priority: '',
        website: ''
      };
      
      headers1.forEach((header, index) => {
        const value = row[index] || '';
        item[header.toLowerCase().replace(/\s+/g, '_')] = value;
      });
      
      return item;
    });

    // Fetch data from second sheet (installer data)
    let installerData: InstallerData[] = [];
    if (GOOGLE_SHEET_ID_2) {
      try {
        const response2 = await sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_SHEET_ID_2,
          range: 'A:Z',
        });

        const rows2 = response2.data.values;
        if (rows2 && rows2.length > 0) {
          const headers2 = rows2[0] as string[];
          const dataRows2 = rows2.slice(1);

          installerData = dataRows2.map(row => {
            const item: InstallerData = {
              suburb: '',
              brand: '',
              installer_name: '',
              featured_priority: ''
            };
            
            headers2.forEach((header, index) => {
              const value = row[index] || '';
              item[header.toLowerCase().replace(/\s+/g, '_')] = value;
            });
            
            return item;
          });
        }
      } catch (error) {
        console.warn('Warning: Could not fetch installer data from second sheet:', error);
      }
    }

    // Extract unique values for navigation
    const suburbs = [...new Set(allData.map(item => item.suburb))].filter(Boolean).sort();
    const brands = [...new Set(allData.map(item => item.brand))].filter(Boolean).sort();
    // Extract installers for potential navigation
    const installers = [...new Set(allData.map(item => item.installer_name))].filter(Boolean).sort();

    const siteData: SiteData = {
      allData,
      installerData,
      suburbs,
      brands,
      systemSizes: installers // Using installers instead of system sizes for now
    };
    
    // Update both memory and file cache
    const now = Date.now();
    cachedData = siteData;
    cacheTimestamp = now;
    writeCacheFile(siteData, now);
    
    console.log(`Successfully fetched and cached ${allData.length} records`);
    return siteData;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    
    // Try to return any available cached data as fallback
    if (cachedData) {
      console.log('Returning memory cached data due to error');
      return cachedData;
    }
    
    const { data: fileData } = readCacheFile();
    if (fileData) {
      console.log('Returning file cached data due to error');
      cachedData = fileData;
      return fileData;
    }
    
    throw error;
  }
}

export function getSuburbData(allData: SolarData[], suburb: string): SolarData[] {
  return allData.filter(item => 
    item.suburb.toLowerCase() === suburb.toLowerCase()
  );
}

export function getInstallerData(
  installerData: InstallerData[], 
  suburb: string, 
  brand?: string
): InstallerData[] {
  return installerData.filter(item => {
    const matchesSuburb = item.suburb.toLowerCase() === suburb.toLowerCase();
    const matchesBrand = !brand || item.brand.toLowerCase() === brand.toLowerCase();
    return matchesSuburb && matchesBrand;
  }).sort((a, b) => {
    // Sort by featured_priority (lower numbers first)
    const priorityA = parseInt(a.featured_priority) || 999;
    const priorityB = parseInt(b.featured_priority) || 999;
    return priorityA - priorityB;
  });
}

export function getBrandData(
  allData: SolarData[], 
  suburb: string, 
  brand: string
): SolarData[] {
  return allData.filter(item => 
    item.suburb.toLowerCase() === suburb.toLowerCase() &&
    item.brand.toLowerCase() === brand.toLowerCase()
  ).sort((a, b) => {
    // Sort by featured_priority (lower numbers first)
    const priorityA = parseInt(a.featured_priority) || 999;
    const priorityB = parseInt(b.featured_priority) || 999;
    return priorityA - priorityB;
  });
}

export function getRelatedSuburbs(suburbs: string[], currentSuburb: string, limit: number = 5): string[] {
  return suburbs
    .filter(suburb => suburb.toLowerCase() !== currentSuburb.toLowerCase())
    .slice(0, limit);
}

export function getRelatedBrands(brands: string[], currentBrand?: string, limit: number = 5): string[] {
  return brands
    .filter(brand => !currentBrand || brand.toLowerCase() !== currentBrand.toLowerCase())
    .slice(0, limit);
}