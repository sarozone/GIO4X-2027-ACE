#!/usr/bin/env node
/**
 * GIO4X editorial fixes: corrections to carried-over article and lesson text.
 *
 *   node scripts/apply-editorial-fixes.mjs            apply (safe to run again)
 *   node scripts/apply-editorial-fixes.mjs --check    verify only, write nothing
 *
 * Why this exists. The bodies of GIO4X Intelligence articles and Academy
 * lessons live in src/data/generated/{articles,academy}.json, which
 * scripts/import-content.mjs rewrites from the extracts of the previous site.
 * A correction typed into that JSON by hand would be lost on the next import.
 * So corrections are kept as data, in scripts/editorial-fixes.json, and this
 * script applies them:
 *
 *   - import-content.mjs calls applyEditorialFixes() as its last step, so a
 *     re-import ends with the corrected text;
 *   - it can also be run on its own, on the JSON as it stands.
 *
 * What a fix may do to an item (an article or a lesson, by slug):
 *
 *   replace      [{ find, with, kind }]   an exact passage of the body is replaced
 *   headings     { id: { was, now } }     the words of an h2 change; its id never does
 *   append       "<p>…</p>"               a paragraph added at the end of the body
 *   briefAppend  "…"                      one more key point (articles only, five at most)
 *   note         "…"                      the dated correction note, printed as the
 *                                         last paragraph of the piece
 *
 * The rule it keeps: nothing is changed silently. Every changed item gets the
 * revision date as `updated` and a visible, dated note at the foot of its
 * body, and every replacement is listed in docs/CONTENT-AUDIT.md between the
 * two `editorial-fixes` markers (that section is regenerated on each run,
 * because the import rewrites the rest of the document).
 *
 * It is strict. A `find` that is no longer in the text, and whose replacement
 * is not there either, stops the run before anything is written: the source
 * has drifted and the fix needs a human. Heading ids, slugs, titles and URLs
 * cannot change. The body keeps the importer's allow-list of tags, plus one
 * addition used only here: a link to a page of this site, <a href="/…">.
 *
 * Plain Node ESM, no dependencies, deterministic and idempotent.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXES_FILE = path.join(ROOT, "scripts/editorial-fixes.json");
const ARTICLES_FILE = path.join(ROOT, "src/data/generated/articles.json");
const ACADEMY_FILE = path.join(ROOT, "src/data/generated/academy.json");
const AUDIT_FILE = path.join(ROOT, "docs/CONTENT-AUDIT.md");

const START = "<!-- editorial-fixes:start -->";
const END = "<!-- editorial-fixes:end -->";

const KINDS = {
  ecn: "ECN or execution claim",
  commission: "Commission basis",
  prescription: "Universal prescription",
  effectiveness: "Unsupported effectiveness claim",
  other: "Promise, guarantee or overstatement",
};

/** The importer's allow-list, plus a link to a page of this site. */
const TAG_OK = /^<\/?(?:h2|h3|p|ul|ol|li|strong|em|blockquote|table|thead|tbody|tr|th|td)>$|^<h2 id="[a-z0-9-]+">$|^<div class="note">$|^<\/div>$|^<a href="\/[a-z0-9/#-]*">$|^<\/a>$/;

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const headingIds = (body) => [...body.matchAll(/<h2 id="([^"]+)">/g)].map((m) => m[1]).join(",");
const longDate = (iso) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

/**
 * Apply the fixes of one item. Returns the changed item and what was done;
 * pushes a message to `problems` for anything that cannot be applied.
 */
