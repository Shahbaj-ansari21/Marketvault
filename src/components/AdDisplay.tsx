import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useAds } from '../hooks/useAds';
import { Link } from 'react-router-dom';

interface Props {
  position: 'sidebar' | 'banner' | 'inline' | 'footer';
  limit?: number;
}

export function AdDisplay({ position, limit = 1 }: Props) {
  const { ads, loading } = useAds(position);

  if (loading || ads.length === 0) return null;
  const display = ads.slice(0, limit);

  return (
    <div className={`space-y-3 ${position === 'banner' ? 'w-full' : ''}`}>
      {display.map(ad => (
        <AdCard key={ad.id} ad={ad} position={position} />
      ))}
    </div>
  );
}

function AdCard({ ad, position }: { ad: any; position: string }) {
  const handleClick = async () => {
    try {
      const supabase = (await import('../lib/supabase')).supabase;
      await supabase.rpc('increment_ad_click', { ad_id: ad.id });
    } catch { /* silently fail */ }
    if (ad.link_url) window.open(ad.link_url, '_blank', 'noopener');
  };

  const isBanner = position === 'banner';
  const isInline = position === 'inline';
  const isSidebar = position === 'sidebar';

  return (
    <div
      className={`relative group cursor-pointer overflow-hidden border border-primary-500/20 rounded-xl
        ${isBanner ? 'w-full h-[120px] bg-gradient-to-r from-primary-900/40 to-dark-800' : ''}
        ${isSidebar ? 'w-full bg-dark-800/80' : ''}
        ${isInline ? 'w-full bg-dark-800/80' : ''}
      `}
      onClick={handleClick}
    >
      {/* Ad label */}
      <div className="absolute top-1.5 left-1.5 z-10">
        <span className="text-[9px] font-semibold text-primary-400/70 bg-dark-900/60 px-1.5 py-0.5 rounded">SPONSORED</span>
      </div>

      {isBanner ? (
        <div className="flex items-center gap-4 h-full px-6 py-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-700 shrink-0 border border-dark-600">
            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-primary-300 truncate">{ad.title}</h4>
            <p className="text-xs text-dark-400 mt-0.5 flex items-center gap-1">
              {ad.link_url} <ExternalLink className="w-3 h-3 text-primary-400" />
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-[10px] text-primary-500/50 bg-primary-500/10 px-2 py-1 rounded-full border border-primary-500/20">Ad</span>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <div className="w-full h-28 rounded-lg overflow-hidden bg-dark-700 border border-dark-600 mb-2">
            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <h4 className="text-sm font-semibold text-dark-100 truncate">{ad.title}</h4>
          <p className="text-xs text-dark-500 mt-1 flex items-center gap-1">
            <ExternalLink className="w-3 h-3 text-primary-400" />{ad.link_url}
          </p>
        </div>
      )}
    </div>
  );
}

export function AdSlot({ position }: { position: 'sidebar' | 'banner' | 'inline' | 'footer' }) {
  return <AdDisplay position={position} limit={1} />;
}
