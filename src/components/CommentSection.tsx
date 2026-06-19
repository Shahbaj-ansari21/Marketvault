import { useState } from 'react';
import { Star, Trash2, Send, MessageSquare } from 'lucide-react';
import { useRatings, useComments } from '../hooks/useRatings';
import { useAuth } from '../hooks/useAuth';
import { formatNumber, timeAgo } from '../types';
import { Link } from 'react-router-dom';

export function StarRatingDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`${sz} ${n <= Math.round(rating) ? 'text-warning-400 fill-warning-400' : 'text-dark-600'}`} />
      ))}
    </div>
  );
}

export function StarRatingInput({ value, onChange, disabled }: { value: number | null; onChange: (n: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const current = hover || value || 0;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={disabled} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
          <Star className={`w-7 h-7 ${n <= current ? 'text-warning-400 fill-warning-400' : 'text-dark-600'} transition-colors`} />
        </button>
      ))}
    </div>
  );
}

export function CommentSection({ designId }: { designId: string }) {
  const { user } = useAuth();
  const { summary, userRating, loading: rl, rate } = useRatings(designId);
  const { comments, loading: cl, add, remove } = useComments(designId);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const ok = await add(text);
    if (ok) setText('');
    setSubmitting(false);
  };

  return (
    <div className="card p-5 space-y-5">
      {/* Ratings Section */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-700/50">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-dark-50">{summary.avg_rating.toFixed(1)}</span>
            <div>
              <StarRatingDisplay rating={summary.avg_rating} size="md" />
              <p className="text-xs text-dark-500 mt-1">{formatNumber(summary.total_ratings)} {summary.total_ratings === 1 ? 'rating' : 'ratings'}</p>
            </div>
          </div>
        </div>
        {user && (
          <div className="text-right">
            <p className="text-xs text-dark-500 mb-1">{userRating ? 'Your rating' : 'Rate this'}</p>
            <StarRatingInput value={userRating} onChange={rate} />
          </div>
        )}
      </div>

      {/* Comments Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary-400" />
        <h3 className="font-display text-sm font-semibold text-dark-200">Comments ({comments.length})</h3>
      </div>

      {/* Add Comment */}
      {user ? (
        <form onSubmit={handleComment} className="space-y-2">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..."
            className="input min-h-[70px] resize-none" rows={3} disabled={submitting} />
          <button type="submit" disabled={!text.trim() || submitting} className="btn-primary text-sm py-2 px-4">
            <Send className="w-3.5 h-3.5" /> Post Comment
          </button>
        </form>
      ) : (
        <div className="bg-dark-800/50 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">Want to comment? <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link></p>
        </div>
      )}

      {/* Comments List */}
      {cl ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded-lg shimmer" />)}</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-dark-500 text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 group">
              <Link to={`/profile/${c.user_id}`} className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                  {c.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="bg-dark-800/60 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <Link to={`/profile/${c.user_id}`} className="text-sm font-medium text-dark-200 hover:text-primary-300">
                      {c.profiles?.name || 'Unknown'}
                    </Link>
                    <span className="text-xs text-dark-600">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-dark-300 break-words">{c.content}</p>
                </div>
                {c.user_id === user?.id && (
                  <button onClick={() => remove(c.id)} className="text-xs text-dark-600 hover:text-error-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
