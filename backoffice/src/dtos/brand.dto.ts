export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
}

export interface BrandRequest {
  name: string;
  description: string;
  logoUrl: string;
}