function fixItem(item, fix, label, date, problems, rows) {
  const before = item.body;
  let body = item.body;
  const noteHtml = `<p><em>Revised ${longDate(date)}. ${fix.note}</em></p>`;

  for (const [id, h] of Object.entries(fix.headings ?? {})) {
    rows.push({ label, kind: h.kind ?? "prescription", was: `Heading: ${h.was}`, now: `Heading: ${h.now} (id unchanged)` });
    const was = `<h2 id="${id}">${h.was}</h2>`;
    const now = `<h2 id="${id}">${h.now}</h2>`;
    if (body.includes(now)) continue;
    if (!body.includes(was)) problems.push(`${label}: heading “${id}” not found with its earlier wording`);
    else body = body.replace(was, now);
  }

  for (const r of fix.replace ?? []) {
    if (!KINDS[r.kind]) problems.push(`${label}: unknown kind “${r.kind}”`);
    rows.push({ label, kind: r.kind, was: plain(r.find), now: plain(r.with) });
    // the replacement is looked for first: an insertion keeps its anchor, so `find` alone cannot tell
    if (body.includes(r.with)) continue;
    const at = body.indexOf(r.find);
    if (at < 0) {
      problems.push(`${label}: passage not found: “${plain(r.find).slice(0, 90)}…”`);
      continue;
    }
    if (body.indexOf(r.find, at + 1) >= 0) problems.push(`${label}: passage occurs more than once: “${plain(r.find).slice(0, 90)}…”`);
    body = body.slice(0, at) + r.with + body.slice(at + r.find.length);
  }

  if (fix.append) {
    rows.push({ label, kind: fix.appendKind ?? "prescription", was: "(nothing: paragraph added at the end)", now: plain(fix.append) });
    if (!body.includes(fix.append)) body = `${body}\n${fix.append}`;
  }

  if (!fix.note) problems.push(`${label}: a fix needs a correction note`);
  else if (!body.includes(noteHtml)) body = `${body}\n${noteHtml}`;

  const next = { ...item, body };
  if (fix.briefAppend) {
    rows.push({ label, kind: fix.briefKind ?? "ecn", was: "(nothing: key point added)", now: fix.briefAppend });
    if (!Array.isArray(item.brief)) problems.push(`${label}: has no brief to add to`);
    else if (!item.brief.includes(fix.briefAppend)) {
      if (item.brief.length >= 5) problems.push(`${label}: the brief already has five points`);
      next.brief = [...item.brief, fix.briefAppend];
    }
  }

  // nothing structural may move
  if (headingIds(before) !== headingIds(body)) problems.push(`${label}: heading ids changed`);
  for (const m of body.matchAll(/<[^>]*>/g)) if (!TAG_OK.test(m[0])) problems.push(`${label}: tag not allowed: ${m[0]}`);
  const opens = (body.match(/<a /g) ?? []).length;
  if (opens !== (body.match(/<\/a>/g) ?? []).length) problems.push(`${label}: unbalanced link`);

  // the table of contents repeats the headings: keep its words in step, its ids as they are
  next.toc = item.toc.map((t) => {
    const m = new RegExp(`<h2 id="${t.id}">([\\s\\S]*?)</h2>`).exec(body);
    return m ? { ...t, text: plain(m[1]) } : t;
  });

  // reading time, counted as the importer counts it (220 words a minute, tags as gaps)
  if (typeof item.readMinutes === "number") {
    const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    next.readMinutes = Math.max(1, Math.ceil(words / 220));
  }

  const changed = body !== before || next.brief !== item.brief;
  // an item already carrying the fix keeps the date it was given
  if (changed || item.updated !== date) next.updated = date;
  return { next, changed: changed || item.updated !== date };
}

function auditSection(fixes, rows) {
  const items = [...new Set(rows.map((r) => r.label))];
  const md = [];
  md.push(START);
  md.push(`## Editorial fixes, ${longDate(fixes.date)}`);
  md.push("");
  md.push("Generated by `scripts/apply-editorial-fixes.mjs` from `scripts/editorial-fixes.json`. Do not edit by hand: change the JSON and run the script again. `scripts/import-content.mjs` runs it as its last step, so these corrections survive a re-import.");
  md.push("");
  md.push("A second pass over the published articles and lessons, against the editorial standards (`/trust/editorial-standards`). Text that went further than the standards allow was qualified, not removed:");
  md.push("");
  md.push("- **ECN or execution claims**: rewritten as a description of what the term means in the industry, separated from GIO4X, whose execution policy is not yet published.");
  md.push("- **Commission basis**: wherever a per-lot commission enters a cost comparison, the text now says that the basis (per side or per round trip) is not yet published and that a total cannot be computed until it is.");
  md.push("- **Universal prescriptions** (“never risk more than 1 to 2 per cent”, “always at least 1:2”, “correlation above 70%”): kept as explanation, reframed as conventions and examples, with what each does and does not protect against, and links to the tools that show the arithmetic.");
  md.push("- **Unsupported effectiveness claims** (a level, pattern or indicator “works”, is “reliable”, “confirms”, “predicts”): the description stays; the claim is attributed to the people who hold it, and the piece says that evidence for predictive value is weak or disputed.");
  md.push("- **Promises and overstatements** (“proven”, “locks in profits”, “ensures”): reworded.");
  md.push("");
  md.push(`No URL, slug, title or heading id changed. Each of the ${items.length} items below now shows ${longDate(fixes.date)} as its revision date and carries a dated correction note as the last paragraph of its body. Links to pages of this site (\`<a href="/…">\`) were added to the allow-list for these corrections only.`);
  md.push("");
  for (const label of items) {
    const fix = label.startsWith("intelligence/") ? fixes.articles[label.slice(13)] : fixes.lessons[label.slice(8)];
    md.push(`### ${label}`);
    md.push("");
    md.push(`Correction note: “${fix.note}”`);
    md.push("");
    md.push("| Kind | Was | Now |");
    md.push("| --- | --- | --- |");
    for (const r of rows.filter((x) => x.label === label)) md.push(`| ${cell(KINDS[r.kind] ?? r.kind)} | ${cell(r.was)} | ${cell(r.now)} |`);
    md.push("");
  }
  if (fixes.companions?.length) {
    md.push("### Companion text kept in step");
    md.push("");
    md.push("Story-mode quotations repeat a lesson sentence word for word, so three were changed by hand to match (they are not generated, so a re-import does not touch them):");
    md.push("");
    for (const c of fixes.companions) md.push(`- \`${c.file}\`, ${c.lesson}: “${c.was}” became “${c.now}”`);
    md.push("");
  }
  if (fixes.ownerQuestions?.length) {
    md.push("### Open for the owner");
    md.push("");
    for (const q of fixes.ownerQuestions) md.push(`- ${q}`);
    md.push("");
  }
  md.push(END);
  return md.join("\n");
}

