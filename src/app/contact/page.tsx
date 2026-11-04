import { getSettings } from "@/lib/settings";
import { SitePageRenderer, type SitePageData } from "@/components/SitePageRenderer";
import { seoMetadata } from "@/lib/seo";
import { MAHLEGHA_PROFILE as shop } from "@/lib/mahlegha-profile";
import { getPublishedSitePage } from "@/lib/public-content-cache";

const fallback: SitePageData = {
  title: "تماس با ما", slug: "contact", template: "contact", summary: "راه‌های ارتباط با پشتیبانی", metaTitle: null, metaDescription: null, status: "published",
  blocks: [
    { type: "hero", title: `ارتباط با ${shop.name}`, body: `نشانی: ${shop.address} · ساعت کاری: ${shop.hours}` },
    { type: "cta", title: "پیام در اینستاگرام", body: `برای دیدن مدل‌ها و دریافت اطلاعات تازه از بوتیک، صفحه رسمی ${shop.name} را دنبال کنید.`, buttonLabel: "مشاهده اینستاگرام بوتیک", href: shop.instagram },
  ],
};

export async function generateMetadata() {
  const [page, settings] = await Promise.all([getPublishedSitePage("contact"), getSettings()]);
  return seoMetadata(settings, { title: page?.metaTitle || page?.title || fallback.title, description: page?.metaDescription || page?.summary || settings.homeSeoDescription, path: "/contact" });
}

export default async function Contact() {
  const [page, settings] = await Promise.all([getPublishedSitePage("contact"), getSettings()]);
  return <SitePageRenderer page={(page ?? fallback) as SitePageData} settings={settings} />;
}
