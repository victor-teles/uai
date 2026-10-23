import { ARTICLE_PAGE_VARIANTS, type ArticlePageVariant } from "@/components/uai/article-page";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ArticlePagePreview } from "./article-page-preview";

export const entry: PreviewEntry = {
  control: variantControl("article page layout", ARTICLE_PAGE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={920}>
      <ArticlePagePreview variant={selection as ArticlePageVariant} />
    </SpecimenStage>
  ),
};
