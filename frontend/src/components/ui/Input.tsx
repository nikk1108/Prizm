import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3 py-2 text-sm bg-card text-text-primary border rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-slate-50',
              error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border',
              className
            )
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-text-secondary">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
