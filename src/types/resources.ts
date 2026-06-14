export type ResourceType = "document" | "video" | "article";

export interface Resource {
  id: number;
  title: string;
  description: string;
  resource_type: ResourceType;
  file_url: string | null;
  video_url: string | null;
  content: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type FarmstayCategory = "local" | "global";

export interface Farmstay {
  id: number;
  name: string;
  description: string;
  location: string;
  city: string;
  province: string;
  website_url: string | null;
  category: FarmstayCategory;
  owner_id: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasterDataItem {
  id: number;
  label: string;
  type: string; // e.g. "province", "city", "accommodation_type"
}

// Admin payloads
export interface AdminResourcePayload {
  title: string;
  description: string;
  resource_type: ResourceType;
  content?: string | null;
  video_url?: string | null;
  is_published: boolean;
  file_url?: string | null;
}

export interface AdminFarmstayPayload {
  name: string;
  description: string;
  location: string;
  city: string;
  province: string;
  website_url?: string | null;
  category: FarmstayCategory;
  owner_id?: number | null;
  image_url?: string | null;
}

export interface AdminMasterDataPayload {
  label: string;
}
