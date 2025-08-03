import { google } from 'googleapis';
import { SolarData, SiteData, InstallerData } from './types';

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

// Initialize Google Sheets API with robust private key processing
let processedPrivateKey: string;
try {
  // Multiple methods to handle private key formatting
  let rawKey = GOOGLE_PRIVATE_KEY;
  
  // Method 1: Handle escaped newlines
  if (rawKey.includes('\\n')) {
    rawKey = rawKey.replace(/\\n/g, '\n');
  }
  
  // Method 2: If it's a single line, try to reconstruct proper format
  if (!rawKey.includes('\n') && rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
    // Split on the header and footer to reconstruct
    const keyParts = rawKey.split('-----BEGIN PRIVATE KEY-----')[1]?.split('-----END PRIVATE KEY-----')[0];
    if (keyParts) {
      // Add newlines every 64 characters (standard PEM format)
      const formattedKey = keyParts.replace(/(.{64})/g, '$1\n').trim();
      rawKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    }
  }
  
  processedPrivateKey = rawKey
    .replace(/\n\s+/g, '\n') // Remove extra whitespace after newlines
    .trim();
    
  // Validate the key format
  if (!processedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Private key missing proper header');
  }
  if (!processedPrivateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Private key missing proper footer');
  }
  
  console.log('Private key processed successfully');
} catch (error) {
  console.error('Error processing private key:', error);
  console.error('Private key format (first 50 chars):', GOOGLE_PRIVATE_KEY?.substring(0, 50));
  throw new Error(`Invalid private key format: ${error}`);
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: processedPrivateKey,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function fetchSolarData(): Promise<SiteData> {
  try {
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

    return {
      allData,
      installerData,
      suburbs,
      brands,
      systemSizes: installers // Using installers instead of system sizes for now
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