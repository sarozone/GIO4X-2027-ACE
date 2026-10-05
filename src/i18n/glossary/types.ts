/**
 * The glossary in another language (docs/I18N.md): for each term's slug, its
 * name and its definition in that language. The slugs are those of
 * src/data/glossary.ts and never change with the language; a slug that is
 * missing here is shown in English and said to be in English. Formulae,
 * examples and relations are not repeated: they are read from the English
 * entry, which the translated one links to.
 */
export type GlossaryWords = Record<string, { term: string; definition: string }>;
