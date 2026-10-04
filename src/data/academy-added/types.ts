import type { Lesson } from "../academy";

/**
 * A lesson written by hand in this folder. It is a Lesson without the fields
 * that are worked out from it when the Academy loads (src/data/academy-added/
 * index.ts): its place in the order, its table of contents (read from the
 * `h2` headings of the body), its reading time (counted from the words) and
 * the desk byline.
 */
export type AddedLesson = Omit<Lesson, "order" | "toc" | "readMinutes" | "byline">;
