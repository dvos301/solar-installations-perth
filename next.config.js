/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable ISR and dynamic features
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  },
  // Enable experimental features for better performance
  experimental: {
    // Enable partial prerendering for faster builds
    ppr: false, // Set to true when stable
  }
}

module.exports = nextConfig