/**
 * Apply every fix to the generated JSON and refresh the audit section.
 * Returns { ok, changed, problems }. Writes nothing when a fix cannot be applied.
 */
export function applyEditorialFixes({ log = () => {}, check = false } = {}) {
  const fixes = readJson(FIXES_FILE);
  const articles = readJson(ARTICLES_FILE);
  const academy = readJson(ACADEMY_FILE);
  const problems = [];
  const rows = [];
  let changed = 0;

  const run = (list, table, prefix) =>
    list.map((item) => {
      const fix = table[item.slug];
      if (!fix) return item;
      const res = fixItem(item, fix, `${prefix}/${item.slug}`, fixes.date, problems, rows);
      if (res.changed) changed++;
      return res.next;
    });

  for (const slug of Object.keys(fixes.articles)) if (!articles.some((a) => a.slug === slug)) problems.push(`intelligence/${slug}: no such article`);
  for (const slug of Object.keys(fixes.lessons)) if (!academy.lessons.some((l) => l.slug === slug)) problems.push(`academy/${slug}: no such lesson`);

  const nextArticles = run(articles, fixes.articles, "intelligence");
  const nextLessons = run(academy.lessons, fixes.lessons, "academy");

  if (problems.length) {
    log("editorial-fixes: stopped, nothing written. The generated JSON is NOT corrected until these are settled:");
    for (const p of problems) log(`  - ${p}`);
    return { ok: false, changed: 0, problems };
  }

  const section = auditSection(fixes, rows);
  const doc = fs.existsSync(AUDIT_FILE) ? fs.readFileSync(AUDIT_FILE, "utf8") : "";
  const from = doc.indexOf(START);
  const to = doc.indexOf(END);
  const nextDoc = from >= 0 && to > from ? `${doc.slice(0, from)}${section}${doc.slice(to + END.length)}` : `${doc.trimEnd()}\n\n${section}\n`;
  const docChanged = nextDoc !== doc;

  if (check) {
    log(`editorial-fixes: check only. ${changed} item(s) would change; audit section ${docChanged ? "would change" : "is current"}.`);
    return { ok: true, changed, problems };
  }
  if (changed) {
    writeJson(ARTICLES_FILE, nextArticles);
    writeJson(ACADEMY_FILE, { ...academy, lessons: nextLessons });
  }
  if (docChanged) fs.writeFileSync(AUDIT_FILE, nextDoc);
  log(`editorial-fixes: ${rows.length} corrections across ${new Set(rows.map((r) => r.label)).size} items; ${changed} item(s) written, ${changed ? "" : "already current, "}audit section ${docChanged ? "updated" : "current"}.`);
  return { ok: true, changed, problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const res = applyEditorialFixes({ log: (s) => process.stdout.write(`${s}\n`), check: process.argv.includes("--check") });
  if (!res.ok) process.exit(1);
}
