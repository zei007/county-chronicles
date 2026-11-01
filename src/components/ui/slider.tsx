"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-amber-600/80 to-amber-400/90" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-amber-200 bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_0_12px_rgba(234,179,8,0.6)] transition focus-visible:outline-none hover:scale-110 disabled:pointer-events-none" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
