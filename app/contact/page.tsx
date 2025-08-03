import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Solar Perth - Get Help Finding Solar Installers',
  description: 'Contact Solar Perth for help finding the best solar panel installers in your area. We\'re here to help with your solar installation questions.',
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Contact Us
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-8">
            Have questions about solar installation in Perth? Need help finding the right 
            installer for your needs? We're here to help you navigate your solar journey.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-primary-100 rounded-lg p-3 mr-4">
                <span className="text-xl">📧</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600">hello@solarperth.com.au</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-100 rounded-lg p-3 mr-4">
                <span className="text-xl">📞</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="text-gray-600">(08) 9000 0000</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-100 rounded-lg p-3 mr-4">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Service Area</h3>
                <p className="text-gray-600">Perth and surrounding suburbs</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Send us a Message
          </h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-2">
                Suburb
              </label>
              <input
                type="text"
                id="suburb"
                name="suburb"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about your solar installation needs..."
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-16 bg-gray-100 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I choose the right solar installer?
            </h3>
            <p className="text-gray-600 text-sm">
              Look for licensed installers with good reviews, proper certifications, 
              and transparent pricing. Our directory helps you compare options.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What size solar system do I need?
            </h3>
            <p className="text-gray-600 text-sm">
              System size depends on your energy usage, roof space, and budget. 
              Most homes benefit from 6.6kW to 13.2kW systems.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How long does installation take?
            </h3>
            <p className="text-gray-600 text-sm">
              Physical installation typically takes 1-3 days, but the entire process 
              from quote to connection can take 4-8 weeks.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Do I need council approval?
            </h3>
            <p className="text-gray-600 text-sm">
              Most residential installations don't require council approval if they 
              meet standard requirements. Your installer will advise you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}