import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
            >
              Solar Perth
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}