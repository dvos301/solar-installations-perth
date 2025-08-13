#!/usr/bin/env node

/**
 * Pre-build script to fetch and cache Google Sheets data
 * This runs before the build process to avoid API quota issues during static generation
 */

const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

// Initialize Google Sheets API
function initializeGoogleSheets() {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing Google Sheets API credentials');
  }

  // Process private key
  let processedPrivateKey = GOOGLE_PRIVATE_KEY;
  if (processedPrivateKey.includes('\\n')) {
    processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: processedPrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

async function prebuildCache() {
  console.log('🚀 Starting pre-build data fetch...');
  
  try {
    // Ensure cache directory exists
    const cacheDir = path.join(process.cwd(), '.cache');
    const cacheFile = path.join(cacheDir, 'solar-data.json');
    
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Initialize Google Sheets
    const sheets = initializeGoogleSheets();
    
    console.log('Fetching data from Google Sheets...');
    
    // Fetch data from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A:Z',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }

    const headers = rows[0];
    const allData = rows.slice(1).map((row) => {
      const item = {
        suburb: '',
        brand: '',
        installer_name: '',
        rating: '',
        reviews_count: '',
        main_brands: '',
        featured_priority: '',
        website: ''
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
    const installers = [...new Set(allData.map(item => item.installer_name))].filter(Boolean).sort();

    const siteData = {
      allData,
      installerData: [], // Empty for now
      suburbs,
      brands,
      systemSizes: installers
    };
    
    // Write to cache file
    const cacheContent = {
      data: siteData,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheContent, null, 2));
    
    console.log('✅ Pre-build cache completed successfully!');
    console.log(`📄 Cached ${allData.length} solar records`);
    console.log(`🏠  Found ${suburbs.length} suburbs`);
    console.log(`🔋 Found ${brands.length} brands`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Pre-build cache failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the prebuild cache
prebuildCache();
