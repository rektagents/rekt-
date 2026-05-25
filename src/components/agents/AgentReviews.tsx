'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  replies: number;
}

interface AgentReviewsProps {
  agentId: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    user: 'CryptoDegen',
    avatar: '>',
    rating: 5,
    comment: 'Best agent I\'ve used. Autonomous trading is next level. Made 3x in a week.',
    date: '2 hours ago',
    likes: 42,
    replies: 5,
  },
  {
    id: '2',
    user: 'BuilderBob',
    avatar: '$',
    rating: 4,
    comment: 'Great SDK, easy to integrate. Documentation could be better though.',
    date: '1 day ago',
    likes: 28,
    replies: 3,
  },
  {
    id: '3',
    user: 'AISniper',
    avatar: '#',
    rating: 5,
    comment: 'The AI is actually smart. It caught a pump before it happened. Bullish.',
    date: '3 days ago',
    likes: 65,
    replies: 12,
  },
  {
    id: '4',
    user: 'TokenWhale',
    avatar: '~',
    rating: 3,
    comment: 'Decent but needs more chain support. Waiting for Solana integration.',
    date: '1 week ago',
    likes: 15,
    replies: 8,
  },
];

export function AgentReviews({ agentId }: AgentReviewsProps) {
  const [reviews] = useState<Review[]>(MOCK_REVIEWS);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    return 0;
  });

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="border border-white/10 p-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-black text-white font-mono tabular-nums">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={clsx(
                    'text-xs',
                    star <= Math.round(averageRating) ? 'text-white' : 'text-white/20'
                  )}
                >
                  *
                </span>
              ))}
            </div>
            <div className="text-[10px] text-white/30 font-mono mt-1">{reviews.length} reviews</div>
          </div>

          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30 font-mono w-3">{star}</span>
                  <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-white/30"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/20 font-mono w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review */}
      <div className="border border-white/10 p-6">
        <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-4">Write a Review</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={clsx(
                'text-sm font-mono transition-colors',
                star <= rating ? 'text-white' : 'text-white/20'
              )}
            >
              *
            </button>
          ))}
        </div>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Share your experience..."
          className="w-full bg-transparent text-white text-sm font-mono px-4 py-3 border border-white/10 focus:outline-none focus:border-white/30 min-h-[80px] resize-none placeholder-white/20"
        />
        <button className="mt-3 px-6 py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors">
          submit review
        </button>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1">
        {(['recent', 'popular'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={clsx(
              'px-3 py-1.5 text-xs font-mono transition-colors border',
              sortBy === s
                ? 'border-white/20 text-white bg-white/[0.03]'
                : 'border-transparent text-white/30 hover:text-white'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Reviews */}
      <div className="space-y-px border border-white/10 bg-white/10">
        {sorted.map((review) => (
          <div key={review.id} className="bg-black p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-xs font-mono text-white/40 shrink-0">
                {review.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{review.user}</span>
                  <span className="text-[10px] text-white/20 font-mono">
                    {'*'.repeat(review.rating)}{'.'.repeat(5 - review.rating)}
                  </span>
                  <span className="text-[10px] text-white/20 font-mono">{review.date}</span>
                </div>
                <p className="text-xs text-white/50 mb-3 leading-relaxed">{review.comment}</p>
                <div className="flex items-center gap-4 text-[10px] text-white/20 font-mono">
                  <button className="hover:text-white transition-colors">
                    +{review.likes}
                  </button>
                  <button className="hover:text-white transition-colors">
                    {review.replies} replies
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
