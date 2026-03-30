import React from 'react';

const Card = ({ children, className = '', title, subtitle, noPadding = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl ${className}`}>
      {title && (
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};

export default Card;
