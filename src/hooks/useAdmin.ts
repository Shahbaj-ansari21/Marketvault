import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { DesignWithProfile } from '../types';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setChecking(false); return; }
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.rpc('is_admin');
        if (active) setIsAdmin(!!data);
      } catch { if (active) setIsAdmin(false); }
      if (active) setChecking(false);
    })();
    return () => { active = false; };
  }, [user]);

  const registerAdmin = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase.from('admin_emails').insert({ email });
    if (!error) { setIsAdmin(true); return true; }
    return false;
  }, []);

  return { isAdmin, checking, registerAdmin };
}

export function useApprovalQueue() {
  const [pending, setPending] = useState<DesignWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('designs')
      .select('*, profiles(*), design_categories(*)')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setPending(data as DesignWithProfile[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = useCallback(async (id: string) => {
    await supabase.rpc('approve_design', { design_id: id });
    setPending(prev => prev.filter(d => d.id !== id));
  }, []);

  const reject = useCallback(async (id: string) => {
    await supabase.rpc('reject_design', { design_id: id });
    setPending(prev => prev.filter(d => d.id !== id));
  }, []);

  return { pending, loading, approve, reject, refresh: load };
}
