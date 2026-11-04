import { and, desc, eq, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, brands, sellers, type SitePageBlock } from "@/db/schema";
import { categoriesWithCounts, listShopProducts, vehicleMakes } from "./queries";
import { activeFestivals } from "./marketing";
import { getSettings } from "./settings";
import { isBoutiqueArticle } from "./boutique-content";

export async function getHomeData(blocks: SitePageBlock[] = []) {
  const ids = [...new Set(blocks.flatMap(b => b.options?.productIds ?? []))];
  const categoryIds = [...new Set(blocks.map(b => b.options?.categoryId).filter((id): id is number => !!id))];
  const [all, cats, makes, festivals, farms, homeBrands, settings, latestPosts] = await Promise.all([
    listShopProducts({}, 5000), categoriesWithCounts(), vehicleMakes(), activeFestivals(),
    db.select({ id: sellers.id, shopName: sellers.shopName, city: sellers.city, rating: sellers.rating }).from(sellers).where(eq(sellers.status, "approved")).limit(6),
    db.select({ id: brands.id, name: brands.name, slug: brands.slug, logoMediaId: brands.logoMediaId }).from(brands).where(and(eq(brands.isActive, true), eq(brands.showOnHome, true), isNull(brands.deletedAt))).orderBy(brands.sortOrder, brands.name).limit(8), getSettings(),
    db.select({ id: blogPosts.id, title: blogPosts.title, slug: blogPosts.slug, excerpt: blogPosts.excerpt, content: blogPosts.content, tags: blogPosts.tags, coverImageId: blogPosts.coverImageId, category: blogPosts.category, publishedAt: blogPosts.publishedAt }).from(blogPosts).where(and(eq(blogPosts.status, "published"), lte(blogPosts.publishedAt, new Date()))).orderBy(desc(blogPosts.publishedAt)).limit(50),
  ]);
  const selectedIds = new Set(ids);
  const selected = all.filter(product => selectedIds.has(product.id));
  const childCategories = new Map<number, Set<number>>();
  for (const category of cats) {
    if (!category.parent_id) continue;
    const children = childCategories.get(category.parent_id) ?? new Set<number>();
    children.add(category.id);
    childCategories.set(category.parent_id, children);
  }
  const categoryProducts = categoryIds.map(id => {
    const children = childCategories.get(id);
    return all.filter(product => product.categoryId === id || (product.categoryId != null && children?.has(product.categoryId))).slice(0, 24);
  });
  // Only public storefront settings are passed to the preview client.
  const { siteName, multiVendor, allowSellerSignup, heroMediaId, heroType, heroTitle, heroSubtitle, returnDays, currency } = settings;
  return { all: [...new Map([...all, ...selected, ...categoryProducts.flat()].map(p => [p.id, p])).values()], cats, makes, fests: festivals.map(f => ({ title: f.title, description: f.description, color: f.color, discountPercent: f.discountPercent, endsAt: f.endsAt.toISOString() })), farms, homeBrands, latestPosts: latestPosts.filter(isBoutiqueArticle).slice(0, 12).map(p => ({ ...p, content: "", publishedAt: p.publishedAt?.toISOString() ?? null })), st: { siteName, multiVendor, allowSellerSignup, heroMediaId, heroType, heroTitle, heroSubtitle, returnDays, currency } };
}
export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
