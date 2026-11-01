import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-4 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/15 text-red-400",
        outline: "border border-border text-muted-foreground",
        discovery: "bg-emerald-500/15 text-emerald-400",
        peak: "bg-amber-500/15 text-amber-400",
        decline: "bg-red-500/15 text-red-400",
        relocation: "bg-purple-500/15 text-purple-400",
        transformation: "bg-cyan-500/15 text-cyan-400",
        culture: "bg-yellow-500/15 text-yellow-400",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
