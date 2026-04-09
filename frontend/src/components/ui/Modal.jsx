import React from 'react';

const Modal = ({ isOpen, onClose, title, children, className = '', size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-xs sm:max-w-sm',
    md: 'max-w-sm sm:max-w-md',
    lg: 'max-w-md sm:max-w-lg',
    xl: 'max-w-lg sm:max-w-xl',
    full: 'max-w-[calc(100%-32px)] sm:max-w-full'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in">
      <div className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b-2 border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl font-light transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
