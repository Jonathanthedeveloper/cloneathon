"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface TooltipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  tooltip: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  iconSize?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
}

const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({
    icon: Icon,
    tooltip,
    variant = "ghost",
    size = "icon",
    iconSize = 16,
    side = "top",
    sideOffset = 4,
    className,
    iconClassName,
    disabled,
    onClick,
    ...props
  }, ref) => {
    return (
      <TooltipProvider >
        <Tooltip delayDuration={800} >
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant={variant}
              size={size}
              className={cn(className)}
              disabled={disabled}
              onClick={onClick}
              {...props}
            >
              <Icon 
                size={iconSize} 
                className={cn(iconClassName)} 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side} sideOffset={sideOffset} className="bg-accent text-accent-foreground">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

TooltipButton.displayName = "TooltipButton";

export { TooltipButton };