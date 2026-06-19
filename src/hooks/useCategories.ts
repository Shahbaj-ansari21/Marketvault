import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { DesignCategory } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<DesignCategory[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('design_categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
      setLoading(false);
    });
  }, []);
  return { categories, loading };
}
