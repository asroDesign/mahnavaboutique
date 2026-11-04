import Link from "next/link";
import { BadgeCheck, ChevronDown, Flame, Headphones, LayoutDashboard, Menu, RotateCcw, ShoppingCart, Truck, User } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { LiveSearch } from "./LiveSearch";
import { activeFestivals } from "@/lib/marketing";
import { categoriesWithCounts } from "@/lib/queries";
import { CartCount } from "./client";
import { Countdown } from "./Countdown";
import { SiteBrand } from "./SiteBrand";
import { getSiteMenu } from "@/lib/site-menus";
import { SiteNavMenus, type PublicMenuItem } from "./SiteNavMenus";
import { ThemeToggle } from "./ThemeToggle";
import { PwaInstallButton } from "./PwaInstallButton";

export async function SiteHeader({ minimal = false }: { minimal?: boolean } = {}) {
  const [u, fests, cats, st, headerMenu, mobileMenu] = await Promise.all([getUser(), activeFestivals(), categoriesWithCounts(), getSettings(), getSiteMenu("header").catch(() => null), getSiteMenu("mobile").catch(() => null)]);
  const popular = ["مانتو", "شومیز", "بلوز", "تاپ", "تیشرت"];
  const mv = !!st.multiVendor;
  const panel = u ? (u.sellerId ? "/seller" : u.staff ? "/admin" : "/customer") : "/login";
  const fest = fests[0];
  const roots = cats.filter((c) => !c.parent_id);
  const fallbackMenu: PublicMenuItem[] = minimal ? [
    { id: -20, label: "فروشگاه", href: "/shop", targetBlank: false, children: [] },
    { id: -21, label: "جدیدترین‌ها", href: "/shop?sort=new", targetBlank: false, children: [] },
    { id: -23, label: "حراج ویژه", href: "/clearance", targetBlank: false, children: [] },
    { id: -24, label: "مجله مد", href: "/blog", targetBlank: false, children: [] },
  ] : [
    { id: -7, label: "حراج تک‌سایز و آسیب‌دیده", href: "/clearance", targetBlank: false, children: [] },
    { id: -1, label: "تخفیف‌ها و جشنواره", href: "/shop?sort=discount", targetBlank: false, children: [] },
    { id: -2, label: "پرفروش‌ترین‌ها", href: "/shop?sort=best", targetBlank: false, children: [] },
    { id: -3, label: "جدیدترین‌ها", href: "/shop?sort=new", targetBlank: false, children: [] },
    { id: -4, label: `مجله ${st.siteName}`, href: "/blog", targetBlank: false, children: [] },
    { id: -5, label: "سفارش ویژه", href: "/customer/supply", targetBlank: false, children: [] },
    ...(mv && !!st.allowSellerSignup ? [{ id: -6, label: "همکاری با بوتیک", href: "/login?seller=1", targetBlank: false, children: [] }] : []),
  ];
  const galleryItem: PublicMenuItem = { id: -99, label: "گالری محصولات", href: "/gallery", targetBlank: false, children: [] };
  const hasGallery = (items: PublicMenuItem[]): boolean => items.some(item => item.href === "/gallery" || hasGallery(item.children));
  const withGallery = (items: PublicMenuItem[]) => hasGallery(items) ? items : [...items, galleryItem];
  const headerItems = headerMenu?.items?.length ? withGallery(headerMenu.items) : [];
  const mobileItems = mobileMenu?.items?.length ? withGallery(mobileMenu.items) : [];
  fallbackMenu.splice(minimal ? 2 : 3, 0, galleryItem);
  return (
    <>
      {!minimal && <div className="boutique-announcement hidden bg-emerald-950 text-[11px] text-emerald-100 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-lime-300" />بوتیک زنانه · انتخابی به سبک شما</span>
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 shrink-0 text-lime-300" />هزینهٔ ارسال پیش از ثبت سفارش مشخص می‌شود</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-lime-300" />{st.returnDays.toLocaleString("fa-IR")} روز مهلت بازگشت طبق شرایط فروشگاه</span>
          </div>
          <Link href="/contact" className="flex items-center gap-1.5"><Headphones className="h-3.5 w-3.5 text-lime-300" />{st.supportPhone ? <>پشتیبانی <b dir="ltr">{st.supportPhone}</b> · </> : "بوتیک مه لقا · "}{st.supportHours}</Link>
        </div>
      </div>}
      {fest && !minimal && (
        <Link href="/shop?fest=1" className="block text-white" style={{ background: `linear-gradient(90deg, ${fest.color}, #0f172a)` }}>
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-xs sm:text-sm">
            <Flame className="h-4 w-4 animate-pulse" /><b>{fest.title}</b><span className="hidden sm:inline">تا {fest.discountPercent.toLocaleString("fa-IR")}٪ تخفیف</span>
            <span className="rounded bg-white/20 px-2 py-0.5">پایان: <Countdown to={fest.endsAt.toISOString()} compact /></span>
          </div>
        </Link>
      )}
      <header className="boutique-header sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <SiteBrand name={st.siteName} logoMediaId={Number(st.siteLogoMediaId)} />
            <span className="hidden leading-tight sm:block"><b className="block text-xl font-semibold text-slate-900">{st.siteName}</b>{!minimal && <span className="text-[10px] text-slate-500">{st.siteTagline}</span>}</span>
          </Link>
          <div className={minimal ? "hidden flex-1 items-center lg:flex" : "hidden flex-1 md:block"}>{minimal ? <SiteNavMenus mode="desktopOnly" headerItems={headerItems} mobileItems={mobileItems} fallbackItems={headerMenu?.enabled === false ? [] : fallbackMenu} /> : <LiveSearch popular={popular} />}</div>
          <nav className="mr-auto flex items-center gap-1 md:mr-0">
            <ThemeToggle />
            <SiteNavMenus mode="mobileOnly" headerItems={headerItems} mobileItems={mobileItems} fallbackItems={mobileMenu?.enabled === false ? [] : fallbackMenu} showMobile={mobileMenu?.enabled !== false}/>
            {!minimal && <Link href="/clearance" className="hidden items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 sm:flex"><span>✦</span>حراج ویژه</Link>}
            {!minimal && <Link href={u ? "/customer/tracking" : "/login"} className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 lg:flex"><Truck className="h-5 w-5" />پیگیری سفارش</Link>}
            <Link href="/cart" className="relative rounded-xl p-2.5 text-slate-700 hover:bg-slate-100" aria-label="سبد خرید"><ShoppingCart className="h-6 w-6" /><CartCount /></Link>
            <Link href={panel} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50">
              {u ? (u.avatarMediaId ? <img src={`/api/media/${u.avatarMediaId}`} alt="" className="h-6 w-6 rounded-full object-cover"  loading="lazy" decoding="async"/> : <LayoutDashboard className="h-5 w-5 text-emerald-600" />) : <User className="h-5 w-5" />}<span className="hidden sm:inline">{u ? u.name.split(" ")[0] : "ورود | ثبت‌نام"}</span>
            </Link>
          </nav>
        </div>
        <div className="px-4 pb-3 md:hidden"><LiveSearch compact popular={popular} /></div>
        <div className={minimal ? "hidden" : "hidden border-t border-slate-100 md:block"}>
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 text-sm">
            <div className="group relative">
              <button className="flex items-center gap-2 py-3 pl-4 font-bold text-slate-800"><Menu className="h-4 w-4" />دسته‌بندی پوشاک<ChevronDown className="h-4 w-4 transition group-hover:rotate-180" /></button>
              <div className="invisible absolute right-0 top-full z-50 w-[640px] translate-y-2 rounded-2xl border border-slate-200 bg-white p-4 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-3 gap-2">
                  {roots.map((c) => (
                    <div key={c.id} className="rounded-xl p-2 hover:bg-slate-50">
                      <Link href={`/shop?cat=${c.id}`} className="font-bold text-slate-800 hover:text-emerald-700">{c.name} <span className="text-xs font-normal text-slate-400">({c.n.toLocaleString("fa-IR")})</span></Link>
                      <div className="mt-1 space-y-0.5">{cats.filter((x) => x.parent_id === c.id).map((x) => <Link key={x.id} href={`/shop?cat=${x.id}`} className="block text-xs text-slate-500 hover:text-emerald-700">{x.name}</Link>)}</div>
                    </div>
                  ))}
                </div>
                <Link href="/categories" className="mt-3 block rounded-xl bg-emerald-50 py-2 text-center text-sm font-bold text-emerald-700">مشاهده همه دسته‌بندی‌ها</Link>
              </div>
            </div>
            <span className="h-5 w-px bg-slate-200" />
            <SiteNavMenus mode="desktopOnly" headerItems={headerItems} mobileItems={mobileItems} fallbackItems={headerMenu?.enabled === false ? [] : fallbackMenu}/>
            <Link href="/contact" className="mr-auto flex items-center gap-1 py-3 text-xs text-slate-500"><Headphones className="h-4 w-4" />{st.supportPhone ? <>پشتیبانی <span dir="ltr">{st.supportPhone}</span></> : "تماس با بوتیک"}</Link>
          </div>
        </div>
      </header>
      <PwaInstallButton />
    </>
  );
}
