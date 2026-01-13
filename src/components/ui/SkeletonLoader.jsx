import React from "react";
import Card from "../common/Card";

const SkeletonLoader = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Main Artist Card Skeleton */}
      <Card className="bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Artist Image Skeleton */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-2xl bg-gray-400 dark:bg-gray-700"></div>
            </div>

            {/* Artist Details Skeleton */}
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-3">
                {/* Badge skeleton */}
                <div className="flex items-center gap-3">
                  <div className="w-24 h-6 bg-gray-400 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-32 h-4 bg-gray-400 dark:bg-gray-700 rounded"></div>
                </div>
                
                {/* Name skeleton */}
                <div className="w-64 h-10 bg-gray-400 dark:bg-gray-700 rounded"></div>
                
                {/* Stats skeleton */}
                <div className="flex items-center gap-4">
                  <div className="w-40 h-6 bg-gray-400 dark:bg-gray-700 rounded"></div>
                  <div className="w-40 h-6 bg-gray-400 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Genres skeleton */}
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-6 bg-gray-400 dark:bg-gray-700 rounded-full"></div>
                ))}
              </div>

              {/* Stats Grid skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-400 dark:bg-gray-700 rounded-lg p-3 h-20"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabbed Content Skeleton */}
      <Card className="p-6">
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-32 h-12 bg-gray-300 dark:bg-gray-700 rounded-t"></div>
          ))}
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-slate-800/50">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SkeletonLoader;