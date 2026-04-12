import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const StarRating = ({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = interactive ? (hovered || rating) > i : rating > i;
        const Icon   = filled ? StarIcon : StarOutline;
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Icon
              className={`${sizes[size]} ${
                filled
                  ? 'text-amber-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
