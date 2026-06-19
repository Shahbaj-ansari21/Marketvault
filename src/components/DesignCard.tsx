import { Link } from 'react-router-dom';
import { ArrowRight, Download, Eye, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getFileTypeInfo, timeAgo, formatNumber } from '../types';
import type { DesignWithProfile } from '../types';

const THUMB_POOL = [
  'https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/3825582/pexels-photo-3825582.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
];

interface Props {
  design: DesignWithProfile;
  onDownload?: (d: DesignWithProfile) => void;
}

export function DesignCard({ design, onDownload }: Props) {
  const fi = getFileTypeInfo(design.file_name);
  const idx = design.id.charCodeAt(0) % THUMB_POOL.length;
  const thumb = design.thumbnail_url || THUMB_POOL[idx];
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(design.like_count || 0);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.rpc('design_rating_total', { d_design_id: design.id });
        if (active && data && data.length > 0) setRating(Number(data[0].avg_rating));
      } catch {}
    })();
    return () => { active = false; };
  }, [design.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) return;
    try {
      await supabase.rpc('handle_like', { design_id: design.id, is_add: true });
      setLiked(true);
      setLikes(p => p + 1);
    } catch {}
  };

  return (
    <div className="card-hover group flex flex-col overflow-hidden animate-fade-in">
      <Link to={`/design/${design.id}`} className="relative block overflow-hidden aspect-video bg-dark-900">
        <img src={thumb} alt={design.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 right-2">
          <span className={`file-type-badge ${fi.bg} ${fi.color}`}>{fi.label}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="btn-primary text-xs py-1.5 w-full justify-center">
            View Design <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to={`/design/${design.id}`} className="hover:text-primary-300 transition-colors">
          <h3 className="font-display font-semibold text-dark-100 text-sm line-clamp-2 leading-snug">{design.title}</h3>
        </Link>
        {design.description && (
          <p className="text-xs text-dark-500 line-clamp-2 leading-relaxed">{design.description}</p>
        )}
        {design.tags && design.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {design.tags.slice(0, 3).map(t => <span key={t} className="tag text-xs py-0.5">{t}</span>)}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dark-700/50">
          <Link to={`/profile/${design.user_id}`} className="flex items-center gap-1.5 group/u min-w-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {design.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-dark-400 group-hover/u:text-dark-200 transition-colors truncate max-w-[90px]">
              {design.profiles?.name || 'Unknown'}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-dark-500 shrink-0">
            {rating > 0 && (
              <span className="flex items-center gap-0.5 text-warning-400">
                <Star className="w-3 h-3 fill-current" />{rating.toFixed(1)}
              </span>
            )}
            <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? 'text-error-400' : 'hover:text-error-400'}`}>
              <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />{formatNumber(likes)}
            </button>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(design.view_count)}</span>
            <button onClick={e => { e.preventDefault(); onDownload?.(design); }} className="flex items-center gap-1 hover:text-accent-400 transition-colors">
              <Download className="w-3 h-3" />{formatNumber(design.download_count)}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {design.design_categories && (
            <span className="badge-primary text-xs">{design.design_categories.name}</span>
          )}
          <span className="text-xs text-dark-600 ml-auto">{timeAgo(design.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
