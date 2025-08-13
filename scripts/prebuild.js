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

// Initialize Google Sheets API with robust key processing for Vercel
function initializeGoogleSheets() {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error('Missing environment variables:', {
      GOOGLE_SHEET_ID: !!GOOGLE_SHEET_ID,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY: !!GOOGLE_PRIVATE_KEY
    });
    throw new Error('Missing Google Sheets API credentials');
  }

  // Robust private key processing for Vercel environment
  let processedPrivateKey;
  try {
    let rawKey = GOOGLE_PRIVATE_KEY;
    
    // Method 1: Handle escaped newlines (common in .env files)
    if (rawKey.includes('\\n')) {
      rawKey = rawKey.replace(/\\n/g, '\n');
    }
    
    // Method 2: Handle single-line keys (Vercel environment variables)
    if (!rawKey.includes('\n') && rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // Extract the key content between headers
      const keyMatch = rawKey.match(/-----BEGIN PRIVATE KEY-----(.+?)-----END PRIVATE KEY-----/);
      if (keyMatch) {
        const keyContent = keyMatch[1].replace(/\s/g, '');
        // Add proper line breaks every 64 characters
        const formattedContent = keyContent.match(/.{1,64}/g).join('\n');
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
    console.error('❌ Error processing private key:', error.message);
    console.error('Private key format (first 50 chars):', GOOGLE_PRIVATE_KEY?.substring(0, 50));
    throw new Error(`Invalid private key format: ${error.message}`);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: processedPrivateKey,
      type: 'service_account',
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

async function prebuildCache() {
  console.log('🚀 Starting pre-build data fetch...');
  
  try {
    // Check if cache already exists and is recent (useful for Vercel builds)
    const cacheFile = path.join(process.cwd(), '.cache', 'solar-data.json');
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const cacheAge = Date.now() - stats.mtime.getTime();
      const maxCacheAge = 30 * 60 * 1000; // 30 minutes
      
      if (cacheAge < maxCacheAge) {
        console.log('✅ Using existing recent cache file (age: ' + Math.round(cacheAge / 60000) + ' minutes)');
        return process.exit(0);
      }
    }
    // Ensure cache directory exists
    const cacheDir = path.join(process.cwd(), '.cache');
    
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
    
    // Check if we have a fallback cache file
    const cacheFile = path.join(process.cwd(), '.cache', 'solar-data.json');
    if (fs.existsSync(cacheFile)) {
      console.log('⚠️  Using existing cache file as fallback');
      process.exit(0);
    }
    
    // In Vercel environment, we might want to continue with a minimal dataset
    if (process.env.VERCEL) {
      console.log('🔄 Creating minimal fallback cache for Vercel build...');
      
      const fallbackData = {
        allData: [],
        installerData: [],
        suburbs: ['perth', 'fremantle', 'joondalup'],
        brands: ['tesla', 'fronius', 'sungrow'],
        systemSizes: []
      };
      
      const cacheContent = {
        data: fallbackData,
        timestamp: Date.now()
      };
      
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cacheContent, null, 2));
        console.log('✅ Fallback cache created successfully');
        process.exit(0);
      } catch (fallbackError) {
        console.error('❌ Could not create fallback cache:', fallbackError);
      }
    }
    
    process.exit(1);
  }
}

// Run the prebuild cache
prebuildCache();
