import { fetchSolarData, getSuburbData, getRelatedSuburbs, getRelatedBrands } from '@/lib/sheets'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FAQSection from '@/components/FAQSection'
import InternalLinks from '@/components/InternalLinks'

interface Props {
  params: { suburb: string }
}

export async function generateStaticParams() {
  const siteData = await fetchSolarData();
  
  return siteData.suburbs.map((suburb) => ({
    suburb: suburb.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const suburbName = params.suburb.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `Best Solar Installers in ${suburbName} - Compare Quotes & Prices`,
    description: `Find top-rated solar panel installers in ${suburbName}. Compare prices, brands, and system sizes. Get free quotes from trusted solar companies.`,
    keywords: `solar installation ${suburbName}, solar panels ${suburbName}, solar installers ${suburbName}, solar system`,
    openGraph: {
      title: `Best Solar Installers in ${suburbName}`,
      description: `Find top-rated solar panel installers in ${suburbName}. Compare prices and get free quotes.`,
    },
  };
}

export default async function SuburbPage({ params }: Props) {
  const siteData = await fetchSolarData();
  const suburbName = params.suburb.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Find exact suburb match
  const exactSuburb = siteData.suburbs.find(s => 
    s.toLowerCase().replace(/\s+/g, '-') === params.suburb
  );
  
  if (!exactSuburb) {
    notFound();
  }
  
  const suburbData = getSuburbData(siteData.allData, exactSuburb);
  const relatedSuburbs = getRelatedSuburbs(siteData.suburbs, exactSuburb, 5);
  const relatedBrands = getRelatedBrands(siteData.brands, undefined, 5);
  
  // Group data by brand and system size
  const brandSystemCombos = suburbData.reduce((acc, item) => {
    const key = `${item.brand}-${item.system_size}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof suburbData>);

  const faqs = [
    {
      question: `How much does solar installation cost in ${suburbName}?`,
      answer: `Solar installation costs in ${suburbName} typically range from $3,000 to $15,000 depending on system size and quality. Factors affecting price include your roof type, energy usage, and chosen equipment quality.`
    },
    {
      question: `What are the best solar brands available in ${suburbName}?`,
      answer: `Popular solar brands in ${suburbName} include ${siteData.brands.slice(0, 5).join(', ')}, and others. The best brand depends on your budget, warranty preferences, and energy requirements.`
    },
    {
      question: `How long does solar installation take in ${suburbName}?`,
      answer: `Most solar installations in ${suburbName} are completed within 1-3 days, depending on system complexity. The entire process from approval to activation typically takes 4-8 weeks.`
    },
    {
      question: `Do I need council approval for solar panels in ${suburbName}?`,
      answer: `Most residential solar installations in ${suburbName} don't require council approval if they meet standard requirements. Your installer will handle any necessary permits and approvals.`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <nav className="text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Solar Installers in {suburbName}</span>
        </nav>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Best Solar Installers in {suburbName}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-8">
          Compare top-rated solar panel installers in {suburbName}. Get free quotes, 
          compare prices, and find the perfect solar system for your home.
        </p>
      </div>

      {/* Solar Options Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Solar Options in {suburbName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(brandSystemCombos).map(([key, items]) => {
            const item = items[0]; // Use first item for display
            const brandSystemSlug = `${item.brand.toLowerCase().replace(/\s+/g, '-')}-${item.system_size.toLowerCase().replace(/\s+/g, '-')}`;
            
            return (
              <Link
                key={key}
                href={`/solar/${params.suburb}/${brandSystemSlug}`}
                className="card hover:border-primary-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {item.brand} {item.system_size}
                  </h3>
                  <span className="text-lg font-bold text-primary-600">
                    {item.avg_cost}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description || `Premium ${item.brand} ${item.system_size} solar system installation in ${suburbName}.`}
                </p>
                <div className="text-primary-600 text-sm font-medium">
                  View Details →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mb-16">
        <div className="bg-gray-100 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Solar Installation Stats for {suburbName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Object.keys(brandSystemCombos).length}
              </div>
              <div className="text-gray-600">Solar Options Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {siteData.brands.length}+
              </div>
              <div className="text-gray-600">Trusted Brands</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <InternalLinks 
        relatedSuburbs={relatedSuburbs}
        relatedBrands={relatedBrands}
        currentSuburb={params.suburb}
      />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />
    </div>
  )
}