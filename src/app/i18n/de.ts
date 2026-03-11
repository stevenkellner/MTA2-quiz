import { pluralize } from './pluralize';
import { Translations } from './translations';

export const de: Translations = {
    nav: {
        back: 'Zurück',
        backToSelection: 'Zur Auswahl',
    },
    errors: {
        quizNotFound: 'Quiz nicht gefunden.',
        configError: 'Konfiguration konnte nicht geladen werden.',
        questionsError: 'Fragen konnten nicht geladen werden.',
        loading: 'Fragen werden geladen…',
    },
    time: {
        min: (min, sec) => `${min} Min. ${sec} Sek.`,
        sec: seconds => `${seconds} Sek.`,
    },
    titles: {
        quizSuffix: ' Quiz',
        fragenSuffix: ' – Fragenübersicht',
        home: 'Quizze',
    },
    home: {
        title: 'Quizze',
        subtitle: 'Wähle ein Quiz aus',
        selectHeading: 'Quiz auswählen',
        noQuizzes: 'Keine Quizze verfügbar.',
        questionsLink: 'Fragenübersicht',
    },
    quiz: {
        progress: {
            start: max => `Anzahl der Fragen wählen (1–${max})`,
            select: 'Fragen für das Quiz auswählen',
            question: (c, t, s) => `Frage ${c} / ${t} | Punkte: ${s}`,
        },
        answer: {
            correct: 'Richtig',
            incorrect: 'Falsch',
        },
        start: {
            heading: 'Quiz starten',
            countLabel: 'Wie viele Fragen sollen gestellt werden?',
            showAnswer: 'Korrekte Antwort nach jeder Frage anzeigen',
            manual: { title: 'Manuell auswählen', sub: 'Fragen selbst zusammenstellen' },
            browse: { title: 'Alle Fragen ansehen', sub: 'Fragenübersicht durchsuchen' },
            altActionsLabel: 'Weitere Optionen',
            btn: 'Starten',
            countError: max => `Bitte gib eine ganze Zahl zwischen 1 und ${max} ein.`,
        },
        select: {
            heading: 'Fragen auswählen',
            search: { placeholder: 'Fragen durchsuchen…', label: 'Fragen durchsuchen' },
            all: 'Alle',
            none: 'Keine',
            info: (selected, total) =>
                `${selected} von ${total} ${pluralize(total, { one: 'Frage', other: 'Fragen' })} ausgewählt`,
            listLabel: 'Fragenliste',
            entryLabel: (num, text) => `Frage ${num}: ${text}`,
            noText: '(Kein Fragetext)',
            noResults: 'Keine Ergebnisse gefunden.',
            startBtn: 'Quiz mit Auswahl starten',
            minError: 'Bitte wähle mindestens eine Frage aus.',
        },
        question: {
            confirm: 'Antwort bestätigen',
            finish: 'Quiz beenden',
            next: 'Nächste Frage',
            hotkeys: {
                choose: 'Antwort wählen',
                allExcept: 'Alle außer N',
                all: 'Alle wählen',
                none: 'Keine wählen',
                confirm: 'Bestätigen',
                esc: 'Zum Start',
            },
        },
        finished: {
            title: 'Quiz beendet',
            result: 'Ergebnis',
            correct: 'Richtig',
            time: 'Zeit',
            wrongHeading: 'Falsche Antworten',
            restart: 'Neu starten',
        },
    },
    fragen: {
        search: { placeholder: 'Fragen oder Antworten durchsuchen…', label: 'Fragen und Antworten durchsuchen' },
        info: {
            filtered: (visible, total) =>
                `${visible} von ${total} ${pluralize(total, { one: 'Frage', other: 'Fragen' })} angezeigt`,
            total: n => `${n} ${pluralize(n, { one: 'Frage', other: 'Fragen' })} insgesamt`,
        },
        noResults: 'Keine Ergebnisse gefunden.',
    },
};
