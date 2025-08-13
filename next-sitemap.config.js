/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000, // Reduced for better performance
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
  generateIndexSitemap: true, // Enable for large sitemaps
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  // Custom function to generate additional URLs not in build
  additionalPaths: async (config) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Read cached data to generate sitemap for all pages
      const cacheFile = path.join(process.cwd(), '.cache', 'solar-data.json');
      if (fs.existsSync(cacheFile)) {
        const cacheContent = fs.readFileSync(cacheFile, 'utf8');
        const { data } = JSON.parse(cacheContent);
        
        const additionalUrls = [];
        const seen = new Set();
        
        // Add all suburb pages
        data.suburbs.forEach(suburb => {
          const suburbSlug = suburb.toLowerCase().replace(/\s+/g, '-');
          additionalUrls.push({
            loc: `/solar/${suburbSlug}/`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          });
        });
        
        // Add all suburb-brand combinations
        data.allData.forEach(item => {
          const suburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
          const brandSlug = item.brand.toLowerCase().replace(/\s+/g, '-');
          const key = `${suburbSlug}-${brandSlug}`;
          
          if (!seen.has(key)) {
            seen.add(key);
            additionalUrls.push({
              loc: `/solar/${suburbSlug}/${brandSlug}/`,
              changefreq: 'monthly',
              priority: 0.9,
              lastmod: new Date().toISOString(),
            });
            
            // Add compare pages
            additionalUrls.push({
              loc: `/solar/${suburbSlug}/${brandSlug}/compare/`,
              changefreq: 'monthly',
              priority: 0.7,
              lastmod: new Date().toISOString(),
            });
          }
        });
        
        return additionalUrls;
      }
    } catch (error) {
      console.warn('Could not generate additional sitemap URLs:', error);
    }
    
    return [];
  },
  transform: async (config, path) => {
    // Custom priority for different page types
    let priority = 0.7;
    let changefreq = 'weekly';
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/solar/') && path.split('/').length === 4) {
      // Suburb pages (/solar/suburb/)
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.includes('/solar/') && path.split('/').length === 5) {
      // Brand pages (/solar/suburb/brand/)
      priority = 0.9;
      changefreq = 'monthly';
    } else if (path.includes('/compare/')) {
      // Compare pages
      priority = 0.7;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
}