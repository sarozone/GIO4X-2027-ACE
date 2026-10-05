import { FooterMotto } from "@/components/play/Guided";
import Link from "next/link";
import { nav, secondaryNav } from "@/config/nav";
import { site } from "@/config/site";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { SocialLinks, socialEntries, socialSlots } from "@/components/shell/SocialLinks";
import { companyLine, riskWarning } from "@/config/legal";
import { restrictedJurisdictions } from "@/data/accounts";
import { Logo } from "@/components/brand/Logo";
import { Rosette } from "@/components/brand/Rosette";
import { Backdrop } from "@/components/figures/Backdrop";


/**
 * The final chapter. Always set on the "night" surface, in both themes, so the
 * page closes the same way a printed publication does: on its colophon.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const social = socialSlots();
  const linked = socialEntries().length;
  // The directory is the navigation's own groups, laid out as twelve blocks of a similar
  // length (two rows of six on a wide screen). Nothing is listed here by hand, so a page
  // cannot appear twice or be forgotten: it is in the footer because it is in config/nav.ts.
  const group = (key: string, ...titles: string[]) => {
    const section = nav.find((s) => s.key === key);
    return titles.flatMap((t) => section?.groups.find((g) => g.title === t)?.items ?? []);
  };
  const columns = [
    { title: "Markets", items: group("markets", "Asset classes") },
    { title: "Market Command", items: group("markets", "Market Command", "What moves them") },
    { title: "Trading", items: group("trading", "Accounts", "Ways to participate") },
    { title: "Trader’s desk", items: group("trading", "Trader Toolkit", "Plan and review") },
    { title: "Platforms", items: group("platforms", "777 Raptor", "MetaTrader 5", "Choose and build") },
    { title: "Intelligence", items: group("intelligence", "Read", "Labs: see") },
    { title: "Labs", items: group("intelligence", "Labs: machines", "Labs: practise") },
    { title: "Academy", items: group("academy", "Start here") },
    { title: "Go deeper", items: group("academy", "Go deeper") },
    { title: "Look it up", items: group("academy", "Look it up") },
    { title: "See it, play it", items: group("academy", "See it, play it") },
    { title: "Company", items: group("company", "GIO4X", "Trust") },
  ];
  // A block named for a section links its name to the section's own page, unless a row beneath it already does
  // (config/nav.ts does not list a section's page as a row).
  const sectionHref = (c: (typeof columns)[number]) => {
    const href = nav.find((s) => s.label === c.title)?.href;
    return href && !c.items.some((i) => i.href === href) ? href : undefined;
  };
  // a page already in the directory above is not repeated in the lists beneath it
  const listed = new Set(columns.flatMap((c) => c.items.map((i) => i.href)));
  const secondary = secondaryNav.map((g) => ({ ...g, items: g.items.filter((i) => !listed.has(i.href)) }));

  return (
    <footer data-site-footer className="on-night relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-[8%] -top-[18%] text-on-night opacity-[0.09]">
        <Rosette size={610} strokeWidth={1} bare />
      </div>
      <hr className="dna-rule" />

      {/* brand statement */}
      <div className="wrap relative grid gap-34 py-55 lg:grid-cols-phi lg:items-end lg:py-89">
        <Backdrop variant="lattice" />
        <div>
          <p className="eyebrow">{site.tagline}</p>
          <p className="h2 mt-21 max-w-[18ch] text-on-night">Global markets. Gentlemanly standards.</p>
        </div>
        <div className="flex flex-wrap gap-13 lg:justify-end">
          <Link href="/open-account" className="btn btn-primary btn-lg">
            Open an account
          </Link>
          <Link href="/contact" className="btn btn-ghost btn-lg">
            Talk to us
          </Link>
        </div>
      </div>

      {/* directory */}
      <nav aria-label="Footer" className="wrap relative grid grid-cols-2 gap-x-21 gap-y-34 border-t border-night-line py-55 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {columns.map((c) => (
          <div key={c.title}>
            <p className="label !text-accent">
              {sectionHref(c) ? (
                <Link href={sectionHref(c)!} className="underline-offset-4 hover:underline">
                  {c.title}
                </Link>
              ) : (
                c.title
              )}
            </p>
            <ul className="mt-13 grid gap-[0.4rem]">
              {c.items.map((i) => (
                <li key={`${c.title}-${i.href}`}>
                  <Link href={i.href} className="link-quiet text-sm">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* support, legal, contact */}
      <div className="wrap relative grid gap-34 border-t border-night-line py-55 lg:grid-cols-phi">
        <div className="grid grid-cols-2 gap-x-21 gap-y-34 md:grid-cols-3">
          {secondary.map((g) => (
            <div key={g.title}>
              <p className="label !text-accent">{g.title}</p>
              <ul className="mt-13 grid gap-[0.4rem]">
                {g.items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="link-quiet text-sm">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <address className="grid gap-21 text-sm not-italic text-on-night-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <p className="label">Head office</p>
            <p className="mt-13 leading-relaxed">
              {site.legalName}
              <br />
              {site.headOffice.lines.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
              {site.headOffice.country}
            </p>
          </div>
          <div>
            <p className="label">Support office</p>
            <p className="mt-13 leading-relaxed">
              {site.supportOffice.lines.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
              {site.supportOffice.country}
            </p>
            <p className="mt-13">
              <a href={`mailto:${site.email}`} className="link text-on-night">
                {site.email}
              </a>
            </p>
          </div>
        </address>
      </div>

      {social.length > 0 && (
        <div className="wrap relative flex flex-wrap items-center gap-x-21 gap-y-8 border-t border-night-line py-21">
          <p className="label">{linked ? "Official channels" : "Social channels: links to follow"}</p>
          <SocialLinks names />
          <Link href="/trust/verify" className="link-quiet ml-auto text-xs">
            Verify a GIO4X link
          </Link>
        </div>
      )}

      {/* languages: each leads to the pages that exist in it (docs/I18N.md) */}
      <div className="wrap relative border-t border-night-line py-21">
        <LanguageSwitcher variant="list" />
      </div>

      {/* risk: readable by design, never fine print. It runs the full width of the page column, like the links above it. */}
      <div className="wrap relative border-t border-night-line py-34">
        <p className="label">Risk warning</p>
        <p className="mt-13 text-sm leading-relaxed text-on-night-2">
          {riskWarning}{" "}
          <Link href="/legal/risk" className="link text-on-night">
            Read the full Risk Disclosure
          </Link>
          .
        </p>
        <p className="mt-13 text-sm leading-relaxed text-on-night-2">{companyLine}</p>
        <details className="mt-13 text-sm text-on-night-2">
          <summary className="link-quiet inline-flex cursor-pointer items-center gap-8 font-medium text-on-night">
            <span aria-hidden className="text-prestige">+</span> Jurisdictions where services are not available
          </summary>
          <p className="mt-8 leading-relaxed">Services are not available to residents of: {restrictedJurisdictions.join(", ")}.</p>
        </details>
      </div>

      {/* colophon: from `md`, where it is one row, `gx-colophon` keeps its right-hand end clear of the Help button and the scroll arrows (fx.css) */}
      <div className="wrap gx-colophon relative flex flex-col gap-21 border-t border-night-line py-34 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-21">
          <Logo height={40} />
          <p className="text-xs text-on-night-2">
            © {year} {site.legalName}. All rights reserved.
          </p>
        </div>
        <a
          href={site.technologyPartner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-13 self-start rounded-sm md:self-auto"
          aria-label="Website and trading technology provided by 777 Raptor (opens 777raptor.com in a new tab)"
        >
          <span className="text-right text-xs leading-snug text-on-night-2 transition-colors duration-fast group-hover:text-on-night">
            Website and trading
            <span className="block">technology provided by:</span>
          </span>
          <picture>
            <source srcSet="/brand/777-raptor-logo.webp" type="image/webp" />
            <img
              src={site.technologyPartner.logo}
              alt="777 Raptor"
              width={site.technologyPartner.logoWidth}
              height={site.technologyPartner.logoHeight}
              loading="lazy"
              decoding="async"
              className="h-[3.4375rem] w-auto opacity-80 transition-opacity duration-fast group-hover:opacity-100"
            />
          </picture>
        </a>
      </div>
      <FooterMotto />
    </footer>
  );
}
