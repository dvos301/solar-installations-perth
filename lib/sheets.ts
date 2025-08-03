import { google } from 'googleapis';
import { SolarData, SiteData } from './types';

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  throw new Error('Missing Google Sheets API credentials. Please check your environment variables.');
}

// Create JWT auth client with robust private key handling
let privateKey;
try {
  // Handle different private key formats and clean it up
  privateKey = GOOGLE_PRIVATE_KEY
    .replace(/\\n/g, '\n')  // Convert escaped newlines
    .replace(/\s+/g, '\n')  // Normalize whitespace to newlines
    .replace(/\n+/g, '\n')  // Remove duplicate newlines
    .trim();
  
  // If it doesn't start with BEGIN, add the headers
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  }
  
  // Ensure proper formatting
  if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
    privateKey = privateKey.replace(/-----END PRIVATE KEY-----.*$/, '-----END PRIVATE KEY-----');
  }
} catch (error) {
  throw new Error(`Invalid private key format: ${error}`);
}

const auth = new google.auth.JWT(
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

const sheets = google.sheets({ version: 'v4', auth });

export async function fetchSolarData(): Promise<SiteData> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A:Z', // Get all columns to be future-proof
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the sheet');
    }

    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);

    // Map rows to objects using headers
    const allData: SolarData[] = dataRows.map(row => {
      const item: SolarData = {
        suburb: '',
        brand: '',
        system_size: '',
        avg_cost: '',
        description: ''
      };
      
      headers.forEach((header, index) => {
        const value = row[index] || '';
        item[header.toLowerCase().replace(/\s+/g, '_')] = value;
      });
      
      return item;
    });

    // Extract unique values for navigation
    const suburbs = [...new Set(allData.map(item => item.suburb))].filter(Boolean).sort();
    const brands = [...new Set(allData.map(item => item.brand))].filter(Boolean).sort();
    const systemSizes = [...new Set(allData.map(item => item.system_size))].filter(Boolean).sort();

    return {
      allData,
      suburbs,
      brands,
      systemSizes
    };
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

export function getSuburbData(allData: SolarData[], suburb: string): SolarData[] {
  return allData.filter(item => 
    item.suburb.toLowerCase() === suburb.toLowerCase()
  );
}

export function getBrandSystemData(
  allData: SolarData[], 
  suburb: string, 
  brand: string, 
  systemSize: string
): SolarData[] {
  return allData.filter(item => 
    item.suburb.toLowerCase() === suburb.toLowerCase() &&
    item.brand.toLowerCase() === brand.toLowerCase() &&
    item.system_size.toLowerCase() === systemSize.toLowerCase()
  );
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