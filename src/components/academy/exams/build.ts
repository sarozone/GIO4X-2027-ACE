import { academyLevels, lessons } from "@/data/academy";
import { quizFor } from "@/data/academy-quiz";

/**
 * The level exams, assembled on the server from what already exists: the
 * Academy's levels, the lessons of each, and each lesson's own three
 * questions. Nothing is written here and nothing is copied: a question that
 * changes in the lesson changes in the exam.
 *
 * An exam asks twelve questions. A level with fewer than twelve available asks
 * all it has, and the page says how many. The pass mark is ten of twelve, kept
 * in the same proportion (rounded up) when a paper is shorter.
 */
export const EXAM_LENGTH = 12;
export const passMark = (asked: number) => Math.ceil((asked * 10) / EXAM_LENGTH);

export type ExamQuestion = {
  /** lesson slug and the question's place in that lesson */
  id: string;
  slug: string;
  lesson: string;
  question: string;
  options: string[];
  answer: number;
  because: string;
};

export type ExamLevel = {
  level: string;
  line: string;
  lessons: { slug: string; title: string }[];
  /** every question the level's lessons have */
  pool: ExamQuestion[];
  /** how many one sitting asks */
  asked: number;
  pass: number;
};

export function examLevels(): ExamLevel[] {
  return academyLevels.flatMap(({ level, line }) => {
    const own = lessons.filter((l) => l.level === level);
    const pool: ExamQuestion[] = own.flatMap((l) =>
      (quizFor(l.slug) ?? []).map((q, i) => ({
        id: `${l.slug}:${i}`,
        slug: l.slug,
        lesson: l.title,
        question: q.question,
        options: [...q.options],
        answer: q.answer,
        because: q.because,
      })),
    );
    // a level with no questions has no exam
    if (pool.length === 0) return [];
    const asked = Math.min(EXAM_LENGTH, pool.length);
    return [{ level, line, lessons: own.map((l) => ({ slug: l.slug, title: l.title })), pool, asked, pass: passMark(asked) }];
  });
}
