'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({ value, max = 5, size = 16, showValue = true }: StarRatingProps) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = i <= Math.round(value);
    stars.push(
      <Star
        key={i}
        size={size}
        className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
      />
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">{stars}</span>
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>
      )}
    </span>
  );
}
