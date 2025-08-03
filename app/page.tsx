import { fetchSolarData } from '@/lib/sheets'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solar Installations Perth - Find Solar Installers by Suburb',
  description: 'Browse solar panel installers by suburb in Perth. Compare prices and find the best solar installation companies in your area.',
}

export default async function HomePage() {
  let siteData;
  
  try {
    siteData = await fetchSolarData();
  } catch (error) {
    console.error('Error loading data:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unable to Load Data
          </h1>
          <p className="text-gray-600">
            Please check your Google Sheets API configuration.
          </p>
        </div>
      </div>
    );
  }

  const { suburbs, brands } = siteData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Best Solar Installers in Perth
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Find and compare top-rated solar panel installers in your suburb. 
          Get quotes, compare prices, and choose the best solar system for your home.
        </p>
        <div className="bg-primary-50 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-primary-700 font-medium">
            🌞 Over {suburbs.length} suburbs covered • {brands.length}+ trusted brands
          </p>
        </div>
      </div>

      {/* Suburbs Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Browse by Suburb
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suburbs.map((suburb) => (
            <Link
              key={suburb}
              href={`/solar/${suburb.toLowerCase().replace(/\s+/g, '-')}`}
              className="card hover:border-primary-200 transition-all group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {suburb}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Solar installers →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Brands */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Popular Solar Brands
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.slice(0, 12).map((brand) => (
            <div
              key={brand}
              className="card text-center"
            >
              <p className="font-medium text-gray-900">{brand}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 rounded-lg text-white text-center py-12 px-6">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Go Solar?
        </h2>
        <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
          Compare solar installers in your area and get the best deal on your solar system installation.
        </p>
        <button className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-50 transition-colors">
          Get Free Quotes
        </button>
      </section>
    </div>
  )
}