import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface FooterBanner {
  id: string;
  image_url: string;
  link_url: string | null;
  alt_text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function useFooterBanners() {
  const [banners, setBanners] = useState<FooterBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('footer_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);
  return { banners, loading, refresh: fetch };
}

export function useAllFooterBanners() {
  const [banners, setBanners] = useState<FooterBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const { data } = await supabase
      .from('footer_banners')
      .select('*')
      .order('sort_order', { ascending: true });
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const create = async (vals: { image_url: string; link_url?: string; alt_text?: string; sort_order?: number }) => {
    const { error } = await supabase.from('footer_banners').insert({
      image_url: vals.image_url,
      link_url: vals.link_url || null,
      alt_text: vals.alt_text || '',
      sort_order: vals.sort_order ?? 0,
      is_active: true,
    });
    if (!error) await fetchAll();
    return { error };
  };

  const toggle = async (id: string, is_active: boolean) => {
    await supabase.from('footer_banners').update({ is_active }).eq('id', id);
    await fetchAll();
  };

  const remove = async (id: string) => {
    await supabase.from('footer_banners').delete().eq('id', id);
    await fetchAll();
  };

  return { banners, loading, create, toggle, remove };
}
