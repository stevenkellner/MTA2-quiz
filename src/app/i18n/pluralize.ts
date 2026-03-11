export interface PluralForms {
    zero?: string;
    one: string;
    other: string;
}

/**
 * Returns the correct plural form for a given count.
 * Supports `zero`, `one`, and `other` forms.
 *
 * @example
 * pluralize(1, { one: 'question', other: 'questions' }) // 'question'
 * pluralize(0, { zero: 'no questions', one: 'question', other: 'questions' }) // 'no questions'
 */
export function pluralize(count: number, forms: PluralForms): string {
    if (count === 0 && forms.zero !== undefined) return forms.zero;
    return Math.abs(count) === 1 ? forms.one : forms.other;
}
