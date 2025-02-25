import * as React from 'react';

import { cn } from '../../lib/utils';
import { useRtlUtils } from '../../hooks/useRtlUtils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isRtl } = useRtlUtils();

  return (
    <div
      ref={ref}
      className={cn(
        'bg-card text-card-foreground rounded-lg border shadow-sm',
        isRtl ? 'text-right' : 'text-left',
        className
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isRtl } = useRtlUtils();

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6',
        isRtl ? 'items-end' : 'items-start',
        className
      )}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "leading-none font-semibold tracking-tight [dir='rtl']:text-right",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-muted-foreground text-sm [dir='rtl']:text-right",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 [dir='rtl']:text-right", className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0 [dir='rtl']:flex-row-reverse",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
