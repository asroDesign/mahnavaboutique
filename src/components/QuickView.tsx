"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Eye, X, Loader2, ArrowLeft } from "lucide-react";
import { BuyBox, type OfferView, type VariantView } from "./BuyBox";
import { Gallery } from "./Gallery";
import { Stars } from "./Community";
import styles from "./QuickView.module.css";
import { siteBrandText } from "@/lib/brand";

export type { OfferView };
type Data = {
  product: {
    id: number; slug: string; nameFa: string; nameEn: string | null; sku: string; partNumber: string; brand: string; country: string | null; authenticity: string; category: string | null;
    shortDesc: string | null; specs: { k: string; v: string }[]; basePrice: number; source: string; available: number; status: string; allowBackorder: boolean; inquiryOnly: boolean; options: { name: string; values: string[] }[];
    purchaseOptions: { name: string; type: "text" | "select" | "checkbox" | "radio"; required: boolean; values: { label: string; price: number; priceType: "fixed" | "percent" }[] }[]; videoMediaId: number | null; compareAtPrice: number;
  };
  festival: { title: string; pct: number; color: string; endsAt: string } | null;
  images: number[]; variants: VariantView[]; offers: OfferView[];
  rating: { avg: number; n: number }; store: { multiVendor: boolean; siteName: string; returnDays: number; prepDays: number; shippingInfo: string; warrantyText: string };
};
const fa = (n: number) => n.toLocaleString("fa-IR");

export function QuickViewButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={(e) => { e.preventDefault(); setOpen(true); }} className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white/95 py-2 text-xs font-bold text-emerald-800 shadow-lg ring-1 ring-emerald-900/10 backdrop-blur transition hover:bg-emerald-600 hover:text-white"><Eye className="h-4 w-4" />نمایش سریع</button>
      {open && <QuickViewModal id={id} onClose={() => setOpen(false)} />}
    </>
  );
}

function QuickViewModal({ id, onClose }: { id: number; onClose: () => void }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    fetch(`/api/products/${id}/quick`).then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); setData(j); }).catch((e) => setErr(e.message || "خطا در دریافت اطلاعات"));
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [id, onClose]);
  if (!mounted) return null;
  const p = data?.product;
  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label={data?.product.nameFa ?? "نمایش سریع محصول"} dir="rtl">
      <div className={`qv-in ${styles.dialog}`}>
        <button onClick={onClose} aria-label="بستن" className={styles.close}><X className="h-5 w-5" /></button>
        {!data || !p ? (
          <div className={styles.loading}>{err ? <div className="text-sm text-rose-600">{err}</div> : <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />}</div>
        ) : (
          <div className={styles.content}>
            <div className={styles.gallery}><Gallery ids={data.images} alt={p.nameFa} videoId={p.videoMediaId} /></div>
            <div className={styles.details}>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {p.category && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-800 ring-1 ring-amber-200">{p.category}</span>}
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800 ring-1 ring-emerald-200">🌿 {siteBrandText(p.brand, data.store.siteName)}</span>
              </div>
              <h2 className="text-xl font-black leading-9 text-emerald-950">{p.nameFa}</h2>
              <div className="flex items-center gap-2 text-xs"><Stars value={data.rating.avg} size={14} /><span className="text-slate-500">{data.rating.n ? `${fa(data.rating.avg)} از ${fa(data.rating.n)} دیدگاه` : "بدون دیدگاه"}</span></div>
              {p.shortDesc && <p className="text-sm leading-7 text-slate-600">{p.shortDesc.replace(/<[^>]+>/g, " ").slice(0, 260)}</p>}
              {p.specs.length > 0 && <ul className="space-y-1 text-xs">{p.specs.slice(0, 4).map((sp) => <li key={sp.k} className="flex justify-between border-b border-dashed border-emerald-900/10 py-1"><span className="text-slate-500">{sp.k}</span><b className="text-slate-700">{sp.v}</b></li>)}</ul>}
              <Link href={`/products/${p.slug}`} onClick={onClose} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:gap-2 transition-all">مشاهده جزئیات کامل، دیدگاه‌ها و پرسش‌ها<ArrowLeft className="h-4 w-4" /></Link>
            </div>
            <div className={styles.purchase}>
              <BuyBox compact onAdded={onClose} product={{ id: p.id, nameFa: p.nameFa, basePrice: p.basePrice, source: p.source, available: p.available, active: p.status === "active" || (p.status === "out_of_stock" && p.allowBackorder), allowBackorder: p.allowBackorder, inquiryOnly: p.inquiryOnly, partNumber: p.partNumber }}
                options={p.options} purchaseOptions={p.purchaseOptions ?? []} variants={data.variants} offers={data.offers} festival={data.festival} compareAt={p.compareAtPrice}
                multiVendor={data.store.multiVendor} siteName={data.store.siteName} returnDays={data.store.returnDays} prepDays={data.store.prepDays} shippingInfo={data.store.shippingInfo} warrantyText={data.store.warrantyText} />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
