import { RichText as LexicalRichText } from "@payloadcms/richtext-lexical/react";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof LexicalRichText>;

export function RichText(props: Props) {
  return <LexicalRichText {...props} />;
}
