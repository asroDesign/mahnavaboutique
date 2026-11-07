import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, centralPosSales, products, productVariants } from "@/db/schema";
import { requirePage } from "@/lib/auth";
import { PageHeader, Table, Td } from "@/components/ui";
import { faNum, jdate, toman } from "@/lib/util";
import PosClient from "@/components/SellerPosClient";
import { InvoiceButton } from "@/components/InvoiceModal";

export default async function CentralPosPage(){
 await requirePage({perm:"INVENTORY_MANAGE"});
 const rows=await db.select({variant:productVariants,product:products,categoryName:categories.name,lastCost:sql<number>`coalesce(${productVariants.costPrice},(select sm.unit_cost from stock_movements sm where sm.variant_id=${productVariants.id} and sm.type in ('purchase_in','repack_in') order by sm.created_at desc, sm.id desc limit 1),${products.avgCost},0)`}).from(productVariants).innerJoin(products,eq(products.id,productVariants.productId)).leftJoin(categories,eq(categories.id,products.categoryId)).where(and(eq(productVariants.isActive,true),eq(productVariants.isSellable,true),isNull(productVariants.deletedAt),eq(products.source,"central"),eq(products.status,"active"))).orderBy(products.nameFa);
 const productsForPos=rows.filter(x=>((x.variant.onHand>x.variant.reserved)||x.product.allowBackorder)&&(x.variant.price??x.product.basePrice)>0).map(({variant,product,categoryName,lastCost})=>({offerId:variant.id,productId:product.id,name:product.nameFa,brand:product.brand,sku:variant.sku,variantTitle:variant.title,price:variant.price??product.basePrice,cost:Number(lastCost),stock:Math.max(0,variant.onHand-variant.reserved),allowBackorder:product.allowBackorder,weight:product.weight??0,categoryId:product.categoryId,categoryName:categoryName??"بدون دسته‌بندی",imageId:product.mainImageId}));
 const posCategories=await db.select({id:categories.id,name:categories.name}).from(categories).orderBy(categories.sortOrder,categories.name);
 const recent=await db.select({sale:centralPosSales,itemCount:sql<number>`(select coalesce(sum(quantity),0)::int from central_pos_items where sale_id=${centralPosSales.id})`}).from(centralPosSales).orderBy(desc(centralPosSales.createdAt)).limit(12);
 return (
  <>
   <PageHeader title="فروش حضوری انبار مرکزی" subtitle="ثبت فاکتور نقدی یا کارتی، کسر موجودی آزاد و ثبت خودکار سند حسابداری"/>
   <PosClient products={productsForPos} categories={posCategories} endpoint="/api/admin/pos" central/>
   <section className="mt-8 min-w-0">
    <h2 className="mb-3 text-lg font-black">آخرین فروش‌های حضوری</h2>
    {recent.length ? <>
     <div className="hidden xl:block"><Table head={["فاکتور","تاریخ","مشتری","اقلام","مبلغ","جزئیات"]}>{recent.map(({sale,itemCount})=><tr key={sale.id}><Td><b dir="ltr">{sale.number}</b></Td><Td>{jdate(sale.createdAt,true)}</Td><Td>{sale.customerName}<small className="block text-slate-500" dir="ltr">{sale.customerPhone}</small></Td><Td>{faNum(itemCount)}</Td><Td><b>{toman(sale.total)}</b>{sale.discount>0&&<small className="block text-rose-600">تخفیف: {toman(sale.discount)}</small>}</Td><Td><div className="flex flex-wrap gap-1"><InvoiceButton src={`/print/pos/central/${sale.id}`}/>{sale.shippingAddress&&<a className="btn-sm" href={`/print/pos-label/${sale.id}`} target="_blank">چاپ لیبل</a>}</div></Td></tr>)}</Table></div>
     <div className="grid gap-3 sm:grid-cols-2 xl:hidden">{recent.map(({sale,itemCount})=><article key={`mobile-sale:${sale.id}`} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"><div className="min-w-0"><span className="text-[11px] text-slate-500">شماره فاکتور</span><b className="mt-1 block truncate text-sm" dir="ltr">{sale.number}</b></div><time className="shrink-0 text-[11px] text-slate-500">{jdate(sale.createdAt,true)}</time></div>
      <div className="mt-3 min-w-0"><span className="text-[11px] text-slate-500">مشتری</span><b className="mt-1 block break-words text-sm">{sale.customerName||"مشتری حضوری"}</b><span className="mt-1 block text-xs text-slate-500" dir="ltr">{sale.customerPhone}</span></div>
      <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-[11px] text-slate-500">اقلام</span><b className="mt-1 block text-sm">{faNum(itemCount)}</b></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-[11px] text-slate-500">مبلغ</span><b className="mt-1 block break-words text-sm">{toman(sale.total)}</b>{sale.discount>0&&<small className="mt-1 block text-[10px] text-rose-600">تخفیف: {toman(sale.discount)}</small>}</div></div>
      <div className="mt-3 flex flex-wrap gap-2"><InvoiceButton src={`/print/pos/central/${sale.id}`}/>{sale.shippingAddress&&<a className="btn-sm" href={`/print/pos-label/${sale.id}`} target="_blank">چاپ لیبل</a>}</div>
     </article>)}</div>
    </> : <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">هنوز فروش حضوری ثبت نشده است.</p>}
   </section>
  </>
 );
}
