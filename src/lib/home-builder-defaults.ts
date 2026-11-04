import type { SitePageBlock, SitePageBlockItem } from "@/db/schema";
import type { SettingsShape } from "./settings";
import { identifyBlocks } from "./page-builder";

export function homeBuilderDefaults(blocks: SitePageBlock[], st: Pick<SettingsShape, "siteName" | "heroTitle" | "heroSubtitle" | "returnDays" | "currency" | "multiVendor" | "allowSellerSignup">): SitePageBlock[] {
  const text: Record<string, [string, string, string?, string?]> = {
    hero: [st.heroTitle, st.heroSubtitle, "شروع خرید", "/shop"], trust: ["", ""], categories: ["دسته‌بندی پوشاک زنانه", "مجموعه‌های بوتیک مه‌لقا را ببینید"],
    popular: [`محبوب‌ترین‌های ${st.siteName}`, "انتخاب‌های پرطرفدار مشتریان"], fresh: ["تازه‌رسیده‌ها", "جدیدترین لباس‌های بوتیک"], deals: ["پیشنهادهای ویژه", ""],
    why: ["استایل شخصی شما، انتخاب شماست", "در بوتیک مه‌لقا لباس‌هایی برای روزهای معمولی و لحظه‌های خاص پیدا می‌کنید؛ با مشخصات روشن، راهنمای سایز و امکان انتخاب رنگ و تنوع.", "درباره بوتیک", "/about"],
    guarantee: [`همراه شما در خرید و بازگشت تا ${st.returnDays.toLocaleString("fa-IR")} روز`, "شرایط سفارش و بازگشت را پیش از خرید ببینید؛ پشتیبانی برای پاسخ به پرسش‌های انتخاب و سایز در دسترس شماست.", "راهنمای خرید", "/faq"],
    farms: ["برندها و فروشندگان منتخب", "با مجموعه‌های پوشاک حاضر در بوتیک آشنا شوید"], blog: [`از مجله ${st.siteName}`, "راهنمای سایز، انتخاب رنگ و ساختن استایل شخصی"], testimonials: ["نظر مشتریان", `تجربه خرید از ${st.siteName}`],
  };
  const pairs = (a: string[][]): SitePageBlockItem[] => a.map(([title, body]) => ({ title, body }));
  const items: Record<string, SitePageBlockItem[]> = {
    trust: pairs([["راهنمای سایز", "انتخاب دقیق‌تر پیش از سفارش"], ["انتخاب رنگ و تنوع", "جزئیات هر گزینه در صفحه محصول"], ["پیگیری سفارش", "مشاهده وضعیت از حساب کاربری"], ["پشتیبانی همراه", "پاسخ‌گویی درباره خرید و محصول"]]),
    why: pairs([["برای روزهای روزمره", "لباس‌های ساده و کاربردی"], ["برای لحظه‌های خاص", "انتخاب‌هایی برای مهمانی و مناسبت"], ["انتخاب با آگاهی", "مشاهده مشخصات و راهنمای سایز"], ["استایل شخصی", "ترکیب رنگ و فرم دلخواه خودتان"]]),
    promo: [{ title: "انتخاب بعدی شما اینجاست", body: "تازه‌رسیده‌ها و پیشنهادهای بوتیک را ببینید.", buttonLabel: "شروع خرید", href: "/shop" }, st.multiVendor && st.allowSellerSignup ? { title: "فروشنده پوشاک هستید؟", body: "مجموعه خود را برای مشتریان بوتیک معرفی کنید.", buttonLabel: "ثبت‌نام فروشندگان", href: "/login?seller=1" } : { title: "برای انتخاب لباس راهنمایی می‌خواهید؟", body: "تیم پشتیبانی درباره سایز و جزئیات محصول همراه شماست.", buttonLabel: "تماس با ما", href: "/contact" }],
  };
  return identifyBlocks(blocks.map((b) => {
    if (b.type !== "store_section") return b;
    const d = text[b.sectionId || ""];
    return { ...b, title: b.title || d?.[0] || "", body: b.body || d?.[1] || "", buttonLabel: b.buttonLabel || d?.[2] || "", href: b.href || d?.[3] || "", items: b.items?.length ? b.items : items[b.sectionId || ""] || [], options: b.sectionId === "hero" ? { badge: "پوشاک زنانه بوتیک مه‌لقا", secondaryLabel: "مشاهده همه لباس‌ها", secondaryHref: "/shop", ...b.options } : b.options };
  }));
}
