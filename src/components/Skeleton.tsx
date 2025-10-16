import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-lg shadow animate-pulse">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64 mb-6 bg-gray-800" />
        <StatsGridSkeleton count={4} />
      </div>
    </div>
  );
}

export function LoginPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900/60 border border-yellow-600/40 rounded-2xl p-8 shadow-2xl max-w-md w-full animate-pulse">
        <Skeleton variant="rectangular" className="w-16 h-16 mx-auto mb-6 bg-gray-800" />
        <Skeleton className="h-6 w-48 mx-auto mb-4 bg-gray-800" />
        <Skeleton className="h-4 w-64 mx-auto mb-6 bg-gray-800" />
        <Skeleton className="h-10 w-full mb-4 bg-gray-800" />
        <Skeleton className="h-10 w-full bg-gray-800" />
      </div>
    </div>
  );
}