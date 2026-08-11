'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

export default function RatingStars({ rating, maxRating = 5, size = 16 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-[var(--text-muted)]'}
        />
      ))}
    </div>
  );
}
