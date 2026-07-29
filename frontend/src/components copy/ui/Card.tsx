import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-card border border-border rounded-lg p-5 transition-all duration-150',
          hoverEffect && 'hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
