import React from 'react';

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <label className="block text-sm font-small text-gray-700">
      {children}
    </label>
  );
};

export const Textarea: React.FC<{
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}> = ({ placeholder, value, onChange, className }) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border border-gray-300 rounded-md p-2 ${className}`}
    />
  );
};
