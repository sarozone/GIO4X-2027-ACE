/**
 * What is pasted from Word or Google Docs, as the blog's restricted Markdown.
 *
 * A word processor puts HTML on the clipboard beside the plain text. The body
 * of a post is never HTML (src/components/blog/BlogBody.tsx shows a tag as
 * typed), so the editor reads that HTML here and writes down, in the marks the
 * renderer understands, the structure a writer would otherwise retype:
 *
 *   headings        ## for a first or second level heading, ### for the rest
 *   bold, italic    **bold**, *italic* (one mark at a time: the renderer does not nest them)
 *   lists           - item, 1. item (a list inside a list is flattened)
 *   links           [words](https://… or /path); any other address is left as its words
 *   quotations      > words
 *   tables          | a | b | with the row of dashes under the first row
 *   rules           ---
 *
 * Everything else is dropped: pictures, colours, fonts, sizes, scripts, styles
 * and comments. The result is plain text and nothing but: no tag ever reaches
 * the body, and what does reach it goes through the same server-side checks as
 * anything typed.
 *
 * The walk reads a tree through four members every DOM node has (nodeType,
 * nodeName, childNodes, textContent, and getAttribute on an element), so it
 * runs on a browser's parsed document and, in the tests, on plain objects.
 * No dependency, and nothing here touches the page.
 */

/** As much of a DOM node as the walk reads. */
export type PasteNode = {
  nodeType: number;
  nodeName: string;
  childNodes: ArrayLike<PasteNode>;
  textContent: string | null;
  getAttribute?: (name: string) => string | null;
};

const ELEMENT = 1;
const TEXT = 3;

/** Never read: not words, or not words a reader was meant to see. */
const SKIP = new Set(["SCRIPT", "STYLE", "HEAD", "TITLE", "META", "LINK", "IMG", "PICTURE", "SVG", "CANVAS", "VIDEO", "AUDIO", "OBJECT", "EMBED", "IFRAME", "NOSCRIPT", "TEMPLATE", "INPUT", "BUTTON", "SELECT", "TEXTAREA", "COL", "COLGROUP", "CAPTION"]);
/** Elements that start a block of their own. */
const BLOCK = new Set(["P", "DIV", "SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER", "ASIDE", "NAV", "FIGURE", "FIGCAPTION", "ADDRESS", "PRE", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "DL", "DT", "DD", "BLOCKQUOTE", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "HR", "BODY", "HTML", "CENTER"]);

/** The same rule BlogBody applies before it makes a link: a path on this site, or https. */
const SAFE_HREF = /^(\/(?!\/)[^\s]*|https:\/\/[^\s]+)$/;

const kids = (node: PasteNode): PasteNode[] => Array.from(node.childNodes ?? []);
const tag = (node: PasteNode): string => (node.nodeType === ELEMENT ? node.nodeName.toUpperCase() : "");
const attr = (node: PasteNode, name: string): string => (node.nodeType === ELEMENT && node.getAttribute ? (node.getAttribute(name) ?? "") : "");
const style = (node: PasteNode): string => attr(node, "style").toLowerCase().replace(/\s+/g, "");

/** Word marks the bullet or number it draws before a list paragraph; it is not part of the words. */
const isListMarker = (node: PasteNode): boolean => style(node).includes("mso-list:ignore");
const isHidden = (node: PasteNode): boolean => /display:none|visibility:hidden|mso-hide:all/.test(style(node));
/** Word does not use <ul>: a list item is a paragraph whose style names the list it belongs to. */
const isWordListItem = (node: PasteNode): boolean => /mso-list:(?!ignore|none)/.test(style(node)) || /msolistparagraph/i.test(attr(node, "class"));

/** Bold by tag or by weight. Google Docs wraps a whole document in <b style="font-weight:normal">: that is not bold. */
function isBold(node: PasteNode): boolean {
  const s = style(node);
  if (/font-weight:(normal|[1-4]00)/.test(s)) return false;
  const name = tag(node);
  return name === "B" || name === "STRONG" || /font-weight:(bold|bolder|[6-9]00)/.test(s);
}

function isItalic(node: PasteNode): boolean {
  const s = style(node);
  if (/font-style:normal/.test(s)) return false;
  const name = tag(node);
  return name === "I" || name === "EM" || /font-style:(italic|oblique)/.test(s);
}

function hasBlock(node: PasteNode): boolean {
  return kids(node).some((child) => child.nodeType === ELEMENT && !SKIP.has(tag(child)) && (BLOCK.has(tag(child)) || hasBlock(child)));
}

/** One line of text: every run of white space (a non-breaking space included) is one space. */
const squeeze = (text: string): string => text.replace(/[\s ]+/g, " ");

