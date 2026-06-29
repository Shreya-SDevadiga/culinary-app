import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ value = 0, onChange, readonly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            {filled
              ? <FaStar size={size} className="text-yellow-400" />
              : <FiStar size={size} className="text-gray-300" />
            }
          </button>
        );
      })}
    </div>
  );
}
