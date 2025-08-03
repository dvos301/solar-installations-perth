import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Solar Installations Perth - Best Solar Panel Installers',
  description: 'Find the best solar panel installers in Perth and surrounding suburbs. Compare prices, brands, and system sizes from top-rated solar companies.',
  keywords: 'solar installation, solar panels, Perth, solar installers, solar system, renewable energy',
  openGraph: {
    title: 'Solar Installations Perth - Best Solar Panel Installers',
    description: 'Find the best solar panel installers in Perth and surrounding suburbs.',
    type: 'website',
    locale: 'en_AU',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}