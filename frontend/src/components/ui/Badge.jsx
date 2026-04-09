import React from 'react';

const Badge = ({ children, variant = 'default', className = '', size = 'md', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-900',
    info: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
    lg: 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base'
  };

  return (
    <span
      className={`inline-flex font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
