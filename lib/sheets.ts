import { google } from 'googleapis';
import { SolarData, SiteData, InstallerData } from './types';

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SHEET_ID_2 = process.env.GOOGLE_SHEET_ID_2;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  throw new Error('Missing Google Sheets API credentials. Please check your environment variables.');
}

// Create JWT auth client with simple private key handling
let privateKey;
try {
  // Simple conversion of escaped newlines to actual newlines
  privateKey = GOOGLE_PRIVATE_KEY
    .replace(/\\n/g, '\n')  // Convert escaped newlines
    .trim();
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