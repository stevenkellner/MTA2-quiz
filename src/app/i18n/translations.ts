export type Locale = 'de' | 'en';

export interface Translations {
    nav: {
        back: string;
        backToSelection: string;
    };
    errors: {
        quizNotFound: string;
        configError: string;
        questionsError: string;
        loading: string;
    };
    time: {
        min: (min: number, sec: number) => string;
        sec: (seconds: number) => string;
    };
    titles: {
        quizSuffix: string;
        fragenSuffix: string;
        home: string;
    };
    home: {
        title: string;
        subtitle: string;
        selectHeading: string;
        noQuizzes: string;
        questionsLink: string;
    };
    quiz: {
        progress: {
            start: (max: number) => string;
            select: string;
            question: (current: number, total: number, score: number) => string;
        };
        answer: {
            correct: string;
            incorrect: string;
        };
        start: {
            heading: string;
            countLabel: string;
            showAnswer: string;
            manual: { title: string; sub: string };
            browse: { title: string; sub: string };
            altActionsLabel: string;
            btn: string;
            countError: (max: number) => string;
        };
        select: {
            heading: string;
            search: { placeholder: string; label: string };
            all: string;
            none: string;
            info: (selected: number, total: number) => string;
            listLabel: string;
            entryLabel: (num: number, text: string) => string;
            noText: string;
            noResults: string;
            startBtn: string;
            minError: string;
        };
        question: {
            confirm: string;
            finish: string;
            next: string;
            hotkeys: {
                choose: string;
                allExcept: string;
                all: string;
                none: string;
                confirm: string;
                esc: string;
            };
        };
        finished: {
            title: string;
            result: string;
            correct: string;
            time: string;
            wrongHeading: string;
            restart: string;
        };
    };
    fragen: {
        search: { placeholder: string; label: string };
        info: {
            filtered: (visible: number, total: number) => string;
            total: (n: number) => string;
        };
        noResults: string;
    };
}
