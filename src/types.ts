export type AdminUser = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export type Dashboard = {
  status: string;
  provider: string;
  model: string;
  documents_count: number;
  reindex_required: boolean;
  last_reindex_at: string | null;
  last_reindex_result: string | null;
};

export type Branding = {
  logo_url: string;
  primary_color: string;
  accent_color: string;
  brand_name: string;
  brand_subtitle: string;
};

export type Settings = {
  provider: 'gemini' | 'nvidia';
  llm_model: string;
  embed_model: string;
  similarity_top_k: number;
  reindex_required: boolean;
  last_reindex_at: string | null;
  last_reindex_result: string | null;
  updated_at: string | null;
  gemini_api_key_set: boolean;
  nvidia_api_key_set: boolean;
  gemini_api_key_env: boolean;
  nvidia_api_key_env: boolean;
} & Branding;

export type DocumentItem = {
  file_name: string;
  size_bytes: number;
  updated_at: string;
};

export type ChatTestResponse = {
  answer: string;
  provider: string;
  model: string;
  sources: Array<{ file_name: string; page_label: string; score?: number | null }>;
  note?: string | null;
};
