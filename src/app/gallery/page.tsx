import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BoutiqueProductGallery } from "@/components/BoutiqueProductGallery";
import { listShopProducts } from "@/lib/queries";

export const metadata = { title: "گالری محصولات", description: "تصاویر پوشاک بوتیک؛ محصولات موجود به‌صورت رنگی و محصولات ناموجود به‌صورت سیاه‌وسفید." };

export default async function GalleryPage() {
  const products = await listShopProducts({ sort: "new" }, 5000);
  return <div className="minimal-storefront"><SiteHeader minimal />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="مسیر صفحه" className="mb-6 text-xs text-slate-500"><Link href="/">خانه</Link> / گالری محصولات</nav>
      <h1 className="sr-only">گالری محصولات بوتیک</h1>
      <BoutiqueProductGallery products={products}/>
    </main><SiteFooter/></div>;
}
