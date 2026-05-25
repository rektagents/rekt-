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
    avatar: '🦍',
    rating: 5,
    comment: 'Best agent I\'ve used. Autonomous trading is next level. Made 3x in a week.',
    date: '2 hours ago',
    likes: 42,
    replies: 5,
  },
  {
    id: '2',
    user: 'BuilderBob',
    avatar: '🔧',
    rating: 4,
    comment: 'Great SDK, easy to integrate. Documentation could be better though.',
    date: '1 day ago',
    likes: 28,
    replies: 3,
  },
  {
    id: '3',
    user: 'AISniper',
    avatar: '🎯',
    rating: 5,
    comment: 'The AI is actually smart. It caught a pump before it happened. Bullish.',
    date: '3 days ago',
    likes: 65,
    replies: 12,
  },
  {
    id: '4',
    user: 'TokenWhale',
    avatar: '🐋',
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
    return 0; // Already sorted by recent
  });

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-sm text-gray-400 mt-1">{reviews.length} reviews</div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-3">{star}</span>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-400">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`w-6 h-6 ${
                  star <= rating ? 'text-yellow-500' : 'text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Share your experience with this agent..."
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-gray-600 min-h-[100px] resize-none"
        />
        <button className="mt-3 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Submit Review
        </button>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSortBy('recent')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            sortBy === 'recent'
              ? 'bg-white text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          )}
        >
          Recent
        </button>
        <button
          onClick={() => setSortBy('popular')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            sortBy === 'popular'
              ? 'bg-white text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          )}
        >
          Popular
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sorted.map((review) => (
          <div key={review.id} className="glass rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{review.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{review.user}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3 h-3 ${
                          star <= review.rating ? 'text-yellow-500' : 'text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-300 mb-3">{review.comment}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {review.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {review.replies}
                  </button>
                  <button className="hover:text-white transition-colors">Reply</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
