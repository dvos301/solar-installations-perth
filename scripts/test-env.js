#!/usr/bin/env node

/**
 * Environment variable test script for Vercel deployment
 * Run this to verify your Google Sheets credentials are properly set
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

console.log('🔍 Environment Variable Check');
console.log('========================================');

console.log('GOOGLE_SHEET_ID:', GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_PRIVATE_KEY:', GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');

if (GOOGLE_PRIVATE_KEY) {
  console.log('\n🔑 Private Key Analysis');
  console.log('========================================');
  console.log('Length:', GOOGLE_PRIVATE_KEY.length);
  console.log('Has \\n:', GOOGLE_PRIVATE_KEY.includes('\\n') ? '✅ Yes' : '❌ No');
  console.log('Has newlines:', GOOGLE_PRIVATE_KEY.includes('\n') ? '✅ Yes' : '❌ No');
  console.log('Has header:', GOOGLE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----') ? '✅ Yes' : '❌ No');
  console.log('Has footer:', GOOGLE_PRIVATE_KEY.includes('-----END PRIVATE KEY-----') ? '✅ Yes' : '❌ No');
  console.log('First 50 chars:', GOOGLE_PRIVATE_KEY.substring(0, 50));
  console.log('Last 50 chars:', GOOGLE_PRIVATE_KEY.substring(GOOGLE_PRIVATE_KEY.length - 50));
}

console.log('\n📋 Instructions for Vercel:');
console.log('========================================');
console.log('1. In Vercel dashboard, go to Project Settings > Environment Variables');
console.log('2. Add these variables:');
console.log('   - GOOGLE_SHEET_ID: Your Google Sheet ID');
console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL: service-account@project.iam.gserviceaccount.com');
console.log('   - GOOGLE_PRIVATE_KEY: Your private key (copy as single line, keep the header/footer)');
console.log('3. Make sure to select "Production", "Preview", and "Development" for all variables');
console.log('4. Redeploy your project after adding the environment variables');

// Test private key processing
if (GOOGLE_PRIVATE_KEY) {
  console.log('\n🧪 Testing Private Key Processing');
  console.log('========================================');
  
  try {
    let rawKey = GOOGLE_PRIVATE_KEY;
    
    // Test the same processing logic as in the main script
    if (rawKey.includes('\\n')) {
      rawKey = rawKey.replace(/\\n/g, '\n');
      console.log('✅ Processed escaped newlines');
    }
    
    if (!rawKey.includes('\n') && rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
      const keyMatch = rawKey.match(/-----BEGIN PRIVATE KEY-----(.+?)-----END PRIVATE KEY-----/);
      if (keyMatch) {
        const keyContent = keyMatch[1].replace(/\s/g, '');
        const formattedContent = keyContent.match(/.{1,64}/g)?.join('\n') || keyContent;
        rawKey = `-----BEGIN PRIVATE KEY-----\n${formattedContent}\n-----END PRIVATE KEY-----`;
        console.log('✅ Formatted single-line key');
      }
    }
    
    const processedKey = rawKey
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .trim();
    
    if (processedKey.includes('-----BEGIN PRIVATE KEY-----') && processedKey.includes('-----END PRIVATE KEY-----')) {
      console.log('✅ Private key format looks correct');
      console.log('Processed key length:', processedKey.length);
    } else {
      console.log('❌ Private key format appears invalid');
    }
    
  } catch (error) {
    console.log('❌ Error processing private key:', error.message);
  }
}
