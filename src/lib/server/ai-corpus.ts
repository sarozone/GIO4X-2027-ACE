/**
 * What GIO4X AI may read: short passages of pages this site has published,
 * built from the same typed data the pages themselves render from. Nothing
 * else is ever put in front of the model, so it cannot be asked about a page
 * that does not exist, and it has no source for a fact the site has not
 * published (docs/WAITING-FOR-ABE.md): where the site says "not yet
 * published", the passage says so too.
 *
 * Built once per server instance, on the first question, and kept in memory.
 * It is public text: nothing here is personal and nothing is a secret.
 * To add a kind of page, add a block below; the order does not matter.
 */
import "server-only";
import { disclosures } from "@/components/trust/disclosures";
import { lessons } from "@/data/academy";
import { accountRows, accounts, restrictedJurisdictions } from "@/data/accounts";
import { faqs } from "@/data/faqs";
import { glossary } from "@/data/glossary";
import { GUIDES } from "@/data/guides";
import { instrumentHref, instruments } from "@/data/instruments";
import { legalDocs, type LegalBlock } from "@/data/legal-docs";
import { gioFacts, type Fact } from "@/data/platforms";
import { tools } from "@/data/tools";
import { accountCharacter, accountEligibility, costConcepts, fundingConfirmed, fundingCurrencies, fundingExplainers, fundingPending } from "@/data/trading";
import { AI_LIMITS, prepareCorpus, type Corpus, type Passage } from "@/lib/ai";
import { buildSearchIndex } from "@/lib/search-index";
import { aiBlogPassages } from "@/lib/server/ai-blog";
import { BLOG_REVALIDATE } from "@/lib/server/blog";

/** A passage is cut at a sentence or a word, never mid-word. */
const CHUNK = 800;

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "‹")
    .replace(/&gt;/g, "›")
    .replace(/&quot;/g, "“")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/\s+/g, " ")
    .trim();

/** Paragraphs gathered into pieces of about CHUNK characters. */
function chunks(paragraphs: string[], most: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const p of paragraphs) {
    if (!p) continue;
    if (cur && cur.length + p.length + 1 > CHUNK) {
      out.push(cur);
      cur = "";
    }
    cur = cur ? `${cur} ${p}` : p;
  }
  if (cur) out.push(cur);
  return out.slice(0, most);
}

const fact = (f: Fact) => (f.status === "verified" ? `${f.value} (source: ${f.source.label})` : `not yet published by GIO4X${f.note ? ` (${f.note})` : ""}`);

function legalText(block: LegalBlock): string {
  switch (block.kind) {
    case "p":
      return block.text;
    case "list":
      return block.items.join("; ");
    case "table":
      return `${block.caption}: ${block.rows.map((r) => r.join(", ")).join("; ")}`;
    case "jurisdictions":
      return `Restricted jurisdictions: ${restrictedJurisdictions.join(", ")}.`;
    case "editor":
      return `Editor’s note (not part of the legal text): ${block.text}`;
    case "link":
      return "";
  }
}

