import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Shirt, ShoppingBag, Footprints, Truck, Headphones, CreditCard, Ruler, Tags } from "lucide-react";
import type { SitePageBlock } from "@/db/schema";
import type { HomeData } from "@/lib/home-data";
import { PageBlockFrame } from "./PageBlockFrame";
import { PublicSiteBlockContent } from "./PublicSiteBlockContent";
import { StoreSection } from "./HomeContent";
import { ProductCard } from "./ProductCard";
import { ProductShelf } from "./ProductShelf";
import { HomeIntroSection } from "./HomeIntroSection";
import { Img } from "./ui";
import styles from "./MinimalHome.module.css";
import { hasBoutiqueContext } from "@/lib/boutique-content";

/** Keep catalog navigation near the top while allowing one optional intro ahead of it. */
export function HomePublicContent({ blocks, data, children }: { blocks: SitePageBlock[]; data: HomeData; children?: ReactNode }) {
  const categorySource = blocks.find(block => block.type === "store_section" && block.sectionId === "categories");
  const categoryBlock = categorySource && hasBoutiqueContext(categorySource.title, categorySource.body)
    ? categorySource
    : categorySource ? { ...categorySource, title: "دسته‌بندی پوشاک زنانه", body: "مدل‌های مورد علاقه‌تان را از میان مجموعهٔ بوتیک پیدا کنید." } : undefined;
  const rootCategories = data.cats.filter(category => !category.parent_id);
  const selectedCategoryIds = categoryBlock?.options?.categoryIds;
  const categories = selectedCategoryIds === undefined ? rootCategories : rootCategories.filter(category => selectedCategoryIds.includes(category.id));
  const introBlock = blocks.find(block => block.type === "home_intro" && block.enabled !== false);
  const trustBlock = blocks.find(block => block.type === "store_section" && block.sectionId === "trust");
  const freshSource = blocks.find(block => block.type === "store_section" && block.sectionId === "fresh");
  const freshBlock = freshSource && hasBoutiqueContext(freshSource.title, freshSource.body)
    ? freshSource
    : freshSource ? { ...freshSource, title: "تازه‌رسیده‌های بوتیک", body: "جدیدترین لباس‌های زنانه را ببینید." }
      : { type: "store_section" as const, sectionId: "fresh", title: "", body: "", items: [] };
  const selectedIds = freshBlock.options?.productIds;
  const categoryId = freshBlock.options?.categoryId;
  const categoryIds = new Set([categoryId, ...data.cats.filter(category => category.parent_id === categoryId).map(category => category.id)]);
  const pool = selectedIds?.length
    ? selectedIds.flatMap(id => data.all.find(product => product.id === id) ?? [])
    : data.all.filter(product => !categoryId || categoryIds.has(product.categoryId ?? undefined));
  const newest = (selectedIds?.length ? pool : [...pool].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    .slice(0, freshBlock?.options?.limit ?? 8);
  const additional = blocks.filter(block => block.type !== "home_intro" && block.enabled !== false && (block.type !== "store_section" || (
    !["categories", "fresh", "trust", "farms"].includes(block.sectionId || "") &&
    Boolean(block.title || block.body || block.mediaId || block.items?.length || block.options?.productIds?.length)
  ))).map(block => {
    if (block.type !== "store_section" || hasBoutiqueContext(block.title, block.body)) return block;
    const copy: Record<string, { title: string; body: string }> = {
      popular: { title: "محبوب‌ترین‌های بوتیک", body: "انتخاب‌های پرطرفدار مشتریان برای استایل روزمره و موقعیت‌های خاص." },
      deals: { title: "پیشنهادهای ویژه", body: "لباس‌های منتخب را با قیمت‌های به‌روز ببینید." },
      blog: { title: `از مجله ${data.st.siteName}`, body: "راهنمای پوشاک، انتخاب لباس و ساختن استایل شخصی." },
    };
    const replacement = copy[block.sectionId ?? ""];
    return replacement ? { ...block, ...replacement } : block;
  });

  return (
    <main className={`boutique-home ${styles.home}`}>
      {introBlock && <PageBlockFrame block={introBlock}><HomeIntroSection block={introBlock} products={data.all} /></PageBlockFrame>}
      <PageBlockFrame block={categoryBlock ?? { type: "store_section", sectionId: "categories" }}>
        <section className={styles.categorySection} aria-labelledby="home-categories-title">
          <div className={styles.heading}>
            <div><h1 id="home-categories-title">{categoryBlock?.title || "دسته‌بندی‌ها"}</h1><p>{categoryBlock?.body || "استایل بعدی‌تان را از اینجا پیدا کنید."}</p></div>
            <Link href="/categories">همه دسته‌بندی‌ها <ArrowLeft size={16} /></Link>
          </div>
          {categories.length ? <div className={styles.categories}>
            {categories.map(category => { const Icon = /کیف|چرمی/.test(category.name) ? ShoppingBag : /کفش/.test(category.name) ? Footprints : Shirt; return <Link key={category.id} href={`/shop?cat=${category.id}`} className={styles.category}>
              <span className={styles.categoryImage}>
                {category.img ? <Img id={category.img} alt="" sizes="(max-width: 640px) 28vw, 160px" /> : <Icon size={46} strokeWidth={1} aria-hidden="true" />}
              </span>
              <span>{category.name}</span>
            </Link>; })}
          </div> : <p className={styles.empty}>{selectedCategoryIds?.length === 0 ? "برای نمایش دسته‌ها، آن‌ها را از پنل مدیریت انتخاب کنید." : "دسته‌بندی‌های فروشگاه به‌زودی در این بخش نمایش داده می‌شوند."}</p>}
        </section>
      </PageBlockFrame>

      {data.homeBrands.length > 0 && <section aria-labelledby="home-brands-title">
        <div className={styles.heading}>
          <div><h2 id="home-brands-title">برندهای منتخب</h2><p>برندهایی که برای شما انتخاب کرده‌ایم.</p></div>
          <Link href="/brands">همه برندها <ArrowLeft size={16} /></Link>
        </div>
        <div className={styles.brands}>{data.homeBrands.map(brand => <Link key={brand.id} href={`/brands/${brand.slug}`} className={styles.brand}>
          <span className={styles.brandLogo}>{brand.logoMediaId ? <Img id={brand.logoMediaId} alt={brand.name} sizes="96px" /> : <Tags size={30} strokeWidth={1.25} aria-hidden="true" />}</span>
          <span className="line-clamp-2">{brand.name}</span>
        </Link>)}</div>
      </section>}

      {children}

      {freshBlock.enabled !== false && <PageBlockFrame block={freshBlock}>
        <section aria-labelledby="home-newest-title">
          <div className={styles.heading}>
            <div><h2 id="home-newest-title">{freshBlock.title || "جدیدترین محصولات"}</h2>{freshBlock.body && <p>{freshBlock.body}</p>}</div>
            <Link href="/shop?sort=new">مشاهده همه <ArrowLeft size={16} /></Link>
          </div>
          {newest.length ? <div className={styles.products}>{newest.map(product => <ProductCard key={product.id} p={product} />)}</div>
            : <div className={styles.empty}><Shirt size={32} strokeWidth={1} /><p>محصولات جدید به‌زودی به فروشگاه اضافه می‌شوند.</p><Link href="/shop">مشاهده فروشگاه <ArrowLeft size={16} /></Link></div>}
        </section>
      </PageBlockFrame>}

      <section className={styles.clearance} aria-label="حراج ویژه">
        <div><span>فرصت‌های محدود</span><h2>حراج آسیب‌دیده و تک‌سایز</h2><p>انتخاب‌های ویژه، با قیمت کمتر</p></div>
        <Link href="/clearance" className={styles.clearanceAction}>مشاهده و خرید <ArrowLeft size={18} /></Link>
      </section>

      {additional.map((block, index) => block.type === "store_section"
        ? <PageBlockFrame key={block.id || index} block={block}><StoreSection block={block} data={data} /></PageBlockFrame>
        : block.type === "product_shelf"
          ? <PageBlockFrame key={block.id || index} block={block}><ProductShelf block={block} data={data} /></PageBlockFrame>
          : <PageBlockFrame key={block.id || index} block={block}><PublicSiteBlockContent block={block} primary={false} /></PageBlockFrame>)}
      {trustBlock && <PageBlockFrame block={trustBlock}>
        <section aria-label="خدمات فروشگاه">
          {(trustBlock.title || trustBlock.body) && <div className={styles.heading}><div>{trustBlock.title && <h2>{trustBlock.title}</h2>}{trustBlock.body && <p>{trustBlock.body}</p>}</div></div>}
          <div className={styles.benefits}>
            {(trustBlock.items?.length
              ? trustBlock.items.slice(0, 4).map((item, index) => ({ Icon: [Truck, Ruler, CreditCard, Headphones][index], title: item.title, text: item.body, href: item.href || ["/shipping-delivery", "/faq", "/cart", "/contact"][index] }))
              : [{ Icon: Truck, title: "ارسال سفارش", text: "راهنمای ارسال و تحویل", href: "/shipping-delivery" },
                { Icon: Ruler, title: "انتخاب اندازه", text: "راهنمای خرید و سایز", href: "/faq" },
                { Icon: CreditCard, title: "خرید آسان", text: "مشاهده سبد خرید", href: "/cart" },
                { Icon: Headphones, title: "کنار شما هستیم", text: "ارتباط با پشتیبانی", href: "/contact" }]
            ).map(({ Icon, title, text, href }) =>
              <Link href={href} key={href}><Icon size={25} strokeWidth={1.25} /><div><b>{title}</b><span>{text}</span></div></Link>)}
          </div>
        </section>
      </PageBlockFrame>}
    </main>
  );
}
