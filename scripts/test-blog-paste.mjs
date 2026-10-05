// Unit tests for src/lib/blog-paste.ts (what is pasted from Word or Google Docs, as the blog's restricted Markdown)
// and for slugify() in src/lib/blog.ts (the "Generate from the title" button).
// Run: node --test scripts/test-blog-paste.mjs      (Node 22.18 or later: it reads the TypeScript files directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { markdownFromNode, pasteAsMarkdown } from "../src/lib/blog-paste.ts";
import { isBlogSlug, slugify } from "../src/lib/blog.ts";

// The walk reads nodeType, nodeName, childNodes, textContent and getAttribute: plain objects stand in for a parsed document.
const t = (text) => ({ nodeType: 3, nodeName: "#text", childNodes: [], textContent: text });
const comment = (text) => ({ nodeType: 8, nodeName: "#comment", childNodes: [], textContent: text });
function h(name, attrs, ...children) {
  const childNodes = children.map((c) => (typeof c === "string" ? t(c) : c));
  return {
    nodeType: 1,
    nodeName: name.toUpperCase(),
    childNodes,
    get textContent() {
      return childNodes.map((c) => c.textContent ?? "").join("");
    },
    getAttribute: (key) => (attrs && key in attrs ? attrs[key] : null),
  };
}
const body = (...children) => h("body", null, ...children);
const md = (...children) => markdownFromNode(body(...children));

test("headings: the first two levels are sections, the rest are smaller headings, and no mark survives inside one", () => {
  assert.equal(md(h("h1", null, "Title")), "## Title");
  assert.equal(md(h("h2", null, h("b", null, "Bold"), " heading")), "## Bold heading");
  assert.equal(md(h("h3", null, "Three")), "### Three");
  assert.equal(md(h("h5", null, "Five")), "### Five");
  assert.equal(md(h("h2", null, "  ")), "");
});

test("paragraphs are separated by an empty line, and white space is tidied", () => {
  assert.equal(md(h("p", null, "One\n  two"), h("p", null, "Three four")), "One two\n\nThree four");
  assert.equal(md(h("p", null, "A", h("br", null), "B")), "A\nB");
  assert.equal(md("loose words ", h("span", null, "in a span")), "loose words in a span");
});

test("bold and italic, by tag and by style, with the space left outside the mark", () => {
  assert.equal(md(h("p", null, "a ", h("b", null, "bold "), "c")), "a **bold** c");
  assert.equal(md(h("p", null, h("strong", null, "S"), " ", h("em", null, "E"), " ", h("i", null, "I"))), "**S** *E* *I*");
  assert.equal(md(h("p", null, h("span", { style: "font-weight: 700" }, "heavy"), " ", h("span", { style: "font-style:italic" }, "leaning"))), "**heavy** *leaning*");
  // one mark at a time: the renderer does not nest them
  assert.equal(md(h("p", null, h("b", null, h("i", null, "both")))), "**both**");
  assert.equal(md(h("p", null, h("i", null, "x ", h("b", null, "y")))), "*x y*");
  // two bold runs side by side are one
  assert.equal(md(h("p", null, h("b", null, "a"), h("b", null, "b"))), "**ab**");
  assert.equal(md(h("p", null, h("b", null, "  "))), "");
});

test("Google Docs wraps the whole document in a <b> that is not bold", () => {
  const doc = h("b", { style: "font-weight:normal;", id: "docs-internal-guid-1" }, h("h2", null, h("span", null, "Heading")), h("p", null, h("span", { style: "font-weight:400" }, "plain "), h("span", { style: "font-weight:700" }, "bold")));
  assert.equal(md(doc), "## Heading\n\nplain **bold**");
});

test("links: a path on this site or https, anything else is left as its words", () => {
  assert.equal(md(h("p", null, h("a", { href: "https://example.com/a" }, "there"))), "[there](https://example.com/a)");
  assert.equal(md(h("p", null, h("a", { href: "/trading/accounts" }, h("span", { style: "font-weight:700" }, "accounts")))), "[accounts](/trading/accounts)");
  for (const href of ["http://example.com", "javascript:alert(1)", "//evil.example", "mailto:a@b.c", "data:text/html,x", "https://exa mple.com", "https://example.com/a(b)"]) {
    assert.equal(md(h("p", null, h("a", { href }, "words"))), "words", href);
  }
  // a link is never put inside a mark: the renderer would show its brackets
  assert.equal(md(h("p", null, h("b", null, h("a", { href: "https://example.com" }, "x")))), "[x](https://example.com)");
  assert.equal(md(h("p", null, h("a", { href: "https://example.com" }, ""))), "");
});

