export interface SolarData {
  suburb: string;
  brand: string;
  installer_name: string;
  rating: string;
  reviews_count: string;
  main_brands: string;
  featured_priority: string;
  website: string;
  // Allow for future columns
  [key: string]: string;
}

export interface PageData {
  suburb: string;
  brand?: string;
  system_size?: string;
  data: SolarData[];
  relatedSuburbs: string[];
  relatedBrands: string[];
}

export interface InstallerData {
  suburb: string;
  brand: string;
  installer_name: string;
  featured_priority: string;
  // Allow for future columns
  [key: string]: string;
}

export interface SiteData {
  allData: SolarData[];
  installerData: InstallerData[];
  suburbs: string[];
  brands: string[];
  systemSizes: string[];
}