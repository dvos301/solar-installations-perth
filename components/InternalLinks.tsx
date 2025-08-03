import Link from 'next/link';

interface InternalLinksProps {
  relatedSuburbs: string[];
  relatedBrands: string[];
  currentSuburb: string;
  currentBrand?: string;
}

export default function InternalLinks({ 
  relatedSuburbs, 
  relatedBrands, 
  currentSuburb,
  currentBrand 
}: InternalLinksProps) {
  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Related Suburbs */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Solar Installers in Nearby Suburbs
          </h3>
          <div className="space-y-2">
            {relatedSuburbs.map((suburb) => {
              const suburbSlug = suburb.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={suburb}
                  href={`/solar/${suburbSlug}`}
                  className="block text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Solar Installers in {suburb} →
                </Link>
              );
            })}
          </div>
        </div>

        {/* Related Brands */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {currentBrand ? 'Other Popular Solar Brands' : 'Popular Solar Brands'}
          </h3>
          <div className="space-y-2">
            {relatedBrands.map((brand) => (
              <div key={brand} className="text-gray-700">
                <span className="font-medium">{brand}</span>
                <span className="text-gray-500 text-sm ml-2">Solar Systems</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href={`/solar/${currentSuburb}`}
              className="text-primary-600 hover:text-primary-700 hover:underline text-sm"
            >
              View all options in this area →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}