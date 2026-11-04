import { getSettings } from "@/lib/settings";
import { SitePageRenderer, type SitePageData } from "@/components/SitePageRenderer";
import { seoMetadata } from "@/lib/seo";
import { MAHLEGHA_PROFILE as shop } from "@/lib/mahlegha-profile";
import { getPublishedSitePage } from "@/lib/public-content-cache";

const fallback: SitePageData = {
  title: "درباره ما", slug: "about", template: "nature", summary: null, metaTitle: null, metaDescription: null, status: "published",
  blocks: [
    { type: "hero", title: `درباره ${shop.name}`, body: `${shop.name} فروشگاه آنلاین لباس ترک است. در مجموعه بوتیک، لباس‌های زنانه مانند مانتو، شومیز، بلوز، تاپ و تیشرت عرضه می‌شود.` },
    { type: "features", title: "آنچه برای شما فراهم کرده‌ایم", items: [
      { title: "پوشاک زنانه", body: "مانتو، شومیز، بلوز، تاپ و تیشرت." },
      { title: "لباس ترک", body: "مجموعه‌ای از پوشاک زنانه منتخب بوتیک." },
      { title: "ارسال از نمین", body: "ارسال سفارش‌ها از شهر نمین در استان اردبیل." },
      { title: "ساعت کاری", body: shop.hours },
    ] },
  ],
};

export async function generateMetadata() {
  const [page, settings] = await Promise.all([getPublishedSitePage("about"), getSettings()]);
  return seoMetadata(settings, { title: page?.metaTitle || page?.title || fallback.title, description: page?.metaDescription || page?.summary || settings.homeSeoDescription, path: "/about" });
}

export default async function About() {
  const [page, settings] = await Promise.all([getPublishedSitePage("about"), getSettings()]);
  return <SitePageRenderer page={(page ?? fallback) as SitePageData} settings={settings} />;
}
