import type { SitePageBlock } from "@/db/schema";

export const HOME_SECTION_LABELS: Record<string, string> = {
  hero: "بنر اصلی و جست‌وجو",
  trust: "مزیت‌ها و اعتمادسازی",
  categories: "دسته‌بندی محصولات",
  festival: "جشنواره فعال",
  deals: "پیشنهادهای روز",
  popular: "محبوب‌ترین محصولات",
  why: "درباره انتخاب‌های بوتیک",
  guarantee: "ضمانت بازگشت",
  farms: "برندها و فروشندگان منتخب",
  fresh: "تازه‌رسیده‌ها",
  blog: "مجله و مقاله‌ها",
  testimonials: "نظر مشتریان",
  promo: "بنرهای پایانی و فراخوان",
};

export const DEFAULT_HOME_LAYOUT: SitePageBlock[] = Object.entries(HOME_SECTION_LABELS).map(([sectionId]) => ({
  type: "store_section",
  sectionId,
  title: "",
  body: "",
  items: [],
}));

export function createHomeTemplateBlocks(layout: SitePageBlock[]): SitePageBlock[] {
  const features = (title: string, body: string, items: SitePageBlock["items"]): SitePageBlock => ({ type: "features", title, body, items: items?.length ? items : [
    { title: "کیفیت قابل اعتماد", body: "محصولات با دقت انتخاب و بررسی می‌شوند." },
    { title: "ارسال سریع", body: "سفارش‌ها با بسته‌بندی مناسب به دست شما می‌رسند." },
  ] });
  const grid = (title: string, body: string, items: SitePageBlock["items"]): SitePageBlock => ({ type: "grid", title, body, items: items?.length ? items : [
    { kind: "cta", title: "مشاهده محصولات", body: "محصول دلخواهتان را از فروشگاه انتخاب کنید.", buttonLabel: "رفتن به فروشگاه", href: "/shop" },
    { kind: "cta", title: "راهنمای خرید", body: "با محصولات و شیوه انتخاب آن‌ها آشنا شوید.", buttonLabel: "مطالعه راهنما", href: "/blog" },
  ] });
  return layout.flatMap((block) => {
    if (block.type !== "store_section") return [{ ...block, items: block.items?.map((item) => ({ ...item })) }];
    const title = block.title || HOME_SECTION_LABELS[block.sectionId ?? ""] || "بخش فروشگاه";
    const body = block.body || "این بخش را متناسب با محتوای صفحه ویرایش کنید.";
    switch (block.sectionId) {
      case "hero": return [{ type: "hero", title: block.title || "پوشاک زنانه برای استایل شما", body: block.body || "لباس‌های روزمره و انتخاب‌هایی برای لحظه‌های خاص را کشف کنید.", mediaId: block.mediaId ?? null }];
      case "trust": return [features(block.title || "خرید آسان از بوتیک", block.body || "اطلاعات محصول، راهنمای سایز و پشتیبانی در کنار شماست.", block.items)];
      case "categories": return [grid(block.title || "دسته‌بندی پوشاک زنانه", block.body || "مجموعه دلخواه خود را آسان‌تر پیدا کنید.", block.items)];
      case "festival": return [{ type: "cta", title, body: block.body || "پیشنهادهای ویژه و تخفیف‌های جاری را ببینید.", buttonLabel: "مشاهده جشنواره", href: "/shop?fest=1" }];
      case "deals": return [grid(block.title || "پیشنهادهای ویژه", block.body || "فرصت خرید محصولات منتخب با قیمت مناسب.", block.items)];
      case "popular": return [grid(block.title || "محبوب‌ترین محصولات", block.body || "انتخاب‌های پرطرفدار مشتریان.", block.items)];
      case "why": return [{ type: "text", title: block.title || "استایل شخصی شما", body: block.body || "لباس‌های ساده و کاربردی برای روزمره و انتخاب‌هایی برای مناسبت‌های خاص." }];
      case "guarantee": return [{ type: "cta", title: block.title || "خرید با اطمینان", body: block.body || "برای آشنایی با شرایط پشتیبانی و بازگشت کالا، راهنمای ما را ببینید.", buttonLabel: "شرایط و راهنما", href: "/faq" }];
      case "farms": return [features(block.title || "برندها و فروشندگان منتخب", block.body || "با مجموعه‌های پوشاک حاضر در بوتیک آشنا شوید.", block.items)];
      case "fresh": return [grid(block.title || "تازه‌رسیده‌ها", block.body || "جدیدترین لباس‌های بوتیک را ببینید.", block.items)];
      case "blog": return [grid(block.title || "مجله و راهنمای خرید", block.body || "مقاله‌ها و نکته‌های کاربردی برای انتخاب آگاهانه.", block.items?.length ? block.items : [{ kind: "cta", title: "مطالب مجله", body: "مقاله‌های آموزشی و تازه را بخوانید.", buttonLabel: "ورود به مجله", href: "/blog" }])];
      case "testimonials": return [features(block.title || "دیدگاه مشتریان", block.body || "تجربه خریداران را درباره محصولات بخوانید.", block.items)];
      case "promo": return [{ type: "cta", title: block.title || "از فروشگاه دیدن کنید", body: block.body || "محصول مورد نظرتان را پیدا و سفارش خود را ثبت کنید.", buttonLabel: "شروع خرید", href: "/shop" }];
      default: return [];
    }
  });
}
