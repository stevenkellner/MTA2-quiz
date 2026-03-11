export { type Locale, type Translations } from './translations';
export { de } from './de';
export { en } from './en';

import { de } from './de';
import { en } from './en';
import { type Locale, type Translations } from './translations';

export const translations: Record<Locale, Translations> = { de, en };