/** A mark around words, with any space at either end left outside it. Nothing is marked twice, and a link is never put inside a mark. */
function mark(inner: string, sign: string): string {
  const words = inner.trim();
  if (!words || words.includes("](") || words.includes("*") || words.includes("\n")) return inner;
  const lead = inner.slice(0, inner.length - inner.trimStart().length);
  const tail = inner.slice(inner.trimEnd().length);
  return `${lead}${sign}${words}${sign}${tail}`;
}

type Inline = { plain: boolean; marked: boolean };

/**
 * The words inside a node, with bold, italic and links as marks. `plain`
 * leaves every mark out (a heading, the words of a link); `marked` says an
 * ancestor has already put a mark around these words.
 */
function inline(node: PasteNode, ctx: Inline): string {
  if (node.nodeType === TEXT) return squeeze(node.textContent ?? "");
  if (node.nodeType !== ELEMENT) return "";
  const name = tag(node);
  if (SKIP.has(name) || isHidden(node) || isListMarker(node)) return "";
  if (name === "BR") return "\n";

  if (name === "A" && !ctx.plain) {
    const href = attr(node, "href").trim();
    const words = squeeze(kids(node).map((child) => inline(child, { plain: true, marked: true })).join("")).replace(/\n/g, " ").trim();
    if (!words) return "";
    // the renderer ends a link's words at the first ] and its address at the first ) or space
    if (SAFE_HREF.test(href) && !/[()\s]/.test(href) && !/[[\]]/.test(words)) return `[${words}](${href})`;
    return words;
  }

  const bold = !ctx.plain && !ctx.marked && isBold(node);
  const italic = !ctx.plain && !ctx.marked && !bold && isItalic(node);
  const inner = kids(node)
    .map((child) => inline(child, { plain: ctx.plain, marked: ctx.marked || bold || italic }))
    .join("");
  // a block inside a run of words (a <div> in a <span>): its words, set off by a space
  const text = BLOCK.has(name) ? ` ${inner} ` : inner;
  return bold ? mark(text, "**") : italic ? mark(text, "*") : text;
}

/** A run of words as one tidy line. Two bold runs side by side are one. */
const oneLine = (text: string): string => squeeze(text.replace(/\*\*\*\*/g, "")).trim();

type Piece =
  | { kind: "text"; text: string }
  | { kind: "item"; ordered: boolean; text: string }
  | { kind: "table"; rows: string[][] }
  | { kind: "rule" };

/** Whether Word drew a number or a letter before this list paragraph (rather than a bullet). */
function wordListOrdered(node: PasteNode): boolean {
  const marker = (list: PasteNode[]): string => {
    for (const child of list) {
      if (child.nodeType !== ELEMENT) continue;
      if (isListMarker(child)) return child.textContent ?? "";
      const inside = marker(kids(child));
      if (inside) return inside;
    }
    return "";
  };
  return /^\s*(\d+|[a-z]{1,3})[.)]/i.test(marker(kids(node)));
}

/** The items of a <ul> or <ol>, in order. A list inside an item follows it as further items of the same list. */
function listItems(list: PasteNode, ordered: boolean, out: Piece[]): void {
  for (const child of kids(list)) {
    const name = tag(child);
    if (name === "UL" || name === "OL") {
      listItems(child, ordered, out);
      continue;
    }
    if (name !== "LI") continue;
    const own: string[] = [];
    const nested: PasteNode[] = [];
    const gather = (node: PasteNode) => {
      for (const part of kids(node)) {
        const n = tag(part);
        if (n === "UL" || n === "OL") nested.push(part);
        else if (part.nodeType === ELEMENT && hasBlock(part) && !SKIP.has(n)) gather(part);
        else own.push(inline(part, { plain: false, marked: false }));
      }
    };
    gather(child);
    const text = oneLine(own.join("").replace(/\n/g, " "));
    if (text) out.push({ kind: "item", ordered, text });
    for (const inner of nested) listItems(inner, ordered, out);
  }
}

/** The rows of a table, each a list of cells, without the rows of any table inside it. */
function tableRows(table: PasteNode): { rows: string[][]; cells: PasteNode[] } {
  const rows: string[][] = [];
  const cells: PasteNode[] = [];
  const walk = (node: PasteNode) => {
    for (const child of kids(node)) {
      const name = tag(child);
      if (name === "TR") {
        const row: string[] = [];
        for (const cell of kids(child)) {
          if (tag(cell) !== "TD" && tag(cell) !== "TH") continue;
          cells.push(cell);
          // a cell is one line, and a bar inside it must not be read as the end of the cell
          row.push(oneLine(inline(cell, { plain: false, marked: false }).replace(/\n/g, " ")).replace(/\|/g, "\\|"));
        }
        if (row.length) rows.push(row);
      } else if (name === "THEAD" || name === "TBODY" || name === "TFOOT") walk(child);
    }
  };
  walk(table);
  return { rows, cells };
}

