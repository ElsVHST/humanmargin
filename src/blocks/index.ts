import type { Block } from "payload";

import { CalendlyEmbedComponent } from "./CalendlyEmbed/Component";
import { CalendlyEmbedBlock } from "./CalendlyEmbed/config";
import { BrushNoteComponent } from "./BrushNote/Component";
import { BrushNoteBlock } from "./BrushNote/config";
import { CardColumnsComponent } from "./CardColumns/Component";
import { CardColumnsBlock } from "./CardColumns/config";
import { ContentComponent } from "./Content/Component";
import { ContentBlock } from "./Content/config";
import { EbookOptinComponent } from "./EbookOptin/Component";
import { EbookOptinBlock } from "./EbookOptin/config";
import { FaqComponent } from "./Faq/Component";
import { FaqBlock } from "./Faq/config";
import { HeroPhotoComponent } from "./HeroPhoto/Component";
import { HeroPhotoBlock } from "./HeroPhoto/config";
import { IframeEmbedComponent } from "./IframeEmbed/Component";
import { IframeEmbedBlock } from "./IframeEmbed/config";
import { LongformDarkComponent } from "./LongformDark/Component";
import { LongformDarkBlock } from "./LongformDark/config";
import { PageTitleComponent } from "./PageTitle/Component";
import { PageTitleBlock } from "./PageTitle/config";
import { PostCardsComponent } from "./PostCards/Component";
import { PostCardsBlock } from "./PostCards/config";
import { LinkButtonsComponent } from "./LinkButtons/Component";
import { LinkButtonsBlock } from "./LinkButtons/config";
import { IconListComponent } from "./IconList/Component";
import { IconListBlock } from "./IconList/config";
import { SplitPhotoTextComponent } from "./SplitPhotoText/Component";
import { SplitPhotoTextBlock } from "./SplitPhotoText/config";
import { StatementComponent } from "./Statement/Component";
import { StatementBlock } from "./Statement/config";
import { TestimonialsComponent } from "./Testimonials/Component";
import { TestimonialsBlock } from "./Testimonials/config";
import { TextColumnsComponent } from "./TextColumns/Component";
import { TextColumnsBlock } from "./TextColumns/config";
import { TextCtaComponent } from "./TextCta/Component";
import { TextCtaBlock } from "./TextCta/config";

// Elk paginasectie-type bestaat uit een paar: Payload-blockconfig (schema, wat Els
// in de admin kan bewerken) + React-component (hoe het op de site rendert).
// Nieuwe secties registreer je in BEIDE lijsten hieronder.

export const blockConfigs: Block[] = [
  CalendlyEmbedBlock,
  BrushNoteBlock,
  CardColumnsBlock,
  ContentBlock,
  EbookOptinBlock,
  FaqBlock,
  HeroPhotoBlock,
  IframeEmbedBlock,
  LinkButtonsBlock,
  IconListBlock,
  StatementBlock,
  SplitPhotoTextBlock,
  LongformDarkBlock,
  PageTitleBlock,
  PostCardsBlock,
  TestimonialsBlock,
  TextColumnsBlock,
  TextCtaBlock,
];

export const blockComponents = {
  calendlyEmbed: CalendlyEmbedComponent,
  brushNote: BrushNoteComponent,
  cardColumns: CardColumnsComponent,
  content: ContentComponent,
  ebookOptin: EbookOptinComponent,
  faq: FaqComponent,
  heroPhoto: HeroPhotoComponent,
  iframeEmbed: IframeEmbedComponent,
  linkButtons: LinkButtonsComponent,
  iconList: IconListComponent,
  statement: StatementComponent,
  splitPhotoText: SplitPhotoTextComponent,
  longformDark: LongformDarkComponent,
  pageTitle: PageTitleComponent,
  postCards: PostCardsComponent,
  testimonials: TestimonialsComponent,
  textColumns: TextColumnsComponent,
  textCta: TextCtaComponent,
};
