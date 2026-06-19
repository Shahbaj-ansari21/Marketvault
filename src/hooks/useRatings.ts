import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { RatingSummary, Comment } from '../types';

export function useRatings(designId: string | undefined) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<RatingSummary>({ avg_rating: 0, total_ratings: 0 });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!designId) return;
    const { data: sum } = await supabase.rpc('design_rating_total', { d_design_id: designId });
    if (sum && sum.length > 0) setSummary({ avg_rating: Number(sum[0].avg_rating), total_ratings: Number(sum[0].total_ratings) });
    if (user) {
      const { data: ur } = await supabase.from('design_ratings').select('rating').eq('design_id', designId).eq('user_id', user.id).maybeSingle();
      if (ur) setUserRating(ur.rating);
    }
    setLoading(false);
  }, [designId, user]);

  useEffect(() => { load(); }, [load]);

  const rate = useCallback(async (rating: number): Promise<boolean> => {
    if (!user || !designId) return false;
    const { error } = await supabase
      .from('design_ratings')
      .upsert({ design_id: designId, user_id: user.id, rating }, { onConflict: 'design_id,user_id' });
    if (!error) { setUserRating(rating); load(); return true; }
    return false;
  }, [user, designId, load]);

  return { summary, userRating, loading, rate };
}

export function useComments(designId: string | undefined) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!designId) return;
    const { data } = await supabase
      .from('design_comments')
      .select('*, profiles(*)')
      .eq('design_id', designId)
      .order('created_at', { ascending: false });
    if (data) setComments(data as unknown as Comment[]);
    setLoading(false);
  }, [designId]);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (content: string): Promise<boolean> => {
    if (!user || !designId || !content.trim()) return false;
    const { error } = await supabase
      .from('design_comments')
      .insert({ design_id: designId, user_id: user.id, content: content.trim() });
    if (!error) { load(); return true; }
    return false;
  }, [user, designId, load]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('design_comments').delete().eq('id', id);
    if (!error) { setComments(prev => prev.filter(c => c.id !== id)); return true; }
    return false;
  }, []);

  return { comments, loading, add, remove };
}
