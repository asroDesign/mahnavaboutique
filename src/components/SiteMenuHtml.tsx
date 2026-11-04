/** HTML is sanitized on write. Preserve its tags, links and individual images as authored. */
function lazyLoadHtmlImages(html: string) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const cleaned = tag.replace(/\s+(?:loading|decoding)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    const ending = cleaned.endsWith("/>") ? "/>" : ">";
    return `${cleaned.slice(0, -ending.length)} loading="lazy" decoding="async"${ending}`;
  });
}

export function SiteMenuHtml({ html, label, className = "" }: { html: string; label: string; className?: string }) {
  return <div aria-label={label || undefined} className={`min-w-0 max-w-full [&_img]:max-w-full [&_img]:object-contain ${className}`} dangerouslySetInnerHTML={{ __html: lazyLoadHtmlImages(html) }} />;
}
