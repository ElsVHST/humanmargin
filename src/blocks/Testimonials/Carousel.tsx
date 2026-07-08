"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { TestimonialsBlock } from "@/payload-types";

type TestimonialItem = NonNullable<TestimonialsBlock["items"]>[number];

// Client-subcomponent: embla carousel. 1 slide/view mobiel, 3 slides/view desktop
// (lg:), gap 10px, loop, GEEN autoplay, klikbare bullets onderaan.
export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", duration: 25 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Afgeleid tijdens render (geen setState in effect): emblaApi is state,
  // dus zodra die beschikbaar is rendert dit vanzelf opnieuw.
  const scrollSnaps = emblaApi?.scrollSnapList() ?? [];

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-[10px] flex">
          {items.map((item, index) => (
            <div
              key={item.id ?? index}
              className="flex min-w-0 shrink-0 grow-0 basis-full flex-col pl-[10px] lg:basis-1/2"
            >
              <div className="relative flex flex-1 items-center justify-center rounded-[2px] bg-hm-offwhite p-5">
                <p className="text-center text-[17px] italic leading-[25.5px] text-hm-black lg:text-[18px] lg:leading-[27px]">
                  {item.quote}
                </p>
                <span
                  aria-hidden
                  className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[12px] border-x-transparent border-t-hm-offwhite"
                />
              </div>
              <p className="mt-[26px] text-center font-handwritten text-[32px] leading-none text-hm-white lg:text-[40px]">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Ga naar recensie ${index + 1}`}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                index === selectedIndex ? "bg-hm-yellow" : "bg-hm-white",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
