import React from 'react';

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className={`${sizes[size]} border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin`}
      style={{ borderWidth: '3px' }}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-orange-50/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-orange-500 font-semibold text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-center py-8">{spinner}</div>;
}
