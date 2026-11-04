"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BadgePercent, LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { api, toast } from "@/components/client";
import { Badge, Card, Empty, Img, PageHeader } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { faNum, toman } from "@/lib/util";

type ChoiceVariant = { id: number; title: string; price: number | null; available: number; referencePrice: number; alreadyListed: boolean; inventoryUnit: string };
type Choice = { id: number; nameFa: string; brand: string; imageId: number | null; basePrice: number; available: number; inventoryUnit: string; hasVariants: boolean; alreadyListed: boolean; referencePrice: number; variants: ChoiceVariant[] };
type ClearanceItem = { id: number; productId: number; variantId: number | null; kind: "damaged" | "single"; salePrice: number; note: string | null; createdAt: string; productName: string; brand: string; slug: string; imageId: number | null; variantTitle: string | null; referencePrice: number; available: number; inventoryUnit: string };
type Data = { items: ClearanceItem[]; choices: Choice[] };

const kindLabel = (kind: "damaged" | "single") => kind === "damaged" ? "آسیب‌دیده" : "تک‌سایز / نمایشگاهی";

export function ClearanceManager() {
  const [data, setData] = useState<Data>({ items: [], choices: [] });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [kind, setKind] = useState<"damaged" | "single">("damaged");
  const [salePrice, setSalePrice] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await api<Data>("/api/admin/clearance", "GET")); }
    catch (error) { toast((error as Error).message, false); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const candidates = useMemo(() => data.choices.filter((product) => {
    const matches = !query.trim() || `${product.nameFa} ${product.brand}`.toLowerCase().includes(query.trim().toLowerCase());
    const availableTarget = product.hasVariants ? product.variants.some((variant) => !variant.alreadyListed) : !product.alreadyListed;
    return matches && availableTarget;
  }), [data.choices, query]);
  const selected = data.choices.find((product) => product.id === Number(productId));
  const selectedVariant = selected?.variants.find((variant) => variant.id === Number(variantId));
  const referencePrice = selected?.hasVariants ? selectedVariant?.referencePrice ?? 0 : selected?.referencePrice ?? 0;
  const priceNumber = Number(salePrice);

  const startAdding = () => {
    setQuery(""); setProductId(""); setVariantId(""); setSalePrice(""); setNote(""); setKind("damaged"); setOpen(true);
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return toast("یک محصول انتخاب کنید", false);
    if (selected.hasVariants && !selectedVariant) return toast("یک سایز یا تنوع انتخاب کنید", false);
    if (!Number.isSafeInteger(priceNumber) || priceNumber <= 0 || priceNumber >= referencePrice) return toast("قیمت ویژه باید از قیمت عادی کمتر باشد", false);
    setSaving(true);
    try {
      await api("/api/admin/clearance", "POST", { productId: selected.id, variantId: selectedVariant?.id ?? null, kind, salePrice: priceNumber, note });
      toast("محصول به حراج اضافه شد"); setOpen(false); await load();
    } catch (error) { toast((error as Error).message, false); }
    finally { setSaving(false); }
  };
  const remove = async (item: ClearanceItem) => {
    if (!window.confirm(`«${item.productName}${item.variantTitle ? ` · ${item.variantTitle}` : ""}» از حراج حذف شود؟`)) return;
    setRemoving(item.id);
    try { await api(`/api/admin/clearance/${item.id}`, "DELETE"); toast("محصول از حراج حذف شد"); await load(); }
    catch (error) { toast((error as Error).message, false); }
    finally { setRemoving(null); }
  };

  return <div className="animate-fade-in">
    <PageHeader title="حراج آسیب‌دیده و تک‌سایز" subtitle="کالاهای آسیب‌دیده جزئی یا تک‌سایز نمایشگاهی با قیمت ویژه" actions={<button className="btn-primary" onClick={startAdding}><Plus className="size-4" />افزودن از محصولات</button>} />
    {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="shimmer h-52 rounded-2xl" />)}</div>
      : data.items.length === 0 ? <Card><Empty title="کالای آسیب‌دیده یا تک‌سایزی موجود نیست" text="با دکمهٔ «افزودن از محصولات» یک کالا یا تنوع آن را به حراج اضافه کنید." /></Card>
        : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((item) => <Card key={item.id} className="overflow-hidden p-0 transition hover:shadow-md">
          <div className="flex gap-4 p-4">
            <Img id={item.imageId} alt={item.productName} className="size-24 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2"><h2 className="font-bold leading-6 text-slate-800">{item.productName}</h2><button title="حذف از حراج" disabled={removing === item.id} onClick={() => void remove(item)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-50">{removing === item.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button></div>
              <div className="mt-2 flex flex-wrap gap-1.5"><Badge tone={item.kind === "damaged" ? "red" : "violet"}>{kindLabel(item.kind)}</Badge>{item.variantTitle && <Badge tone="gray">{item.variantTitle}</Badge>}</div>
              <p className="mt-2 text-xs text-slate-500">{item.brand} · موجودی: {faNum(item.available)} {item.inventoryUnit}</p>
              {item.note && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{item.note}</p>}
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 border-t bg-slate-50/70 px-4 py-3"><div><b className="text-lg text-emerald-700">{toman(item.salePrice)}</b><s className="block text-xs text-slate-400">{toman(item.referencePrice)}</s></div><span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">{item.referencePrice > 0 ? `٪${faNum(Math.round((1 - item.salePrice / item.referencePrice) * 100))} تخفیف` : "قیمت ویژه"}</span></div>
        </Card>)}</div>}

    {open && <Modal title="افزودن محصول به حراج" onClose={() => !saving && setOpen(false)}>
      <form onSubmit={save} className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">نوع حراج<select value={kind} onChange={(event) => setKind(event.target.value as "damaged" | "single")} className="input mt-1"><option value="damaged">کالای آسیب‌دیده جزئی</option><option value="single">تک‌سایز / نمایشگاهی</option></select></label>
        <div><label className="block text-sm font-bold text-slate-700">انتخاب محصول</label><div className="relative mt-1"><Search className="absolute right-3 top-3 size-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو بر اساس نام یا برند" className="input pr-9" /></div>
          <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200">{candidates.length ? candidates.map((product) => <button type="button" key={product.id} onClick={() => { setProductId(String(product.id)); setVariantId(product.hasVariants ? String(product.variants.find((variant) => !variant.alreadyListed)?.id ?? "") : ""); setSalePrice(""); }} className={`flex w-full items-center justify-between gap-3 border-b px-3 py-2.5 text-right last:border-0 ${Number(productId) === product.id ? "bg-emerald-50 text-emerald-800" : "hover:bg-slate-50"}`}><span className="min-w-0 truncate text-sm font-medium">{product.nameFa}{product.hasVariants && <small className="mr-1 text-slate-400">· دارای تنوع</small>}</span><span className="shrink-0 text-xs text-slate-500">{toman(product.basePrice)}</span></button>) : <p className="p-4 text-center text-sm text-slate-400">محصول قابل افزودن پیدا نشد</p>}</div>
        </div>
        {selected?.hasVariants && <label className="block text-sm font-bold text-slate-700">سایز / تنوع<select value={variantId} onChange={(event) => { setVariantId(event.target.value); setSalePrice(""); }} className="input mt-1"><option value="">انتخاب کنید</option>{selected.variants.filter((variant) => !variant.alreadyListed).map((variant) => <option key={variant.id} value={variant.id}>{variant.title} · {toman(variant.referencePrice)} · موجودی {faNum(variant.available)}</option>)}</select></label>}
        {selected && <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-bold text-slate-700">قیمت حراج (تومان)<input type="number" min="1" max={Math.max(0, referencePrice - 1)} required dir="ltr" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} className="input mt-1" placeholder="قیمت ویژه" />{referencePrice > 0 && <small className="mt-1 block font-normal text-slate-500">قیمت عادی: {toman(referencePrice)}</small>}</label><label className="block text-sm font-bold text-slate-700">توضیح (اختیاری)<textarea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} className="input mt-1 min-h-24" placeholder="مثلاً خراش جزئی روی لبهٔ لباس" /></label></div>}
        <div className="flex justify-end gap-2 border-t pt-4"><button type="button" className="btn-ghost" disabled={saving} onClick={() => setOpen(false)}>انصراف</button><button type="submit" className="btn-primary" disabled={saving || !selected || (selected.hasVariants && !selectedVariant) || !Number.isSafeInteger(priceNumber) || priceNumber <= 0 || priceNumber >= referencePrice}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : <BadgePercent className="size-4" />}افزودن به حراج</button></div>
      </form>
    </Modal>}
  </div>;
}
