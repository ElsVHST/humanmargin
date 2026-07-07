import { Fragment } from "react";
import type { ComponentType } from "react";

import { blockComponents } from "@/blocks";
import type { Page } from "@/payload-types";

type LayoutBlocks = NonNullable<Page["layout"]>;

export function RenderBlocks({ blocks }: { blocks: LayoutBlocks | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block;
        if (blockType && blockType in blockComponents) {
          const BlockComponent = blockComponents[
            blockType as keyof typeof blockComponents
          ] as ComponentType<typeof block>;
          return <BlockComponent key={block.id ?? index} {...block} />;
        }
        return null;
      })}
    </Fragment>
  );
}
