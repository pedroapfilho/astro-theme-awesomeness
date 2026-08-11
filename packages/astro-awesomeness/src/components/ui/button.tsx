import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/cn";
import { buttonVariants } from "./button-variants";

type ButtonProps = Omit<React.ComponentProps<typeof ButtonPrimitive>, "className"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

const Button = ({ className, size = "default", variant = "default", ...props }: ButtonProps) => {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ className, size, variant }))}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  );
};

export { Button };
