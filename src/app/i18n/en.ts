import { pluralize } from './pluralize';
import { Translations } from './translations';

export const en: Translations = {
    nav: {
        back: 'Back',
        backToSelection: 'Back to selection',
    },
    errors: {
        quizNotFound: 'Quiz not found.',
        quizNoLocale: 'This quiz is not available in the current language.',
        configError: 'Configuration could not be loaded.',
        questionsError: 'Questions could not be loaded.',
        loading: 'Loading questions…',
    },
    time: {
        min: (min, sec) => `${min} min ${sec} sec`,
        sec: seconds => `${seconds} sec`,
    },
    titles: {
        quizSuffix: ' Quiz',
        fragenSuffix: ' – Questions',
        home: 'Quizzes',
    },
    home: {
        title: 'Quizzes',
        subtitle: 'Select a quiz',
        selectHeading: 'Select Quiz',
        noQuizzes: 'No quizzes available.',
        questionsLink: 'Questions',
    },
    quiz: {
        progress: {
            start: max => `Choose number of questions (1–${max})`,
            select: 'Select questions for the quiz',
            question: (c, t, s) => `Question ${c} / ${t} | Score: ${s}`,
        },
        answer: {
            correct: 'Correct',
            incorrect: 'Incorrect',
        },
        start: {
            heading: 'Start Quiz',
            countLabel: 'How many questions should be asked?',
            showAnswer: 'Show correct answer after each question',
            manual: { title: 'Select manually', sub: 'Compose questions yourself' },
            browse: { title: 'View all questions', sub: 'Browse question list' },
            altActionsLabel: 'More options',
            btn: 'Start',
            countError: max => `Please enter a whole number between 1 and ${max}.`,
        },
        select: {
            heading: 'Select Questions',
            search: { placeholder: 'Search questions…', label: 'Search questions' },
            all: 'All',
            none: 'None',
            info: (selected, total) =>
                `${selected} of ${total} ${pluralize(total, { one: 'question', other: 'questions' })} selected`,
            listLabel: 'Question list',
            entryLabel: (num, text) => `Question ${num}: ${text}`,
            noText: '(No question text)',
            noResults: 'No results found.',
            startBtn: 'Start quiz with selection',
            minError: 'Please select at least one question.',
        },
        question: {
            confirm: 'Confirm answer',
            finish: 'Finish quiz',
            next: 'Next question',
            hotkeys: {
                choose: 'Choose answer',
                allExcept: 'All except N',
                all: 'Select all',
                none: 'Select none',
                confirm: 'Confirm',
                esc: 'To start',
            },
        },
        finished: {
            title: 'Quiz finished',
            result: 'Result',
            correct: 'Correct',
            time: 'Time',
            wrongHeading: 'Wrong answers',
            restart: 'Restart',
        },
    },
    fragen: {
        search: { placeholder: 'Search questions or answers…', label: 'Search questions and answers' },
        info: {
            filtered: (visible, total) =>
                `Showing ${visible} of ${total} ${pluralize(total, { one: 'question', other: 'questions' })}`,
            total: n => `${n} ${pluralize(n, { one: 'question', other: 'questions' })} total`,
        },
        noResults: 'No results found.',
    },
};
