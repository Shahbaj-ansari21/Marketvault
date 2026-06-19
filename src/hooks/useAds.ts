import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Ad } from '../types';

export function useAds(position: string) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .eq('position', position)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', { ascending: false });
      if (data) setAds(data);
      setLoading(false);
    };
    load();
  }, [position]);

  const trackView = useCallback(async (adId: string) => {
    await supabase.from('ads').update({ view_count: (await supabase.from('ads').select('view_count').eq('id', adId).single()).data?.view_count + 1 }).eq('id', adId);
  }, []);

  const trackClick = useCallback(async (adId: string) => {
    await supabase.rpc('increment_ad_click', { ad_id: adId });
  }, []);

  return { ads, loading, trackView, trackClick };
}

export function useAllAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
    if (data) setAds(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (ad: Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'click_count'>) => {
    const { data, error } = await supabase.from('ads').insert(ad).select().single();
    if (!error && data) { setAds(prev => [data, ...prev]); }
    return { data, error };
  };

  const update = async (id: string, changes: Partial<Ad>) => {
    const { data, error } = await supabase.from('ads').update(changes).eq('id', id).select().single();
    if (!error && data) { setAds(prev => prev.map(a => a.id === id ? data : a)); }
    return { data, error };
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (!error) setAds(prev => prev.filter(a => a.id !== id));
    return { error };
  };

  return { ads, loading, create, update, remove, refresh: load };
}
