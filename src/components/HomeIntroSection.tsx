"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Image as ImageIcon, Sparkles } from "lucide-react";
import type { SitePageBlock } from "@/db/schema";
import type { ShopProduct } from "@/lib/queries";
import { currencyUnit, faNum } from "@/lib/util";
import { Img } from "./ui";
import styles from "./HomeIntro.module.css";

function shuffled<T,>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function HomeIntroSection({ block, products, preview = false }: { block: SitePageBlock; products: ShopProduct[]; preview?: boolean }) {
  const mode = block.options?.introMode ?? "random_products";
  const productMap = useMemo(() => new Map(products.map(product => [product.id, product])), [products]);
  const selectedIdsKey = (block.options?.productIds ?? []).join(",");
  const pool = useMemo(() => selectedIdsKey
    ? selectedIdsKey.split(",").map(Number).map(id => productMap.get(id)).filter((product): product is ShopProduct => !!product)
    : products.filter(product => product.inStock), [selectedIdsKey, productMap, products]);
  const count = Math.max(1, Math.min(6, block.options?.limit ?? 3));
  const [featuredIds, setFeaturedIds] = useState(() => pool.slice(0, count).map(product => product.id));
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setFeaturedIds(shuffled(pool).slice(0, count).map(product => product.id)));
    return () => window.cancelAnimationFrame(frame);
  }, [pool, count]);
  const featured = featuredIds.map(id => productMap.get(id)).filter((product): product is ShopProduct => !!product);

  if (block.enabled === false) return null;
  if (mode === "banner") {
    if (!block.mediaId) return preview ? <div className={styles.empty}><ImageIcon size={22}/><span>برای بنر آغازین، تصویر را از پنل انتخاب کنید.</span></div> : null;
    return <Link href={block.href || "/shop"} aria-label={block.title || block.caption || "مشاهده پیشنهاد فروشگاه"} className={styles.banner}>
      <Img id={block.mediaId} alt={block.caption || block.title || "پیشنهاد ویژه فروشگاه"} className={styles.bannerImage}/>
      <span className={styles.bannerShade}/><span className={styles.bannerCurve}/>
      <span className={styles.bannerCopy}>
        {block.caption && <span className={styles.eyebrow}>{block.caption}</span>}
        <strong>{block.title || "انتخابی تازه برای استایل شما"}</strong>
        {block.body && <span className={styles.bannerText}>{block.body}</span>}
        <span className={styles.bannerButton}>{block.buttonLabel || "مشاهده مجموعه"}<ArrowLeft size={16}/></span>
      </span>
    </Link>;
  }

  if (!featured.length) return preview ? <div className={styles.empty}><Sparkles size={22}/><span>چند محصول را برای نمایش تصادفی انتخاب کنید.</span></div> : null;
  return <section className={styles.random} aria-label={block.title || "محصولات منتخب"}>
    <span className={styles.orbit} aria-hidden="true"/>
    <div className={styles.copy}>
      <span className={styles.eyebrow}>A LITTLE SOMETHING FOR YOU</span>
      <h2>{block.title || "انتخاب‌های تازه برای شما"}</h2>
      <p>{block.body || "چند انتخاب از میان لباس‌های بوتیک مه‌لقا؛ هر بار با ترکیبی تازه."}</p>
      <Link href={block.href || "/shop"} className={styles.action}>{block.buttonLabel || "کشف همه محصولات"}<ArrowLeft size={16}/></Link>
      <span className={styles.edition}>MAHLEGHA · SELECTED WITH CARE</span>
    </div>
    <div className={styles.products}>
      {featured.map((product, index) => <Link key={product.id} href={`/products/${product.slug}`} className={`${styles.product} ${styles[`product${index + 1}`]}`}>
        <span className={styles.productImage}>{product.imageId ? <Img id={product.imageId} alt={product.nameFa} variant="card" sizes="(max-width: 700px) 42vw, 220px"/> : <ImageIcon size={30}/>}</span>
        <span className={styles.productDetails}><span>{product.brand}</span><b>{product.nameFa}</b><strong>{product.minPrice ? `${faNum(product.minPrice)} ${currencyUnit()}` : "مشاهده محصول"}</strong></span>
      </Link>)}
    </div>
  </section>;
}
