import type { TestimonialsBlock } from "@/payload-types";

import { TestimonialsCarousel } from "./Carousel";

// Zwarte recensie-sectie: groot geel aanhalingsteken, kop (Archivo Black wit,
// center), introtekst (wit, center) en een carousel met recensiekaarten.
export function TestimonialsComponent(props: TestimonialsBlock) {
  const { heading, intro, items } = props;
  const list = items ?? [];

  return (
    <section className="w-full bg-hm-black">
      <div className="mx-auto w-[85%] max-w-[1200px] pt-[100px] pb-[75px]">
        <div className="text-center">
          <p
            aria-hidden
            className="mt-9 font-lily text-[95px] leading-none text-hm-yellow lg:text-[150px]"
          >
            &quot;
          </p>
          {heading && (
            <h2 className="-mt-[52px] font-heading text-[27px] uppercase leading-[29.7px] text-hm-white lg:-mt-[78px] lg:text-[40px] lg:leading-[48px]">
              {heading}
            </h2>
          )}
          {intro && (
            <p className="mx-auto mt-6 mb-10 max-w-[795px] text-[17px] leading-[25.5px] text-hm-white lg:mb-12 lg:text-[18px] lg:leading-[27px]">
              {intro}
            </p>
          )}
        </div>
        {list.length > 0 && <TestimonialsCarousel items={list} />}
      </div>
    </section>
  );
}
