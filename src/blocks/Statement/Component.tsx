import type { StatementBlock } from "@/payload-types";

export function StatementComponent(props: StatementBlock) {
  const { heading, accent } = props;

  return (
    <section className="w-full bg-hm-black">
      <div className="mx-auto flex w-full max-w-[1140px] flex-col gap-5 px-5 py-[72px] lg:px-0">
        <h2 className="whitespace-pre-line text-center font-heading text-[27px] uppercase leading-[1.2] text-hm-white lg:text-[40px] lg:leading-[48px]">
          {heading}
        </h2>
        {accent && (
          <h3 className="text-center font-sans text-[20px] font-medium uppercase leading-[1.2] text-hm-yellow lg:text-[26px] lg:leading-[31.2px]">
            {accent}
          </h3>
        )}
      </div>
    </section>
  );
}
