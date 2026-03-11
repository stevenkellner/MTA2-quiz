import { computed, Injectable, signal } from '@angular/core';
import { Locale, translations } from '../i18n';

const STORAGE_KEY = 'locale';

function getInitialLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'de' || stored === 'en') return stored;
    const browser = navigator.language.slice(0, 2).toLowerCase();
    return browser === 'de' ? 'de' : 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
    readonly locale = signal<Locale>(getInitialLocale());
    readonly i18n = computed(() => translations[this.locale()]);

    setLocale(locale: Locale): void {
        this.locale.set(locale);
        localStorage.setItem(STORAGE_KEY, locale);
    }

    toggleLocale(): void {
        this.setLocale(this.locale() === 'de' ? 'en' : 'de');
    }
}
