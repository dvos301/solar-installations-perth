# Solar Installations Perth - Programmatic SEO Site

A high-performance Next.js 14 application that dynamically generates static pages for solar installation services across Perth suburbs. Built with the App Router, Tailwind CSS, and Google Sheets API integration for easy content management.

## 🚀 Features

- **Programmatic SEO**: Automatically generates thousands of static pages for different suburb and brand combinations
- **Google Sheets Integration**: Content managed through Google Sheets for non-technical users
- **Static Site Generation**: All pages pre-rendered at build time for maximum SEO performance
- **Dynamic Routes**: 
  - `/solar/[suburb]` - Suburb-specific solar installer pages
  - `/solar/[suburb]/[brand]-[system_size]` - Specific brand and system size pages
- **SEO Optimized**:
  - Meta tags and Open Graph data
  - JSON-LD FAQ schema markup
  - Automatic sitemap generation
  - Clean, semantic HTML structure
- **Responsive Design**: Mobile-first Tailwind CSS styling
- **Internal Linking**: Automated related links for better SEO
- **Vercel Ready**: One-click deployment to Vercel

## 📋 Prerequisites

Before setting up this project, you'll need:

1. Node.js 18+ installed
2. A Google Cloud Platform account
3. A Google Sheets document with your data
4. A Vercel account (for deployment)

## 🛠️ Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd solar-installations-perth
npm install
\`\`\`

### 2. Google Sheets API Setup

#### Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Step 2: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll need this for your environment variables)
4. (Optional) Restrict the API key to only Google Sheets API for security

#### Step 3: Prepare Your Google Sheet

1. Create a new Google Sheet or use an existing one
2. Set up your columns in the first row (headers):
   - `suburb` - The suburb name (e.g., "Fremantle", "Joondalup")
   - `brand` - Solar brand name (e.g., "Tesla", "LG", "Canadian Solar")
   - `system_size` - System size (e.g., "6.6kW", "10kW", "13.2kW")
   - `avg_cost` - Average cost (e.g., "$8,500", "$12,000")
   - `description` - Brief description of the solar system
   - Add any additional columns as needed (the system is extensible)

3. Fill in your data rows
4. Make the sheet publicly viewable:
   - Click "Share" in the top right
   - Change access to "Anyone with the link can view"
   - Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

Example Sheet structure:
| suburb    | brand     | system_size | avg_cost | description |
|-----------|-----------|-------------|----------|-------------|
| Fremantle | Tesla     | 6.6kW       | $9,500   | Premium Tesla solar system with Powerwall compatibility |
| Joondalup | LG        | 10kW        | $12,000  | High-efficiency LG panels with 25-year warranty |

### 3. Environment Variables

Create a \`.env.local\` file in your project root:

\`\`\`env
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
GOOGLE_SHEET_ID=your_google_sheet_id_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 4. Local Development

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your site.

## 🚀 Deployment to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/solar-installations-perth)

### Option 2: Manual Deployment

1. **Install Vercel CLI**:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Login to Vercel**:
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   vercel
   \`\`\`

4. **Add Environment Variables in Vercel**:
   - Go to your project in the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add the following variables:
     - \`GOOGLE_SHEETS_API_KEY\` (your Google Sheets API key)
     - \`GOOGLE_SHEET_ID\` (your Google Sheet ID)
     - \`NEXT_PUBLIC_SITE_URL\` (your production URL, e.g., https://your-site.vercel.app)

5. **Redeploy** to apply the environment variables:
   \`\`\`bash
   vercel --prod
   \`\`\`

## 📁 Project Structure

\`\`\`
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── solar/
│       └── [suburb]/
│           ├── page.tsx         # Suburb-specific pages
│           └── [brand-system]/
│               └── page.tsx     # Brand+system specific pages
├── components/                   # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── FAQSection.tsx
│   └── InternalLinks.tsx
├── lib/                         # Utility functions
│   ├── types.ts                 # TypeScript types
│   └── sheets.ts                # Google Sheets integration
├── next-sitemap.config.js       # Sitemap configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── vercel.json                  # Vercel deployment configuration
\`\`\`

## 🎨 Customization

### Adding New Data Columns

The system is designed to be extensible. To add new columns to your Google Sheet:

1. Add the new column header to your Google Sheet
2. The data will automatically be available in the \`SolarData\` type as \`[key: string]: string\`
3. Update your components to display the new data as needed

### Styling Customization

The site uses Tailwind CSS with a minimal, clean design. Key customization points:

- **Colors**: Edit \`tailwind.config.ts\` to change the primary color scheme
- **Typography**: Font settings are in \`app/globals.css\`
- **Components**: Reusable component styles are in \`app/globals.css\` under \`@layer components\`

### SEO Optimization

- **Meta Tags**: Each page generates unique meta titles and descriptions
- **JSON-LD Schema**: FAQ sections include structured data
- **Sitemap**: Automatically generated with \`next-sitemap\`
- **Internal Linking**: Automated related links between pages

## 📈 Performance

- **Static Generation**: All pages are pre-rendered at build time
- **Image Optimization**: Disabled for static export compatibility
- **Code Splitting**: Automatic with Next.js App Router
- **Minimal CSS**: Only necessary Tailwind styles are included

## 🔧 Troubleshooting

### Common Issues

1. **"Missing Google Sheets API credentials"**
   - Ensure your \`.env.local\` file has the correct API key and Sheet ID
   - Verify the API key has access to the Google Sheets API

2. **"No data found in the sheet"**
   - Check that your Google Sheet is publicly accessible
   - Verify the Sheet ID is correct
   - Ensure your sheet has data in the expected format

3. **Build errors during deployment**
   - Verify all environment variables are set in Vercel
   - Check that your Google Sheet is accessible from the build environment

4. **Pages not generating correctly**
   - Ensure your data follows the expected format
   - Check for special characters in suburb/brand names that might affect URL generation

### Support

If you encounter issues:

1. Check the console for error messages
2. Verify your Google Sheets API setup
3. Ensure all environment variables are correctly set
4. Check that your data format matches the expected structure

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ using Next.js 14, Tailwind CSS, and Google Sheets API.