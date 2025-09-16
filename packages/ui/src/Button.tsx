'use client';

import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary';
};

const baseStyles = 'inline-flex items-center justify-center rounded-md px-4 py-2 font-medium';
const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const variantStyles = variants[variant];
  const classes = [baseStyles, variantStyles, className].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
