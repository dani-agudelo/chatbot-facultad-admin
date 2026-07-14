import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { Branding } from './types';

const DEFAULT_BRANDING: Branding = {
  logo_url: '',
  primary_color: '#00407d',
  accent_color: '#f27022',
  brand_name: 'Chatbot Facultad',
  brand_subtitle: 'Administración',
};

type BrandingContextValue = {
  branding: Branding;
  loading: boolean;
  applyBranding: (next: Branding) => void;
  refreshBranding: () => Promise<void>;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

function paintTheme(branding: Branding) {
  const root = document.documentElement;
  root.style.setProperty('--navy', branding.primary_color || DEFAULT_BRANDING.primary_color);
  root.style.setProperty('--orange', branding.accent_color || DEFAULT_BRANDING.accent_color);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const applyBranding = useCallback((next: Branding) => {
    setBranding(next);
    paintTheme(next);
  }, []);

  const refreshBranding = useCallback(async () => {
    try {
      const data = await api<Branding>('/admin/branding');
      applyBranding({ ...DEFAULT_BRANDING, ...data });
    } catch {
      applyBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  }, [applyBranding]);

  useEffect(() => {
    void refreshBranding();
  }, [refreshBranding]);

  const value = useMemo(
    () => ({ branding, loading, applyBranding, refreshBranding }),
    [branding, loading, applyBranding, refreshBranding],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding debe usarse dentro de BrandingProvider');
  return ctx;
}
