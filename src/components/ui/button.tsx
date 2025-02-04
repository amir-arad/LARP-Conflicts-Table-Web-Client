import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      iconPosition: {
        start:
          "[dir='ltr']:pl-2 [dir='rtl']:pr-2 [dir='ltr']:pr-3 [dir='rtl']:pl-3",
        end: "[dir='ltr']:pr-2 [dir='rtl']:pl-2 [dir='ltr']:pl-3 [dir='rtl']:pr-3",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      iconPosition: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, icon, iconPosition, children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, iconPosition }),
          className
        )}
        ref={ref}
        {...props}
      >
        {iconPosition === "start" && icon}
        {children}
        {iconPosition === "end" && icon}
      </button>
    );
  }
);
Button.displayName = "Button";

// Button group with RTL support
const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex [dir='ltr']:space-x-1 [dir='rtl']:space-x-reverse",
      className
    )}
    {...props}
  />
));
ButtonGroup.displayName = "ButtonGroup";

export { Button, ButtonGroup, buttonVariants };
