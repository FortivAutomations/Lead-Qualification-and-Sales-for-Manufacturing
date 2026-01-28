import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  pulse?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  pulse,
}: MetricCardProps) {
  const variants = {
    default: 'metric-card',
    primary: 'metric-card-primary',
    secondary: 'metric-card-secondary',
    accent: 'metric-card-accent',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <div className={cn(variants[variant], 'animate-fade-in')}>
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-white/20'
          )}
        >
          {icon}
        </div>
        {pulse && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p
          className={cn(
            'text-sm font-medium',
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}
        >
          {title}
        </p>
        <p className="text-3xl font-bold tracking-tight animate-count">{value}</p>
        {subtitle && (
          <p
            className={cn('text-sm', variant === 'default' ? 'text-muted-foreground' : 'opacity-70')}
          >
            {subtitle}
          </p>
        )}
        {trend && (
          <div className={cn('flex items-center gap-1 text-sm', trendColors[trend.direction])}>
            <TrendIcon className="w-4 h-4" />
            <span className="font-medium">{trend.value}%</span>
            {trend.label && (
              <span className={variant === 'default' ? 'text-muted-foreground' : 'opacity-70'}>
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
