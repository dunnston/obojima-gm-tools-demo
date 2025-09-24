import React from 'react';
import { getCurrencyBreakdown, CURRENCY_IMAGES } from '@/data/obojimaCurrency';

interface CurrencyDisplayProps {
  goldValue: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 text-sm',
  md: 'h-6 w-6 text-base',
  lg: 'h-8 w-8 text-lg'
};

export default function CurrencyDisplay({ goldValue, size = 'md', className = '' }: CurrencyDisplayProps) {
  const breakdown = getCurrencyBreakdown(goldValue);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {breakdown.map(({ type, amount, image, icon }, index) => (
        <div key={`${type}-${index}`} className="flex items-center gap-1">
          <img
            src={image}
            alt={`${type} currency`}
            className={`${sizeClasses[size].split(' ').slice(0, 2).join(' ')}`}
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              const span = document.createElement('span');
              span.textContent = icon;
              span.className = sizeClasses[size].split(' ')[2];
              target.parentNode?.replaceChild(span, target);
            }}
          />
          <span className={`font-semibold ${sizeClasses[size].split(' ')[2]}`}>
            {amount}
          </span>
        </div>
      ))}
    </div>
  );
}

// Convenience component for simple single-currency display (Gold Flower only)
interface SimpleCurrencyDisplayProps {
  goldValue: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SimpleCurrencyDisplay({ goldValue, size = 'md', className = '' }: SimpleCurrencyDisplayProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <img
        src={CURRENCY_IMAGES.goldFlower}
        alt="Gold Flower currency"
        className={`${sizeClasses[size].split(' ').slice(0, 2).join(' ')}`}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          const target = e.target as HTMLImageElement;
          const span = document.createElement('span');
          span.textContent = '🌻';
          span.className = sizeClasses[size].split(' ')[2];
          target.parentNode?.replaceChild(span, target);
        }}
      />
      <span className={`font-semibold ${sizeClasses[size].split(' ')[2]}`}>
        {goldValue}
      </span>
    </div>
  );
}