function build(): Passage[] {
  const out: Passage[] = [];

  for (const g of glossary) {
    out.push({ title: g.term, url: `/glossary/${g.slug}`, text: [g.definition, g.formula ? `Formula: ${g.formula}` : "", g.example ? `Example: ${g.example}` : ""].filter(Boolean).join(" "), keys: [g.slug.replace(/-/g, " "), ...(g.aliases ?? [])] });
  }

  for (const l of lessons) {
    // one passage per stretch of the lesson, the description leading the first
    const paragraphs = l.body.split(/<\/(?:p|li|h2|h3|h4|blockquote|tr)>/i).map(plain);
    chunks([l.description, ...paragraphs], 12).forEach((text) => out.push({ title: `Academy: ${l.title}`, url: `/academy/${l.slug}`, text, keys: l.tags.map((t) => t.toLowerCase()), weight: 0.9 }));
  }

  for (const t of tools) {
    out.push({ title: `${t.name}${t.kind === "Calculator" ? " calculator" : ""}`, url: `/tools/${t.slug}`, text: `${t.description} Formula: ${t.formula}`, keys: [...t.aliases, t.kind.toLowerCase(), "calculator", "tool"] });
  }

  for (const f of faqs) {
    out.push({ title: "Frequently asked questions", url: "/faq", text: `Q: ${f.q} A: ${f.a}${f.kind === "open" ? " (GIO4X has not yet published this.)" : ""}`, keys: [f.cat.replace(/-/g, " ")] });
  }

  for (const i of instruments) {
    out.push({
      title: `${i.symbol} (${i.name})`,
      url: instrumentHref(i),
      text: `${i.about} Contract: ${i.contract}. Indicative conditions, as previously published and not a quote: spread from ${i.conditions.spreadFrom}, leverage ${i.conditions.leverage}, minimum size ${i.conditions.minLot} lots.`,
      keys: [i.name.toLowerCase(), i.code.toLowerCase(), ...i.aliases],
    });
  }

  for (const a of accounts) {
    const rows = accountRows.map((r) => `${r.label}: ${String(a[r.key])}`).join("; ");
    const c = accountCharacter[a.key];
    out.push({ title: `Account types: ${a.name}`, url: "/trading/accounts", text: `The ${a.name} account. ${a.line} ${rows}. Pricing: ${c.pricing}. ${c.pay} ${c.consider} ${accountEligibility}`, keys: [a.key, "account", "accounts", "minimum deposit", "stop out", "margin call"], weight: 1.15 });
  }
  out.push({ title: "Account types: restricted jurisdictions", url: "/trading/accounts", text: `GIO4X’s services are not available to residents of these jurisdictions: ${restrictedJurisdictions.join(", ")}.`, keys: ["restricted", "countries", "country", "residents", "jurisdiction", "eligible", "accepted", "available"], weight: 1.1 });

  for (const c of costConcepts) {
    out.push({ title: `Trading conditions: ${c.name}`, url: "/trading/conditions", text: c.plain, keys: [c.key, "cost", "costs"] });
  }

  out.push({ title: "Funding and withdrawals: accepted currencies", url: "/trading/funding", text: `Accepted funding currencies: ${fundingCurrencies.join(", ")}.`, keys: ["deposit", "withdrawal", "currency", "currencies", "funding"] });
  for (const f of [...fundingConfirmed, ...fundingExplainers]) {
    out.push({ title: `Funding and withdrawals: ${f.title}`, url: "/trading/funding", text: f.body, keys: ["deposit", "withdrawal", "funding", "payment"] });
  }
  out.push({
    title: "Funding and withdrawals: not yet published",
    url: "/trading/funding",
    text: `GIO4X has not yet published the following; each is confirmed in the client area. ${fundingPending.map((p) => `${p.label}: ${p.why}`).join(" ")}`,
    keys: ["deposit", "withdrawal", "funding", "payment", "methods", "fees", "fee", "processing", "time", "minimum", "maximum"],
    weight: 1.1,
  });

  for (const f of gioFacts) {
    out.push({ title: `Platforms: ${f.label}`, url: "/platforms", text: `${f.about} 777 Raptor: ${fact(f.raptor)}. MetaTrader 5: ${fact(f.mt5)}.`, keys: ["platform", "platforms", "raptor", "mt5", "metatrader", f.key] });
  }

  for (const d of legalDocs) {
    for (const s of d.sections) {
      chunks(s.body.map(legalText), 3).forEach((text) => out.push({ title: `${d.short}: ${s.title}`, url: `${d.path}#${s.id}`, text, keys: [...d.keywords, d.short.toLowerCase()], weight: 0.9 }));
    }
    out.push({ title: d.title, url: d.path, text: [d.summary, d.opening ?? "", `Version ${d.version}, ${d.updated}.`, d.origin === "carried-over" ? "This document is carried over from the previous GIO4X website and is under legal review." : ""].filter(Boolean).join(" "), keys: [...d.keywords, d.short.toLowerCase()] });
  }

  for (const g of GUIDES) {
    out.push({ title: g.title, url: `/guides/${g.slug}`, text: `${g.description} ${g.lead} Q: ${g.faq.q} A: ${g.faq.a}`, keys: [g.name.toLowerCase(), ...g.also.map((a) => a.toLowerCase()), "market hours"], weight: 0.9 });
  }

  // the disclosure ledger: what is published and, as importantly, what is not
  for (const d of disclosures) {
    out.push({ title: `What we disclose: ${d.item}`, url: "/trust/transparency", text: d.status === "published" ? `${d.item}: published on the ${d.where} page. ${d.note}` : `${d.item}: NOT YET PUBLISHED by GIO4X on this website. ${d.note}`, keys: [d.group.toLowerCase(), "published", "disclose", "disclosure"], weight: d.status === "pending" ? 1.15 : 1 });
  }

  // a person is always reachable: the two routes every "I do not know" points to
  out.push({ title: "Contact", url: "/contact", text: "The contact page: write to a person at GIO4X about a general question, an account, a platform, a partnership, the press, security, privacy or a complaint. Questions are routed by topic.", keys: ["contact", "email", "person", "human", "speak", "talk", "complaint"] });
  out.push({ title: "Support", url: "/support", text: "The support page: open a support request and you are shown a reference. The reply is read on the same page with that reference and your email address.", keys: ["support", "help", "ticket", "request", "problem"] });

  // every other page the site's own search knows, by its one-line description
  const covered = new Set(out.map((p) => p.url.split("#", 1)[0]));
  for (const e of buildSearchIndex()) {
    if (!e.d || covered.has(e.h) || e.h.startsWith("/control") || e.h.startsWith("/portal")) continue;
    out.push({ title: e.t, url: e.h, text: e.d, keys: e.k, weight: 0.8 });
  }

  return out;
}

