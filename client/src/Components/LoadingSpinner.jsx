import React from 'react';

const LoadingSpinner = ({
  size = 'large',
  message = 'جاري التحميل...',
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16',
    large: 'h-32 w-32'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-lg text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
