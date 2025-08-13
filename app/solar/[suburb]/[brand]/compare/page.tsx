import { fetchSolarData, getBrandData, getRelatedSuburbs, getRelatedBrands } from '@/lib/sheets'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QuoteButtons from './QuoteButtons'

interface Props {
  params: { 
    suburb: string
    brand: string 
  }
}

export async function generateStaticParams() {
  const siteData = await fetchSolarData();
  const params = [];
  const seen = new Set();
  
  // Only pre-generate compare pages for top combinations
  const popularSuburbs = siteData.suburbs.slice(0, 5); // Top 5 suburbs only
  const popularBrands = siteData.brands.slice(0, 5); // Top 5 brands only
  
  for (const item of siteData.allData) {
    const suburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
    const brandSlug = item.brand.toLowerCase().replace(/\s+/g, '-');
    const key = `${suburbSlug}-${brandSlug}`;
    
    // Only include if both suburb and brand are in popular lists
    const isPopularSuburb = popularSuburbs.some(s => 
      s.toLowerCase().replace(/\s+/g, '-') === suburbSlug
    );
    const isPopularBrand = popularBrands.some(b => 
      b.toLowerCase().replace(/\s+/g, '-') === brandSlug
    );
    
    if (!seen.has(key) && isPopularSuburb && isPopularBrand) {
      seen.add(key);
      params.push({
        suburb: suburbSlug,
        brand: brandSlug,
      });
    }
  }
  
  console.log(`Pre-generating ${params.length} compare pages`);
  return params;
}

// Enable ISR with 24-hour revalidation
export const revalidate = 86400; // 24 hours in seconds

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const siteData = await fetchSolarData();
  const suburbName = params.suburb.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const brandName = params.brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `Compare ${brandName} Solar Installers in ${suburbName} - Quotes & Reviews`,
    description: `Compare all ${brandName} solar installers in ${suburbName}. View ratings, reviews, specializations, and get quotes from multiple certified installers.`,
    keywords: `compare ${brandName} installers ${suburbName}, solar quotes ${suburbName}, ${brandName} solar comparison`,
    openGraph: {
      title: `Compare ${brandName} Solar Installers in ${suburbName}`,
      description: `Compare ratings, reviews, and get quotes from all ${brandName} installers in ${suburbName}.`,
    },
  };
}

export default async function ComparePage({ params }: Props) {
  const siteData = await fetchSolarData();
  const suburbName = params.suburb.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Find all installers for this suburb and brand
  const installers = siteData.allData.filter(item => {
    const itemSuburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
    const itemBrandSlug = item.brand.toLowerCase().replace(/\s+/g, '-');
    return itemSuburbSlug === params.suburb && itemBrandSlug === params.brand;
  });
  
  if (!installers.length) {
    notFound();
  }
  
  const { brand } = installers[0];
  
  // Sort installers by featured priority
  const sortedInstallers = installers.sort((a, b) => {
    const priorityA = parseInt(a.featured_priority) || 999;
    const priorityB = parseInt(b.featured_priority) || 999;
    return priorityA - priorityB;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <nav className="text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/solar/${params.suburb}`} className="hover:text-primary-600">
            Solar in {suburbName}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/solar/${params.suburb}/${params.brand}`} className="hover:text-primary-600">
            {brand} Installers
          </Link>
          <span className="mx-2">/</span>
          <span>Compare All</span>
        </nav>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Compare All {brand} Solar Installers in {suburbName}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-8">
          Side-by-side comparison of all {brand} solar installers in {suburbName}. 
          Compare ratings, reviews, specializations, and get quotes from multiple certified companies.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Installer</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Rating</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Reviews</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Specializations</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Featured</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedInstallers.map((installer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {installer.installer_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {brand} specialist in {suburbName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="font-semibold text-lg">{installer.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600">{installer.reviews_count}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {installer.main_brands.split(', ').map((brandItem, idx) => (
                        <span 
                          key={idx}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {brandItem.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {installer.featured_priority === '1' ? (
                      <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                        ⭐ Featured
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col space-y-2">
                      <a 
                        href={installer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Visit Website
                      </a>
                      <button className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition-colors">
                        Get Quote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How to Compare Solar Installers</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              <span><strong>Check ratings and reviews:</strong> Look for consistently high ratings (4.5+) and recent positive reviews.</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              <span><strong>Verify specializations:</strong> Ensure they have experience with your preferred brands.</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              <span><strong>Get multiple quotes:</strong> Compare pricing, warranties, and installation timelines.</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">4.</span>
              <span><strong>Check certifications:</strong> Ensure they're licensed and certified for solar installations.</span>
            </li>
          </ul>
        </div>
        
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose {brand}?</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Premium quality solar panels with excellent efficiency ratings</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Comprehensive warranty coverage for peace of mind</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Proven performance in Australian climate conditions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Trusted by certified installers across Perth</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gray-100 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Get Your {brand} Solar System?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Contact multiple installers above to compare quotes and find the best deal for your {brand} solar installation in {suburbName}.
        </p>
        <div className="mb-6">
          <QuoteButtons 
            installers={sortedInstallers.map(installer => ({
              installer_name: installer.installer_name,
              website: installer.website
            }))}
            suburb={suburbName}
            brand={brand}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={`/solar/${params.suburb}/${params.brand}`}
            className="btn-secondary"
          >
            ← Back to {brand} Installers
          </Link>
          <Link 
            href={`/solar/${params.suburb}`}
            className="btn-primary"
          >
            View All Brands in {suburbName}
          </Link>
        </div>
      </div>
    </div>
  )
}
