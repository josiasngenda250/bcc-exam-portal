import type { Question, Language } from './types';

export function scoreAttempt(
  questions: Question[],
  answers: Record<string, number>,
  language: Language,
): number {
  let score = 0;
  for (const question of questions) {
    const optionIndex = answers[String(question.index)];
    if (optionIndex === undefined || optionIndex === null) continue;
    const opts = question.options[language];
    if (!opts || optionIndex >= opts.length) continue;
    const selected = opts[optionIndex];
    if (selected === question.correct[language]) score++;
  }
  return score;
}
