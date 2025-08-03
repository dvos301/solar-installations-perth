'use client'

interface Installer {
  installer_name: string;
  website: string;
}

interface QuoteButtonsProps {
  installers: Installer[];
  suburb: string;
  brand: string;
}

export default function QuoteButtons({ installers, suburb, brand }: QuoteButtonsProps) {
  const handleGetAllQuotes = () => {
    // Open all installer websites in new tabs
    installers.forEach((installer, index) => {
      setTimeout(() => {
        window.open(installer.website, '_blank');
      }, index * 500); // Stagger the opening to avoid popup blockers
    });
  };

  const handleEmailQuote = () => {
    const subject = encodeURIComponent(`Solar Quote Request - ${brand} in ${suburb}`);
    const body = encodeURIComponent(`Hi,

I'm interested in getting quotes for ${brand} solar panel installation in ${suburb}.

Could you please provide me with:
- System sizing recommendations
- Pricing options
- Installation timeline
- Warranty information

I'm comparing quotes from multiple installers to make an informed decision.

Thank you for your time.

Best regards`);

    const emailAddresses = installers.map(installer => {
      // Extract domain from website and create a generic email
      try {
        const domain = new URL(installer.website).hostname;
        return `info@${domain}`;
      } catch {
        return '';
      }
    }).filter(Boolean);

    if (emailAddresses.length > 0) {
      window.location.href = `mailto:${emailAddresses.join(',')}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        onClick={handleGetAllQuotes}
        className="btn-primary"
      >
        🌐 Visit All Websites ({installers.length})
      </button>
      <button 
        onClick={handleEmailQuote}
        className="btn-secondary"
      >
        ✉️ Email All for Quotes
      </button>
    </div>
  );
}
