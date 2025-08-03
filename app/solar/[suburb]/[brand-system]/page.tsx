import { fetchSolarData, getBrandSystemData, getRelatedSuburbs, getRelatedBrands } from '@/lib/sheets'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FAQSection from '@/components/FAQSection'
import InternalLinks from '@/components/InternalLinks'

interface Props {
  params: { 
    suburb: string
    'brand-system': string 
  }
}

export async function generateStaticParams() {
  const siteData = await fetchSolarData();
  const params = [];
  
  for (const item of siteData.allData) {
    const suburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
    const brandSystemSlug = `${item.brand.toLowerCase().replace(/\s+/g, '-')}-${item.system_size.toLowerCase().replace(/\s+/g, '-')}`;
    
    params.push({
      suburb: suburbSlug,
      'brand-system': brandSystemSlug,
    });
  }
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const siteData = await fetchSolarData();
  const suburbName = params.suburb.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Parse brand and system from slug
  const brandSystemSlug = params['brand-system'];
  const parts = brandSystemSlug.split('-');
  
  // Find matching data to get exact brand and system names
  const matchingData = siteData.allData.find(item => {
    const itemSuburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
    const itemBrandSystemSlug = `${item.brand.toLowerCase().replace(/\s+/g, '-')}-${item.system_size.toLowerCase().replace(/\s+/g, '-')}`;
    return itemSuburbSlug === params.suburb && itemBrandSystemSlug === brandSystemSlug;
  });
  
  if (!matchingData) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }
  
  const { brand, system_size } = matchingData;
  
  return {
    title: `Best ${brand} ${system_size} Solar Installers in ${suburbName}`,
    description: `Get ${brand} ${system_size} solar system installed in ${suburbName}. Compare prices, read reviews, and get free quotes from certified installers.`,
    keywords: `${brand} solar panels ${suburbName}, ${system_size} solar system ${suburbName}, solar installation`,
    openGraph: {
      title: `Best ${brand} ${system_size} Solar Installers in ${suburbName}`,
      description: `Get ${brand} ${system_size} solar system installed in ${suburbName}.`,
    },
  };
}

export default async function BrandSystemPage({ params }: Props) {
  const siteData = await fetchSolarData();
  const suburbName = params.suburb.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const brandSystemSlug = params['brand-system'];
  
  // Find matching data
  const matchingData = siteData.allData.find(item => {
    const itemSuburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
    const itemBrandSystemSlug = `${item.brand.toLowerCase().replace(/\s+/g, '-')}-${item.system_size.toLowerCase().replace(/\s+/g, '-')}`;
    return itemSuburbSlug === params.suburb && itemBrandSystemSlug === brandSystemSlug;
  });
  
  if (!matchingData) {
    notFound();
  }
  
  const { brand, system_size, avg_cost, description } = matchingData;
  const relatedSuburbs = getRelatedSuburbs(siteData.suburbs, matchingData.suburb, 5);
  const relatedBrands = getRelatedBrands(siteData.brands, brand, 5);

  const faqs = [
    {
      question: `How much does a ${brand} ${system_size} system cost in ${suburbName}?`,
      answer: `A ${brand} ${system_size} solar system in ${suburbName} typically costs around ${avg_cost}. Final pricing may vary based on roof complexity, installation requirements, and current promotions.`
    },
    {
      question: `What warranty does ${brand} offer on their ${system_size} systems?`,
      answer: `${brand} typically offers comprehensive warranties on their solar systems, including product warranties and performance guarantees. Specific warranty terms vary by model and installer.`
    },
    {
      question: `How much electricity will a ${system_size} system generate in ${suburbName}?`,
      answer: `A ${system_size} solar system in ${suburbName} can generate approximately 15-25 kWh per day on average, depending on roof orientation, shading, and seasonal variations.`
    },
    {
      question: `Is ${brand} a good solar brand for ${suburbName} conditions?`,
      answer: `${brand} is well-suited for ${suburbName}'s climate conditions. Their panels are designed to handle Australian weather and perform efficiently in Perth's sunny environment.`
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
          <span>{brand} {system_size}</span>
        </nav>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Best {brand} {system_size} Solar Installers in {suburbName}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-8">
          Get professional {brand} {system_size} solar system installation in {suburbName}. 
          Compare quotes from certified installers and save on your energy bills.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {brand} {system_size} Solar System Details
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 text-lg mb-6">
                {description || `The ${brand} ${system_size} solar system is an excellent choice for homes in ${suburbName}. This system offers reliable performance, quality components, and excellent value for money.`}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>High-efficiency {brand} solar panels</li>
                <li>{system_size} system size suitable for average homes</li>
                <li>Professional installation by certified technicians</li>
                <li>Comprehensive warranty coverage</li>
                <li>Excellent performance in Perth's climate</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Installation Process:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                <li>Free on-site assessment and quote</li>
                <li>System design and permit applications</li>
                <li>Professional installation (1-2 days)</li>
                <li>Electrical connection and testing</li>
                <li>System commissioning and handover</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card bg-primary-50 border-primary-200 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Pricing</h3>
            <div className="text-3xl font-bold text-primary-600 mb-2">{avg_cost}</div>
            <p className="text-sm text-gray-600 mb-4">
              Average price for {brand} {system_size} in {suburbName}
            </p>
            <button className="btn-primary w-full">
              Get Free Quote
            </button>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose This System?</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Proven reliability and performance
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Excellent value for money
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Professional installation team
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Comprehensive warranty coverage
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