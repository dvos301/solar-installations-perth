export interface SolarData {
  suburb: string;
  brand: string;
  system_size: string;
  avg_cost: string;
  description: string;
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

export interface SiteData {
  allData: SolarData[];
  suburbs: string[];
  brands: string[];
  systemSizes: string[];
}