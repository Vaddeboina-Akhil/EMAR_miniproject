import React from 'react';

const Card = ({ children, className = '', title, subtitle, noPadding = false }) => {
  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-lg sm:hover:shadow-xl ${className}`}>
      {title && (
        <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-gray-600 mt-2">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-6'}>{children}</div>
    </div>
  );
};

export default Card;
