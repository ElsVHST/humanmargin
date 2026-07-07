import { RichText } from "@/components/RichText";
import type { ContentBlock as ContentBlockProps } from "@/payload-types";

export function ContentComponent(props: ContentBlockProps) {
  const { richText } = props;
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      {richText && <RichText data={richText} />}
    </section>
  );
}
