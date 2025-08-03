import { fetchSolarData, getBrandData, getRelatedSuburbs, getRelatedBrands } from '@/lib/sheets'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FAQSection from '@/components/FAQSection'
import InternalLinks from '@/components/InternalLinks'

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
  
  for (const item of siteData.allData) {
    const suburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
    const brandSlug = item.brand.toLowerCase().replace(/\s+/g, '-');
    const key = `${suburbSlug}-${brandSlug}`;
    
    // Avoid duplicates since multiple installers may have same suburb-brand combo
    if (!seen.has(key)) {
      seen.add(key);
      params.push({
        suburb: suburbSlug,
        brand: brandSlug,
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const siteData = await fetchSolarData();
  const suburbName = params.suburb.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const brandName = params.brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Find matching data to get exact brand name
  const matchingData = siteData.allData.find(item => {
    const itemSuburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
    const itemBrandSlug = item.brand.toLowerCase().replace(/\s+/g, '-');
    return itemSuburbSlug === params.suburb && itemBrandSlug === params.brand;
  });
  
  if (!matchingData) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }
  
  const { brand } = matchingData;
  
  return {
    title: `Best ${brand} Solar Installers in ${suburbName}`,
    description: `Find top-rated ${brand} solar installers in ${suburbName}. Compare reviews, ratings, and get free quotes from certified solar installation companies.`,
    keywords: `${brand} solar installers ${suburbName}, solar installation ${suburbName}, ${brand} solar panels`,
    openGraph: {
      title: `Best ${brand} Solar Installers in ${suburbName}`,
      description: `Find top-rated ${brand} solar installers in ${suburbName}.`,
    },
  };
}

export default async function BrandPage({ params }: Props) {
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
  
  const { brand } = installers[0]; // Get brand name from first installer
  
  // Sort installers by featured priority
  const sortedInstallers = installers.sort((a, b) => {
    const priorityA = parseInt(a.featured_priority) || 999;
    const priorityB = parseInt(b.featured_priority) || 999;
    return priorityA - priorityB;
  });
  
  const relatedSuburbs = getRelatedSuburbs(siteData.suburbs, installers[0].suburb, 5);
  const relatedBrands = getRelatedBrands(siteData.brands, brand, 5);

  const faqs = [
    {
      question: `How do I choose the best ${brand} solar installer in ${suburbName}?`,
      answer: `When choosing a ${brand} solar installer in ${suburbName}, consider their experience, customer reviews, certifications, warranty offerings, and pricing. Look for installers with high ratings and positive customer feedback.`
    },
    {
      question: `What warranty does ${brand} offer on their solar systems?`,
      answer: `${brand} typically offers comprehensive warranties on their solar systems, including product warranties and performance guarantees. Specific warranty terms vary by model and installer.`
    },
    {
      question: `How much can I save with ${brand} solar panels in ${suburbName}?`,
      answer: `${brand} solar systems in ${suburbName} can significantly reduce your electricity bills, with many homeowners saving 70-90% on their energy costs. Actual savings depend on system size, energy usage, and local electricity rates.`
    },
    {
      question: `Are there rebates available for ${brand} systems in ${suburbName}?`,
      answer: `Yes, ${suburbName} residents are eligible for federal solar rebates (STCs) and may qualify for additional state-based incentives. Your installer can help you claim all available rebates.`
    },
    {
      question: `How long does ${brand} solar installation take in ${suburbName}?`,
      answer: `Most ${brand} solar system installations in ${suburbName} take 1-2 days to complete, depending on roof complexity and electrical requirements.`
    }
  ];

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
          <span>{brand} Installers</span>
        </nav>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Best {brand} Solar Installers in {suburbName}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-8">
          Find top-rated {brand} solar installers in {suburbName}. 
          Compare reviews, ratings, and get free quotes from certified installation companies.
        </p>
      </div>

      {/* Installers List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Top {brand} Solar Installers in {suburbName}
            </h2>
            <div className="space-y-6">
              {sortedInstallers.map((installer, index) => (
                <div key={index} className="card border-l-4 border-l-primary-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {installer.installer_name}
                      </h3>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="font-medium">{installer.rating}</span>
                          <span className="text-gray-600 ml-1">({installer.reviews_count} reviews)</span>
                        </div>
                        {installer.featured_priority === '1' && (
                          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">
                        Specializing in: {installer.main_brands}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <a 
                      href={installer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Visit Website →
                    </a>
                    <button className="btn-primary">
                      Get Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="card bg-primary-50 border-primary-200 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose {brand}?</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Premium quality solar panels
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Excellent warranty coverage
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Proven performance in Australian conditions
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Trusted by certified installers
              </li>
            </ul>
            <Link 
              href={`/solar/${params.suburb}/${params.brand}/compare`}
              className="btn-primary w-full mt-4 text-center block"
            >
              Compare All Quotes
            </Link>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">💡</span>
                Get multiple quotes for comparison
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">💡</span>
                Check installer certifications
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">💡</span>
                Read recent customer reviews
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">💡</span>
                Understand warranty terms
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Internal Links */}
      <InternalLinks 
        relatedSuburbs={relatedSuburbs}
        relatedBrands={relatedBrands}
        currentSuburb={params.suburb}
        currentBrand={brand}
      />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />
    </div>
  )
}