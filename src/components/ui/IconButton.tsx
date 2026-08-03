import React from 'react';
import './IconButton.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'glass',
  size = 'md',
  active = false,
  className = '',
  ...props
}) => {
  const classNames = [
    'icon-btn',
    `icon-btn-${variant}`,
    `icon-btn-${size}`,
    active ? 'active' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};