/** Walks the children of a node, gathering runs of words into paragraphs and handing each block to its own rule. */
function blocks(node: PasteNode, out: Piece[]): void {
  let run = "";
  const flush = () => {
    // a line break inside a paragraph stays a line break; the renderer joins the lines
    const text = run
      .split("\n")
      .map(oneLine)
      .filter(Boolean)
      .join("\n");
    if (text) out.push({ kind: "text", text });
    run = "";
  };

  for (const child of kids(node)) {
    if (child.nodeType === TEXT) {
      run += squeeze(child.textContent ?? "");
      continue;
    }
    if (child.nodeType !== ELEMENT) continue;
    const name = tag(child);
    if (SKIP.has(name) || isHidden(child)) continue;

    if (/^H[1-6]$/.test(name)) {
      flush();
      const text = oneLine(inline(child, { plain: true, marked: true }).replace(/\n/g, " "));
      // the post's title is the page's only first-level heading: a pasted one becomes a section heading
      if (text) out.push({ kind: "text", text: `${name === "H1" || name === "H2" ? "##" : "###"} ${text}` });
    } else if (name === "UL" || name === "OL") {
      flush();
      listItems(child, name === "OL", out);
    } else if (name === "HR") {
      flush();
      out.push({ kind: "rule" });
    } else if (name === "TABLE") {
      flush();
      const { rows, cells } = tableRows(child);
      const columns = Math.max(0, ...rows.map((r) => r.length));
      if (columns >= 2 && rows.length >= 1) out.push({ kind: "table", rows: rows.map((r) => Array.from({ length: columns }, (_, c) => r[c] ?? "")) });
      // one column is a frame drawn around words, not a table: its words are read as ordinary blocks
      else for (const cell of cells) blocks(cell, out);
    } else if (name === "BLOCKQUOTE") {
      flush();
      const inner: Piece[] = [];
      blocks(child, inner);
      for (const piece of inner) {
        if (piece.kind === "text" && !/^#{2,3} /.test(piece.text)) out.push({ kind: "text", text: piece.text.split("\n").map((l) => `> ${l}`).join("\n") });
        else out.push(piece);
      }
    } else if (isWordListItem(child) && !hasBlock(child)) {
      flush();
      const text = oneLine(inline(child, { plain: false, marked: false }).replace(/\n/g, " "));
      if (text) out.push({ kind: "item", ordered: wordListOrdered(child), text });
    } else if (BLOCK.has(name) || hasBlock(child)) {
      // a container (or, from Google Docs, a mark wrapped around whole paragraphs): what is inside it is read block by block
      flush();
      blocks(child, out);
    } else if (name === "BR") {
      run += "\n";
    } else {
      run += inline(child, { plain: false, marked: false });
    }
  }
  flush();
}

/** The Markdown for a parsed clipboard document (or any node of one). "" when there are no words in it. */
export function markdownFromNode(root: PasteNode): string {
  const pieces: Piece[] = [];
  blocks(root, pieces);

  const out: string[] = [];
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    if (piece.kind === "text") out.push(piece.text);
    else if (piece.kind === "rule") out.push("---");
    else if (piece.kind === "table") {
      const [head, ...rows] = piece.rows;
      const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
      out.push([line(head), line(head.map(() => "---")), ...rows.map(line)].join("\n"));
    } else {
      // consecutive items of one kind are one list; a numbered list is numbered from 1
      const items: string[] = [];
      const ordered = piece.ordered;
      let next = pieces[i];
      while (next && next.kind === "item" && next.ordered === ordered) {
        items.push(ordered ? `${items.length + 1}. ${next.text}` : `- ${next.text}`);
        next = pieces[++i];
      }
      i--;
      out.push(items.join("\n"));
    }
  }
  return out.join("\n\n").trim();
}

/**
 * The Markdown for the HTML a word processor put on the clipboard. Null when
 * this is not a browser (there is no DOMParser) or the HTML cannot be read.
 * DOMParser builds a document that is never attached to the page: nothing in
 * it runs, and no picture in it is fetched.
 */
export function markdownFromHtml(html: string): string | null {
  if (typeof DOMParser === "undefined") return null;
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body ? markdownFromNode(doc.body as unknown as PasteNode) : null;
  } catch {
    return null;
  }
}

/** The same words, whatever the spacing: used to tell whether the HTML said anything the plain text does not. */
const wordsOnly = (text: string): string => text.replace(/[\s ]+/g, "");

/**
 * What to put in the body for a paste, or null to let the browser paste the
 * plain text as it always has: when there is no HTML on the clipboard, when
 * it cannot be read, or when it carries no formatting the Markdown would keep
 * (so that pasting from a plain-text editor behaves exactly as before).
 */
export function pasteAsMarkdown(html: string, plain: string): string | null {
  if (!html.trim()) return null;
  const markdown = markdownFromHtml(html);
  if (!markdown) return null;
  if (wordsOnly(markdown) === wordsOnly(plain)) return null;
  return markdown;
}