test("lists: bullets, numbers from 1, and a list inside a list flattened", () => {
  assert.equal(md(h("ul", null, h("li", null, "one"), h("li", null, h("p", null, h("span", null, "two"))))), "- one\n- two");
  assert.equal(md(h("ol", { start: "4" }, h("li", null, "a"), h("li", null, "b"))), "1. a\n2. b");
  assert.equal(md(h("ul", null, h("li", null, "outer", h("ul", null, h("li", null, "inner"))), h("li", null, "last"))), "- outer\n- inner\n- last");
  // a bulleted list straight after a numbered one is its own list
  assert.equal(md(h("ol", null, h("li", null, "a")), h("ul", null, h("li", null, "b"))), "1. a\n\n- b");
});

test("Word's lists are paragraphs with a drawn marker: the marker is dropped, and says which kind of list", () => {
  const bullet = (text) => h("p", { class: "MsoListParagraph", style: "mso-list:l0 level1 lfo1" }, comment("[if !supportLists]"), h("span", { style: "mso-list:Ignore" }, "·", h("span", null, "  ")), comment("[endif]"), text);
  const number = (n, text) => h("p", { class: "MsoListParagraphCxSpFirst", style: "text-indent:-18pt;mso-list:l1 level1 lfo2" }, h("span", null, h("span", { style: "mso-list:Ignore" }, `${n}.`, h("span", null, " "))), text);
  assert.equal(md(bullet("first"), bullet("second")), "- first\n- second");
  assert.equal(md(number(1, "first"), number(2, "second")), "1. first\n2. second");
});

test("quotations, rules and tables", () => {
  assert.equal(md(h("blockquote", null, h("p", null, "said"), h("p", null, "again"))), "> said\n\n> again");
  assert.equal(md(h("p", null, "a"), h("hr", null), h("p", null, "b")), "a\n\n---\n\nb");
  const table = h("table", null, h("tbody", null, h("tr", null, h("th", null, "Pair"), h("th", null, "Spread")), h("tr", null, h("td", null, h("p", null, "EUR/USD")), h("td", null, h("b", null, "0.1"), " | pips")), h("tr", null, h("td", null, "short"))));
  assert.equal(md(table), "| Pair | Spread |\n| --- | --- |\n| EUR/USD | **0.1** \\| pips |\n| short |  |");
  // one column is a frame around words, not a table
  assert.equal(md(h("table", null, h("tr", null, h("td", null, h("p", null, "boxed"))))), "boxed");
});

test("everything else is dropped: no tag, picture, script, style or comment reaches the body", () => {
  const out = md(
    h("style", null, "p{color:red}"),
    h("script", null, "alert(1)"),
    comment("StartFragment"),
    h("p", null, h("img", { src: "https://example.com/x.png", alt: "ALT" }), h("span", { style: "color:#f00;font-size:40pt" }, "kept"), h("span", { style: "display:none" }, "hidden")),
    h("iframe", { src: "https://example.com" }, "frame"),
  );
  assert.equal(out, "kept");
  assert.ok(!/[<>]/.test(out));
});

test("a paste is left to the browser when the HTML says nothing the plain text does not", () => {
  // no DOMParser under Node: nothing is converted, the browser pastes as it always has
  assert.equal(pasteAsMarkdown("<p><b>x</b></p>", "x"), null);
  assert.equal(pasteAsMarkdown("", "x"), null);
  assert.equal(pasteAsMarkdown("   ", "x"), null);
});

test("slugify: a title as an address the database accepts", () => {
  assert.equal(slugify("What moved gold today?"), "what-moved-gold-today");
  assert.equal(slugify("  EUR/USD: the week’s range — and why  "), "eur-usd-the-week-s-range-and-why");
  assert.equal(slugify("Café déjà vu"), "cafe-deja-vu");
  assert.equal(slugify("---"), "");
  const long = slugify("word ".repeat(60));
  assert.ok(long.length <= 96 && !long.endsWith("-") && isBlogSlug(long));
  assert.ok(isBlogSlug(slugify("What moved gold today?")));
  assert.ok(!isBlogSlug(slugify("a")));
});
