import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, required = false, error, className = '', disabled = false, helpText = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
          error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-gray-200 focus:border-red-500 focus:ring-red-400 hover:border-gray-300'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'
        }`}
      />
      {error && <p className="text-red-600 text-sm font-medium mt-2">{error}</p>}
      {helpText && !error && <p className="text-gray-600 text-sm mt-2">{helpText}</p>}
    </div>
  );
};

export default Input;
