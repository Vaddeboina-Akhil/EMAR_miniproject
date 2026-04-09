import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false, loading = false, ...props }) => {
  const baseClasses = 'font-semibold rounded-full focus:outline-none transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center';
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-700 hover:bg-red-800 text-white shadow-md',
    outline: 'border-2 border-gray-300 hover:bg-gray-50 text-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-md',
    black: 'bg-black hover:bg-gray-900 text-white shadow-md'
  };
  // Mobile-first sizing with responsive Tailwind classes
  const sizes = {
    sm: 'px-3 py-2 sm:px-4 text-xs sm:text-sm',
    md: 'px-4 py-2.5 sm:px-6 text-sm sm:text-base',
    lg: 'px-6 py-3 sm:px-8 text-base sm:text-lg'
  };

  return (
    <div
      role="button"
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={disabled || loading ? undefined : onClick}
      aria-disabled={disabled || loading}
      style={{
        opacity: disabled || loading ? 0.6 : 1,
        pointerEvents: disabled || loading ? 'none' : 'auto',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
      {...props}
    >
      {loading ? '⏳' : children}
    </div>
  );
};

export default Button;