import Link from "next/link";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { AlertTriangle, ArrowLeft, BadgePercent, Ruler, ShoppingBag } from "lucide-react";
import { db } from "@/db";
import { clearanceItems, products, productVariants } from "@/db/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Img } from "@/components/ui";
import { faNum, toman } from "@/lib/util";
import { getSettings } from "@/lib/settings";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSettings();
  return seoMetadata(settings, {
    title: `حراج آسیب‌دیده و تک‌سایز | ${settings.siteName}`,
    description: `خرید کالاهای آسیب‌دیده جزئی و تک‌سایزهای نمایشگاهی با قیمت ویژه از ${settings.siteName}.`,
    path: "/clearance",
  });
}

export default async function ClearanceStorePage() {
  const rows = await db.select({ item: clearanceItems, product: products, variant: productVariants })
    .from(clearanceItems).innerJoin(products, eq(products.id, clearanceItems.productId)).leftJoin(productVariants, eq(productVariants.id, clearanceItems.variantId))
    .where(and(eq(clearanceItems.active, true), eq(products.source, "central"), inArray(products.status, ["active", "out_of_stock"]), isNull(products.deletedAt)))
    .orderBy(clearanceItems.createdAt);
  const items = rows.map(({ item, product, variant }) => ({
    id: item.id, kind: item.kind, salePrice: Number(item.salePrice), note: item.note,
    productId: product.id, slug: product.slug, name: product.nameFa, imageId: product.mainImageId,
    variantId: item.variantId, variantTitle: variant?.title ?? null,
    referencePrice: Number(variant?.price ?? product.basePrice),
    available: Math.max(0, Number(variant?.onHand ?? product.onHand) - Number(variant?.reserved ?? product.reserved)),
    inventoryUnit: variant?.inventoryUnit ?? product.inventoryBaseUnit,
  }));

  return <>
    <SiteHeader />
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-8 sm:py-12">
      <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-l from-rose-950 via-rose-900 to-amber-800 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
        <div className="absolute -left-8 -top-12 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><BadgePercent className="size-4" />تعداد محدود · قیمت ویژه</span><h1 className="mt-4 text-2xl font-black sm:text-4xl">حراج آسیب‌دیده و تک‌سایز</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-rose-50 sm:text-base">تک‌سایزهای نمایشگاهی و لباس‌هایی با ایراد جزئی، با توضیح شفاف و قیمت پایین‌تر. جزئیات هر کالا را پیش از خرید ببینید.</p></div>
          <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-rose-950">همهٔ محصولات <ArrowLeft className="size-4" /></Link>
        </div>
      </div>
      {items.length === 0 ? <section className="rounded-3xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle className="size-7" /></span><h2 className="mt-4 text-lg font-black text-slate-800">فعلاً کالایی در حراج نیست</h2><p className="mt-2 text-sm text-slate-500">به‌زودی کالاهای تک‌سایز و حراجی در همین صفحه قرار می‌گیرند.</p><Link href="/shop" className="btn-primary mt-5">رفتن به فروشگاه</Link></section>
        : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{items.map((item) => {
          const href = `/products/${item.slug}${item.variantId ? `?variant=${item.variantId}` : ""}`;
          const discount = item.referencePrice > item.salePrice ? Math.round((1 - item.salePrice / item.referencePrice) * 100) : 0;
          return <article key={item.id} className="group overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <Link href={href} className="relative block aspect-[3/4] overflow-hidden bg-rose-50"><Img id={item.imageId} alt={item.name} className={`size-full object-cover transition duration-500 group-hover:scale-105 ${item.available > 0 ? "" : "grayscale opacity-60"}`} /><span className="absolute right-2 top-2 rounded-full bg-rose-700 px-2.5 py-1 text-[10px] font-bold text-white">{item.kind === "damaged" ? "آسیب‌دیده جزئی" : "تک‌سایز"}</span>{discount > 0 && <span className="absolute left-2 top-2 rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black text-rose-950">٪{faNum(discount)} تخفیف</span>}{item.available <= 0 && <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-slate-900/70 py-2 text-center text-xs font-bold text-white">ناموجود</span>}</Link>
            <div className="space-y-2 p-3.5 sm:p-4"><Link href={href} className="line-clamp-2 min-h-11 text-sm font-black leading-6 text-slate-900 hover:text-rose-800">{item.name}</Link>{item.variantTitle && <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-900"><Ruler className="size-3" />{item.variantTitle}</span>}{item.note && <p className="line-clamp-2 min-h-9 text-[11px] leading-5 text-slate-600">{item.note}</p>}<div className="flex items-end justify-between gap-2 pt-1"><div>{discount > 0 && <s className="block text-[11px] text-slate-400">{toman(item.referencePrice)}</s>}<b className="text-sm font-black text-rose-800 sm:text-base">{toman(item.salePrice)}</b></div><span className="text-[10px] text-slate-500">{faNum(item.available)} {item.inventoryUnit}</span></div>{item.available > 0 ? <Link href={href} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-800 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-rose-900"><ShoppingBag className="size-4" />انتخاب و خرید</Link> : <span className="block rounded-xl bg-slate-100 px-3 py-2.5 text-center text-xs font-bold text-slate-500">اتمام موجودی</span>}</div>
          </article>;
        })}</div>}
    </main>
    <SiteFooter />
  </>;
}
