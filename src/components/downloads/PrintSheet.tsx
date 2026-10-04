"use client";

/**
 * The two print buttons of the downloads shelf.
 *
 * A sheet is any element marked `data-sheet`. "Print this sheet" hides every
 * other sheet from the printer (with the site's own `no-print` class), names
 * the document after the sheet so that a saved PDF gets a sensible file name,
 * opens the browser's print dialogue and puts everything back afterwards.
 * "Print all" clears anything a cancelled dialogue may have left hidden first.
 * Nothing is generated, uploaded or stored: the browser's own "Save as PDF"
 * makes the file.
 */

const sheets = () => Array.from(document.querySelectorAll<HTMLElement>("[data-sheet]"));

function showAll() {
  for (const el of sheets()) {
    el.classList.remove("no-print");
    el.style.breakAfter = "";
  }
}

export function PrintSheet({ sheet, name }: { sheet: string; name: string }) {
  const print = () => {
    const mine = document.getElementById(sheet);
    if (!mine) return;
    showAll();
    for (const el of sheets()) if (el !== mine) el.classList.add("no-print");
    // on its own, the sheet must not push an empty page out after it
    mine.style.breakAfter = "auto";
    const title = document.title;
    document.title = `GIO4X ${name}`;
    const restore = () => {
      window.removeEventListener("afterprint", restore);
      document.title = title;
      showAll();
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };
  return (
    <button type="button" className="no-print btn btn-ghost btn-sm shrink-0" onClick={print} aria-label={`Print the ${name}, or save it as a PDF`}>
      Print this sheet
    </button>
  );
}

export function PrintAll({ children = "Print all the sheets" }: { children?: string }) {
  return (
    <button
      type="button"
      className="no-print btn btn-primary"
      onClick={() => {
        showAll();
        window.print();
      }}
    >
      {children}
    </button>
  );
}
