const BOUTIQUE_CONTEXT = /بوتیک|لباس|پوشاک|استایل|(?:^|[\s\u200c])مد(?:$|[\s\u200c])|مانتو|شومیز|بلوز|تاپ|تیشرت|پیراهن|شلوار|کیف|کفش|سایز|پارچه|مزون|زنانه|اکسسوری|fashion|clothing|apparel|boutique|garment/i;
const BOUTIQUE_ARTICLE_CONTEXT = /بوتیک|لباس|پوشاک|استایل|(?:^|[\s\u200c])مد(?:$|[\s\u200c])|مانتو|شومیز|بلوز|تاپ|تیشرت|پیراهن|شلوار|پارچه|مزون|اکسسوری|fashion|clothing|apparel|boutique|garment/i;

export function hasBoutiqueContext(...values: unknown[]) {
  return values.some((value) => typeof value === "string" && BOUTIQUE_CONTEXT.test(value.replace(/<[^>]*>/g, " ")));
}

export function isBoutiqueArticle(post: { title?: string | null; excerpt?: string | null; content?: string | null; category?: string | null; tags?: string[] | null }) {
  const metadata = [post.title, post.excerpt, post.category, ...(post.tags ?? [])].filter(Boolean).join(" ");
  if (BOUTIQUE_ARTICLE_CONTEXT.test(metadata)) return true;
  const bodyMatches = post.content?.replace(/<[^>]*>/g, " ").match(new RegExp(BOUTIQUE_ARTICLE_CONTEXT.source, "gi")) ?? [];
  return bodyMatches.length >= 2;
}
