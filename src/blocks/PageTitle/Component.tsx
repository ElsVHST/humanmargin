import { RichText } from "@/components/RichText";
import type { PageTitleBlock } from "@/payload-types";

// Hello Elementor default-pagina. page-header: entry-title in Archivo regular
// 40/48 uppercase, links op de 1140px-containerrand, witte band van ~72px
// (py-3 rond de 48px-regel). page-content: optionele lopende tekst/citaten.
export function PageTitleComponent(props: PageTitleBlock) {
  const { title, body } = props;
  return (
    <section className="w-full bg-hm-white text-hm-black">
      <div className="mx-auto w-full max-w-[1140px] px-5 lg:px-0">
        {title && (
          <div className="pt-[6px] pb-[18px]">
            <h1 className="font-sans text-[27px] font-normal uppercase leading-[33px] lg:text-[40px] lg:leading-[48px]">
              {title}
            </h1>
          </div>
        )}
        {body && (
          <div className="pb-9 lg:max-w-[1070px]">
            <RichText data={body} className="hm-prose" />
          </div>
        )}
      </div>
    </section>
  );
}
