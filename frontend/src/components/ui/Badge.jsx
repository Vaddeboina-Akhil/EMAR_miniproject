import React from 'react';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
