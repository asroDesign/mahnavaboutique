import Link from "next/link";
import Image, { type ImageLoaderProps } from "next/image";
import { ArrowLeft, Shirt, Sparkles, Truck, CreditCard, Headphones, Ruler } from "lucide-react";
import type { SitePageBlock } from "@/db/schema";
import type { HomeData } from "@/lib/home-data";

const heroMediaLoader = ({ src, width }: ImageLoaderProps) => `${src}?w=${[320, 640, 960, 1280, 1600].find(size => size >= width) ?? 1600}`;

export function BoutiqueSection({ block, data, primary }: { block: SitePageBlock; data: HomeData; primary: boolean }) {
 // Replace old saved demo copy unless it reads like a boutique or shopping section.
 const boutiqueCopy = /لباس|پوشاک|مانتو|شومیز|بلوز|سایز|پارچه|دوخت|استایل|بوتیک|رنگ|خرید|ارسال|سفارش|راهنما|بازگشت|پشتیبانی|فروشگاه|کالکشن|مجموعه|تازه‌رسیده/;
 const keepCopy = (value?: string | null) => !value || boutiqueCopy.test(value);
 block = { ...block, title: keepCopy(block.title) ? block.title : "", body: keepCopy(block.body) ? block.body : "", items: block.items?.filter((item) => keepCopy(item.title) && keepCopy(item.body)), options: { ...block.options, secondaryLabel: block.options?.secondaryLabel } };
 const Title = primary ? "h1" : "h2";
 const siteName = data.st.siteName;
 switch (block.sectionId) {
 case "hero": return <section className="boutique-hero">
  <div className="boutique-hero-copy"><span className="boutique-eyebrow">{siteName} · WOMEN’S BOUTIQUE</span><div className="boutique-rule"/><p className="boutique-kicker">روایت تازه‌ای از استایل شما</p><Title>{block.title || <>زیبایی در سادگی،<br/><em>درخشش در جزئیات.</em></>}</Title><p className="boutique-description">{block.body || `لباس‌هایی برای خودِ واقعی شما؛ از روزهای ساده تا لحظه‌های به‌یادماندنی. مجموعه‌های ${siteName} را کشف کنید و به سبک خودتان بدرخشید.`}</p><div className="boutique-actions"><Link className="boutique-button" href={block.href || "/shop?sort=new"}>{block.buttonLabel || "کشف تازه‌رسیده‌ها"}<ArrowLeft size={18}/></Link><Link className="boutique-text-link" href={block.options?.secondaryHref || "/shop"}>{block.options?.secondaryLabel || "مشاهده همه لباس‌ها"}</Link></div><span className="boutique-hero-note">انتخابی برای هر روز، استایلی برای همیشه</span></div>
  <div className="boutique-hero-art"><Image loader={block.mediaId ? heroMediaLoader : undefined} unoptimized={!block.mediaId} src={block.mediaId ? `/api/media/${block.mediaId}` : "/images/boutique-editorial.svg"} alt={block.mediaId ? block.caption || "مجموعه پوشاک زنانه" : "تصویرسازی مجموعه زنانه با ترنچ کت کرم، پیراهن زرشکی و کیف"} width={1280} height={1500} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 55vw, 45vw"   className="h-full w-full object-cover" loading="lazy" decoding="async"/><div className="boutique-image-label"><span>THE NEW COLLECTION</span><b>جزئیاتی که تفاوت می‌سازند</b><Link href="/shop?sort=new" aria-label="مشاهده مجموعه جدید"><ArrowLeft size={22}/></Link></div></div>
 </section>;
 case "trust": return <section className="boutique-benefits">{[[Truck,"ارسال سفارش","راهنمای تحویل و ارسال","/shipping-delivery"],[Ruler,"انتخاب آگاهانه","مشاوره پیش از خرید","/contact"],[CreditCard,"خرید آسان","سبد خرید و پرداخت","/cart"],[Headphones,"همراه شما","ارتباط با پشتیبانی","/contact"]].map(([Icon,title,body,href]) => {const I=Icon as typeof Truck; return <Link href={href as string} key={title as string}><I size={25} strokeWidth={1.3}/><div><b>{title as string}</b><span>{body as string}</span></div></Link>;})}</section>;
 case "categories": {const categories = data.cats.slice(0,4).map((category) => ({category, icon: /مانتو/.test(category.name) ? Shirt : /بلوز/.test(category.name) ? Sparkles : /تاپ/.test(category.name) ? Shirt : Ruler})); return <section><div className="boutique-section-title"><div><span className="boutique-eyebrow">{siteName} COLLECTION</span><h2>{block.title || "دسته‌بندی پوشاک"}</h2><p>{block.body || `دسته‌های پوشاک ${siteName}`}</p></div><Link href="/categories">همه دسته‌بندی‌ها <ArrowLeft size={16}/></Link></div><div className="boutique-categories">{categories.map(({category,icon:Icon},i)=><Link key={category.id} href={`/shop?cat=${category.id}`}><span className="boutique-category-number">0{i+1}</span><Icon size={56} strokeWidth={.8}/><b>{category.name}</b><span>کشف مجموعه <ArrowLeft size={15}/></span></Link>)}</div></section>;}
 case "why": return <section className="boutique-story"><div><span className="boutique-eyebrow">LESS, BUT BETTER</span><h2>{block.title || "استایل خوب، از انتخاب خوب شروع می‌شود."}</h2></div><div><p>{block.body || `ما در ${siteName} به لباس‌هایی فکر می‌کنیم که بارها به سراغشان می‌روید؛ رنگ‌های هماهنگ، فرم‌های ساده و جزئیاتی که استایل شخصی شما را کامل می‌کنند.`}</p><Link href={block.href || "/about"}>داستان بوتیک ما <ArrowLeft size={18}/></Link></div></section>;
 case "guarantee": return <section className="boutique-help"><Ruler size={38} strokeWidth={1}/><div><h2>{block.title || "برای انتخاب بهتر، کنارتان هستیم"}</h2><p>{block.body || "پیش از سفارش، اطلاعات محصول و شرایط خرید و بازگشت را بررسی کنید؛ برای پرسش‌های بیشتر با ما در تماس باشید."}</p></div><Link className="boutique-button" href={block.href || "/faq"}>{block.buttonLabel || "راهنمای خرید"}<ArrowLeft size={16}/></Link></section>;
 case "promo": return <section className="boutique-story"><div><span className="boutique-eyebrow">YOUR NEXT FAVORITE</span><h2>{block.title || "انتخاب بعدیِ محبوب شما اینجاست."}</h2></div><Link className="boutique-button" href={block.href || "/shop"}>{block.buttonLabel || "گشت‌وگذار در بوتیک"}<ArrowLeft size={18}/></Link></section>;
 case "testimonials": if (!block.items?.length) return null;
 }
 return null;
}
