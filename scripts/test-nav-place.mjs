// Unit tests for navPlace / activeSection / sectionCrumb in src/config/nav.ts (which section of the menus a page stands in,
// and which row is the page): the header's active section, the open page's row and the first breadcrumb all come from them.
// Run: node --test scripts/test-nav-place.mjs      (Node 22.18 or later: it reads the TypeScript file directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { activeSection, nav, navPlace, sectionCrumb } from "../src/config/nav.ts";

test("a page is in the section that lists it, whatever its address begins with", () => {
  assert.equal(activeSection("/markets/forex"), "markets");
  assert.equal(activeSection("/guides"), "markets");
  assert.equal(activeSection("/history"), "markets");
  assert.equal(activeSection("/side-by-side"), "trading");
  assert.equal(activeSection("/downloads"), "trading");
  assert.equal(activeSection("/primers"), "academy");
  // listed under Academy although the other tools are Trading's
  assert.equal(activeSection("/tools/spread-visualizer"), "academy");
  assert.equal(activeSection("/tools/margin"), "trading");
  // "/trading-plan" is not a page below "/trading": it is listed in its own right
  assert.equal(navPlace("/trading-plan").href, "/trading-plan");
});

test("a section's own page is in that section, though no row lists it", () => {
  for (const s of nav) assert.equal(activeSection(s.href), s.key);
  assert.deepEqual(navPlace("/markets"), { section: nav[0], href: null, exact: true });
  // where a row does list it, that row is the page
  assert.equal(navPlace("/academy").href, "/academy");
  assert.equal(navPlace("/about").href, "/about");
});

test("a page below a listed page inherits its parent's section, and the parent's row is marked but not as the page", () => {
  assert.equal(activeSection("/history/tulip-mania"), "markets");
  assert.deepEqual(navPlace("/history/tulip-mania"), { section: nav[0], href: "/history", exact: false });
  assert.equal(activeSection("/guides/europe"), "markets");
  assert.equal(activeSection("/side-by-side/market-vs-limit"), "trading");
  assert.equal(activeSection("/intelligence/blog/first-trade-human-history"), "intelligence");
  assert.equal(navPlace("/intelligence/blog/first-trade-human-history").href, "/intelligence/blog");
  assert.equal(activeSection("/markets/forex/eurusd"), "markets");
  assert.equal(navPlace("/markets/forex/eurusd").href, "/markets/forex");
  assert.equal(activeSection("/tools/a-tool-no-row-lists"), "trading");
  assert.equal(activeSection("/trust/ai"), "company");
});

test("a path listed in two sections: the listing with the current hash wins, otherwise the first that lists the bare path", () => {
  assert.equal(activeSection("/labs/rule-bench"), "intelligence");
  assert.deepEqual(navPlace("/labs/rule-bench"), { section: nav[3], href: "/labs/rule-bench", exact: true });
  assert.equal(activeSection("/labs/rule-bench", "#send"), "platforms");
  assert.deepEqual(navPlace("/labs/rule-bench", "#send"), { section: nav[2], href: "/labs/rule-bench#send", exact: true });
  // a hash that no listing has, and an empty one, change nothing
  assert.equal(activeSection("/labs/rule-bench", "#elsewhere"), "intelligence");
  assert.equal(activeSection("/labs/rule-bench", "#"), "intelligence");
  // the same page twice in one section: the row is chosen by the hash
  assert.equal(navPlace("/platforms/metatrader-5").href, "/platforms/metatrader-5");
  assert.equal(navPlace("/platforms/metatrader-5", "#getting-started").href, "/platforms/metatrader-5#getting-started");
});

test("the home page, a translated page and a page listed nowhere are in no section", () => {
  for (const p of ["/", "", null, undefined, "/de", "/de/guide", "/ar/contact", "/open-account", "/faq", "/no-such-page/at-all"]) {
    assert.equal(navPlace(p), null, String(p));
    assert.equal(activeSection(p), null, String(p));
  }
});

test("a trailing slash and a query make no difference", () => {
  assert.equal(activeSection("/history/"), "markets");
  assert.equal(activeSection("/downloads?print=1"), "trading");
});

test("only one section is ever current, and every listed page is in the section that lists it", () => {
  const rows = nav.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => ({ s, i }))));
  for (const { s, i } of rows) {
    const [path, frag] = i.href.split("#");
    const place = navPlace(path, frag ? `#${frag}` : "");
    assert.equal(place.section.key, s.key, i.href);
    assert.equal(place.href, i.href, i.href);
    assert.equal(nav.filter((x) => x.key === activeSection(path, frag ? `#${frag}` : "")).length, 1);
  }
});

test("no row repeats its section's own page, and no address is listed twice", () => {
  const hrefs = nav.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.href)));
  assert.equal(new Set(hrefs).size, hrefs.length);
  // Academy and Company keep a row for their page ("Academy", "About"): it is the only link to it in the footer's blocks of rows
  for (const s of nav) assert.ok(s.groups.flatMap((g) => g.items).filter((i) => i.href === s.href).length <= 1, s.key);
  assert.ok(!hrefs.includes("/markets") && !hrefs.includes("/intelligence"));
});

test("the first breadcrumb is the section that lists the page", () => {
  assert.deepEqual(sectionCrumb("/history"), { name: "Markets", href: "/markets" });
  assert.deepEqual(sectionCrumb("/side-by-side/market-vs-limit"), { name: "Trading", href: "/trading" });
  assert.deepEqual(sectionCrumb("/downloads"), { name: "Trading", href: "/trading" });
  assert.deepEqual(sectionCrumb("/labs/risk-room"), { name: "Intelligence", href: "/intelligence" });
  assert.deepEqual(sectionCrumb("/tools/drawdown"), { name: "Academy", href: "/academy" });
  assert.deepEqual(sectionCrumb("/careers"), { name: "Company", href: "/about" });
  assert.equal(sectionCrumb("/faq"), null);
});
