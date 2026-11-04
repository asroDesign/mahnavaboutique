"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw, Save } from "lucide-react";
import { api, toast } from "./client";

type Mode = "light" | "dark" | "system";
type ColorKey = "homeThemeColor" | "pagesThemeColor" | "adminThemeColor";
type ThemeColors = Record<ColorKey, string>;

const DEFAULT_COLORS: ThemeColors = {
  homeThemeColor: "#BD3979",
  pagesThemeColor: "#703C4B",
  adminThemeColor: "#526174",
};
const COLOR_OPTIONS: { key: ColorKey; title: string; description: string }[] = [
  { key: "homeThemeColor", title: "صفحهٔ اصلی", description: "دسته‌بندی‌ها، سکشن‌ها و دکمه‌های صفحهٔ اول" },
  { key: "pagesThemeColor", title: "صفحات فروشگاه", description: "فروشگاه، جزئیات محصول، سبد خرید و صفحات عمومی" },
  { key: "adminThemeColor", title: "صفحات پنل", description: "پنل مدیریت، فروشنده و حساب کاربری" },
];

function normalizeMode(value: string): Mode {
  return value === "dark" || value === "system" ? value : "light";
}

function normalizeColor(value: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : fallback;
}

function textColor(color: string) {
  const channels = color.slice(1).match(/.{2}/g)?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0];
  const luminance = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.179 ? "#251D21" : "#FFFFFF";
}

export function AppearanceSettings({
  initialMode,
  initialHomeColor,
  initialPagesColor,
  initialAdminColor,
}: {
  initialMode: string;
  initialHomeColor: string;
  initialPagesColor: string;
  initialAdminColor: string;
}) {
  const router = useRouter();
  const initialColors: ThemeColors = {
    homeThemeColor: normalizeColor(initialHomeColor, DEFAULT_COLORS.homeThemeColor),
    pagesThemeColor: normalizeColor(initialPagesColor, DEFAULT_COLORS.pagesThemeColor),
    adminThemeColor: normalizeColor(initialAdminColor, DEFAULT_COLORS.adminThemeColor),
  };
  const [savedMode, setSavedMode] = useState<Mode>(normalizeMode(initialMode));
  const [draftMode, setDraftMode] = useState<Mode>(normalizeMode(initialMode));
  const [savedColors, setSavedColors] = useState<ThemeColors>(initialColors);
  const [draftColors, setDraftColors] = useState<ThemeColors>(initialColors);
  const [busy, setBusy] = useState(false);
  const previewedTheme = useRef<string | null>(null);
  const hasChanges = savedMode !== draftMode || COLOR_OPTIONS.some(({ key }) => savedColors[key] !== draftColors[key]);

  function applyColors(colors: ThemeColors) {
    const root = document.documentElement;
    root.style.setProperty("--theme-home-accent", colors.homeThemeColor);
    root.style.setProperty("--theme-home-on-accent", textColor(colors.homeThemeColor));
    root.style.setProperty("--theme-pages-accent", colors.pagesThemeColor);
    root.style.setProperty("--theme-pages-on-accent", textColor(colors.pagesThemeColor));
    root.style.setProperty("--theme-admin-accent", colors.adminThemeColor);
    root.style.setProperty("--theme-admin-on-accent", textColor(colors.adminThemeColor));
  }

  function applyMode(mode: Mode) {
    const resolved = mode === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : mode;
    document.documentElement.dataset.theme = resolved;
  }

  function preview() {
    if (!previewedTheme.current) previewedTheme.current = document.documentElement.dataset.theme ?? "light";
    applyColors(draftColors);
    applyMode(draftMode);
    toast("پیش‌نمایش روی همین مرورگر اعمال شد؛ هنوز ذخیره نشده است.");
  }

  function revertPreview() {
    applyColors(savedColors);
    if (previewedTheme.current) document.documentElement.dataset.theme = previewedTheme.current;
    else applyMode(savedMode);
    previewedTheme.current = null;
    setDraftMode(savedMode);
    setDraftColors(savedColors);
  }

  async function save() {
    setBusy(true);
    try {
      await api("/api/admin/settings", "POST", { appearanceMode: draftMode, ...draftColors });
      setSavedMode(draftMode);
      setSavedColors(draftColors);
      document.documentElement.dataset.defaultTheme = draftMode;
      applyColors(draftColors);
      applyMode(draftMode);
      try { localStorage.removeItem("organo-color-mode"); } catch { /* The saved server preference applies on the next visit. */ }
      previewedTheme.current = null;
      toast("رنگ هر بخش جداگانه ذخیره شد");
      router.refresh();
    } catch (error) {
      toast((error as Error).message, false);
    } finally {
      setBusy(false);
    }
  }

  function resetDraft() {
    setDraftMode("light");
    setDraftColors(DEFAULT_COLORS);
  }

  return <div className="space-y-6">
    <label className="block max-w-xl text-sm font-bold">حالت پیش‌فرض
      <select className="input mt-2" value={draftMode} onChange={(event) => setDraftMode(normalizeMode(event.target.value))}>
        <option value="light">روشن</option><option value="dark">تیره</option><option value="system">مطابق تنظیم دستگاه</option>
      </select>
      <small className="mt-1 block font-normal leading-6 text-slate-500">بازدیدکننده می‌تواند حالت روشن یا تیره را برای دستگاه خودش انتخاب کند.</small>
    </label>

    <div className="grid gap-3 lg:grid-cols-3">
      {COLOR_OPTIONS.map(({ key, title, description }) => <label key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
        <span className="block font-bold">رنگ {title}</span>
        <span className="mt-1 block min-h-10 text-xs leading-5 text-slate-500">{description}</span>
        <span className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <input aria-label={`انتخاب رنگ ${title}`} type="color" value={draftColors[key]} onChange={(event) => setDraftColors((current) => ({ ...current, [key]: event.target.value.toUpperCase() }))} className="h-11 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
          <span className="min-w-0 flex-1">
            <b className="block text-sm">{draftColors[key]}</b>
            <small className="text-xs text-slate-500">نمونهٔ رنگ اصلی</small>
          </span>
          <i aria-hidden="true" className="grid size-10 place-items-center rounded-xl text-sm font-bold shadow-sm" style={{ backgroundColor: draftColors[key], color: textColor(draftColors[key]) }}>Aa</i>
        </span>
      </label>)}
    </div>

    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
      <button type="button" onClick={preview} className="btn-primary"><Eye className="size-4"/>پیش‌نمایش</button>
      <button type="button" onClick={revertPreview} className="btn-sm"><RotateCcw className="size-4"/>لغو پیش‌نمایش</button>
      <button type="button" onClick={resetDraft} className="btn-sm"><RotateCcw className="size-4"/>بازگشت به رنگ‌های اولیه</button>
      <button type="button" disabled={busy || !hasChanges} onClick={save} className="btn-success disabled:cursor-not-allowed"><Save className="size-4"/>{busy ? "در حال ذخیره…" : "ذخیره تنظیمات"}</button>
    </div>
    <p className="rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-600">رنگ‌ها برای صفحهٔ اصلی، سایر صفحات فروشگاه و پنل‌ها مستقل هستند. پیش‌نمایش تا زمان ذخیره فقط در همین مرورگر دیده می‌شود.</p>
  </div>;
}
