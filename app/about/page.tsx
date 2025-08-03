import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Solar Perth - Your Trusted Solar Installation Guide',
  description: 'Learn about Solar Perth, your comprehensive guide to finding the best solar panel installers across Perth and surrounding suburbs.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        About Solar Perth
      </h1>
      
      <div className="prose max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          Solar Perth is your comprehensive guide to finding the best solar panel installers 
          across Perth and surrounding suburbs. We help homeowners make informed decisions 
          about their solar journey.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To simplify the process of finding reliable, quality solar installers in Perth. 
              We provide transparent information about pricing, brands, and system sizes to 
              help you make the best choice for your home.
            </p>
          </div>
          
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Solar?</h2>
            <p className="text-gray-600">
              Solar energy is clean, renewable, and can significantly reduce your electricity 
              bills. Perth's sunny climate makes it one of the best locations in Australia 
              for solar power generation.
            </p>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Offer</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Coverage</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive coverage of Perth suburbs and surrounding areas
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Transparency</h3>
            <p className="text-gray-600 text-sm">
              Clear pricing information to help you compare options
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Brands</h3>
            <p className="text-gray-600 text-sm">
              Information about reputable solar brands and installers
            </p>
          </div>
        </div>
        
        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Solar Journey?
          </h2>
          <p className="text-gray-600 mb-6">
            Browse our comprehensive directory of solar installers and find the perfect 
            system for your home and budget.
          </p>
          <a 
            href="/" 
            className="btn-primary"
          >
            Find Solar Installers
          </a>
        </div>
      </div>
    </div>
  )
}