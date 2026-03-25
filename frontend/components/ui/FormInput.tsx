import React from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: FieldError;
  rightSlot?: React.ReactNode; // e.g. "Forgot password?" link
}

export default function FormInput({ id, label, error, rightSlot, className, ...rest }: FormInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        {rightSlot && <div className="ml-auto">{rightSlot}</div>}
      </div>
      <input
        id={id}
        className={`appearance-none block w-full px-3 py-2.5 border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none sm:text-sm transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-brand-border focus:ring-primary focus:border-primary'
        } ${className ?? ''}`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