let corpus: Corpus | null = null;

/** The whole corpus, tokenised: built on first use and kept for the life of the server instance. */
export function aiCorpus(): Corpus {
  corpus ??= prepareCorpus(build());
  return corpus;
}

/* ---- with the blog ------------------------------------------------------------ */

/** The corpus with the blog's passages added, and what those passages were, so that it is tokenised again only when they change. */
let live: { corpus: Corpus; mark: string } | null = null;
let asked = 0;
let reading: Promise<void> | null = null;

/**
 * The corpus a question is answered from: the site's own pages and, when the
 * blog can be read, its published posts (ai-blog.ts).
 *
 * The blog is looked at again at most once every BLOG_REVALIDATE seconds in
 * one server instance, and then through the blog's own cache, never once per
 * question. A question does not wait for it, except the first after a start,
 * and that one for AI_LIMITS.blogWaitMs at most. If the read fails, or there
 * is nothing published, this is aiCorpus(): the assistant as it was before
 * the blog was a source.
 */
export async function aiCorpusLive(): Promise<Corpus> {
  const now = Date.now();
  if (!reading && now - asked >= BLOG_REVALIDATE * 1000) {
    asked = now;
    reading = aiBlogPassages()
      .then((posts) => {
        if (!posts.length) {
          live = null;
          return;
        }
        const mark = posts.map((p) => `${p.url} ${p.text.length} ${p.title}`).join("\n");
        if (live?.mark !== mark) live = { corpus: prepareCorpus([...aiCorpus().passages, ...posts]), mark };
      })
      .catch(() => {
        // could not be read: no post is a source until it can be
        live = null;
      })
      .finally(() => {
        reading = null;
      });
    if (!live) await Promise.race([reading, new Promise((resolve) => setTimeout(resolve, AI_LIMITS.blogWaitMs))]);
  }
  return live?.corpus ?? aiCorpus();
}
