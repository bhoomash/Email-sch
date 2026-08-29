import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none border';

  const variants = {
    primary: 'bg-[#00a854] hover:bg-[#00964b] text-white font-semibold border-[#00a854] focus:ring-[#00a854] active:bg-[#008743]',
    secondary: 'bg-[#e6f4ea] hover:bg-[#d8edd9] text-gray-900 font-medium border-emerald-300 focus:ring-[#00a854]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold border-rose-600 focus:ring-rose-500',
    outline: 'border-gray-300 hover:border-[#00a854] text-gray-800 hover:text-emerald-800 bg-white hover:bg-emerald-50 focus:ring-[#00a854]',
    ghost: 'border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

