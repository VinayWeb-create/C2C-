import React from 'react';

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-800" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-2/3" />
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4" />
      </div>
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-1/2" />
      <div className="flex gap-2 py-2">
        <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-16" />
        <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-20" />
      </div>
      <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-24" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
