export type Locale = 'de' | 'en';

export interface Translations {

    // ── Navigation ────────────────────────────────────────────────────────────
    // Shared back-navigation labels used in card headers across quiz views.
    nav: {
        // Short "go back one step" label; used in the quiz-select card header.
        // e.g. "Zurück" / "Back"
        back: string;

        // Used in the quiz-start card header and in the error card on the quiz route.
        // e.g. "Zur Auswahl" / "Back to selection"
        backToSelection: string;
    };

    // ── Errors & loading ──────────────────────────────────────────────────────
    // Inline error messages and the initial loading placeholder.
    errors: {
        // Shown when the requested quiz ID is not found in the config.
        // e.g. "Quiz nicht gefunden." / "Quiz not found."
        quizNotFound: string;

        // Shown when the config.json HTTP request fails.
        // e.g. "Konfiguration konnte nicht geladen werden." / "Configuration could not be loaded."
        configError: string;

        // Shown when the questions JSON file for a quiz fails to load.
        // e.g. "Fragen konnten nicht geladen werden." / "Questions could not be loaded."
        questionsError: string;

        // Shown as a placeholder while questions are being fetched.
        // e.g. "Fragen werden geladen…" / "Loading questions…"
        loading: string;
    };

    // ── Time formatting ───────────────────────────────────────────────────────
    // Pure formatting helpers used in the quiz-finished stats card.
    time: {
        // Called when elapsed time is ≥ 60 s; formats minutes and remaining seconds.
        // e.g. min(2, 30) → "2 Min. 30 Sek." / "2 min 30 sec"
        min: (min: number, sec: number) => string;

        // Called when elapsed time is < 60 s; formats only seconds.
        // e.g. sec(45) → "45 Sek." / "45 sec"
        sec: (seconds: number) => string;
    };

    // ── Page / document titles ────────────────────────────────────────────────
    // Strings assembled into the browser-tab <title> via Angular route resolvers.
    titles: {
        // Appended to the quiz's own title on the quiz route.
        // e.g. " Quiz" → "MTA 2 Quiz"
        quizSuffix: string;

        // Appended to the quiz's own title on the fragen route.
        // e.g. " – Fragenübersicht" → "MTA 2 – Fragenübersicht"
        fragenSuffix: string;

        // Document title for the home "/" route.
        // e.g. "Quizze" / "Quizzes"
        home: string;
    };

    // ── Home page ─────────────────────────────────────────────────────────────
    // All strings used on the home route ("/").
    home: {
        // Main <h1> heading.
        // e.g. "Quizze" / "Quizzes"
        title: string;

        // Subtitle below the heading.
        // e.g. "Wähle ein Quiz aus" / "Select a quiz"
        subtitle: string;

        // Heading of the quiz-selection card / aria-label of the quiz list.
        // e.g. "Quiz auswählen" / "Select Quiz"
        selectHeading: string;

        // Shown when the config loaded successfully but contains no quizzes.
        // e.g. "Keine Quizze verfügbar." / "No quizzes available."
        noQuizzes: string;

        // Label of the per-quiz link that navigates to the fragen overview.
        // e.g. "Fragenübersicht" / "Questions"
        questionsLink: string;
    };

    // ── Quiz flow ─────────────────────────────────────────────────────────────
    // All strings used across the four quiz views (start → select → question → finished).
    quiz: {

        // ── Progress bar ──────────────────────────────────────────────────────
        // The subtitle row inside the topbar; changes based on the active view.
        progress: {
            // Displayed on the start view to prompt the user to choose a count.
            // e.g. start(60) → "Anzahl der Fragen wählen (1–60)" / "Choose number of questions (1–60)"
            start: (max: number) => string;

            // Static label shown on the select view.
            // e.g. "Fragen für das Quiz auswählen" / "Select questions for the quiz"
            select: string;

            // Dynamic label shown during the question view.
            // e.g. question(3, 10, 2) → "Frage 3 / 10 | Punkte: 2" / "Question 3 / 10 | Score: 2"
            question: (current: number, total: number, score: number) => string;
        };

        // ── Answer feedback ───────────────────────────────────────────────────
        // Labels shown in the card status badge after the user confirms an answer.
        answer: {
            // Displayed when the selected answers match the correct set exactly.
            // e.g. "Richtig" / "Correct"
            correct: string;

            // Displayed when at least one selected answer is wrong or a correct answer is missed.
            // e.g. "Falsch" / "Incorrect"
            incorrect: string;
        };

        // ── Start view ────────────────────────────────────────────────────────
        // Strings used in the quiz-start card where the user sets options and starts.
        start: {
            // Card <h2> heading.
            // e.g. "Quiz starten" / "Start Quiz"
            heading: string;

            // Label for the numeric count input.
            // e.g. "Wie viele Fragen sollen gestellt werden?" / "How many questions should be asked?"
            countLabel: string;

            // Label for the toggle that controls whether the answer is revealed immediately.
            // e.g. "Korrekte Antwort nach jeder Frage anzeigen" / "Show correct answer after each question"
            showAnswer: string;

            // Alt-action card that navigates to the manual question-select view.
            manual: {
                // Card title.  e.g. "Manuell auswählen" / "Select manually"
                title: string;
                // Card subtitle.  e.g. "Fragen selbst zusammenstellen" / "Compose questions yourself"
                sub: string;
            };

            // Alt-action card that links to the fragen overview page.
            browse: {
                // Card title.  e.g. "Alle Fragen ansehen" / "View all questions"
                title: string;
                // Card subtitle.  e.g. "Fragenübersicht durchsuchen" / "Browse question list"
                sub: string;
            };

            // aria-label for the two alt-action cards container.
            // e.g. "Weitere Optionen" / "More options"
            altActionsLabel: string;

            // Label of the primary start button.
            // e.g. "Starten" / "Start"
            btn: string;

            // Inline validation error shown when the entered count is outside [1, max].
            // e.g. countError(60) → "Bitte gib eine Zahl zwischen 1 und 60 ein."
            countError: (max: number) => string;
        };

        // ── Select view ───────────────────────────────────────────────────────
        // Strings used in the quiz-select card where individual questions are toggled.
        select: {
            // Card <h2> heading.
            // e.g. "Fragen auswählen" / "Select Questions"
            heading: string;

            // Search input inside the select view.
            search: {
                // Input placeholder text.
                // e.g. "Fragen durchsuchen…" / "Search questions…"
                placeholder: string;
                // aria-label of the search input.
                // e.g. "Fragen durchsuchen" / "Search questions"
                label: string;
            };

            // "Select all" toggle button label.
            // e.g. "Alle" / "All"
            all: string;

            // "Deselect all" toggle button label.
            // e.g. "Keine" / "None"
            none: string;

            // Live info text rendered below the toolbar; uses pluralization.
            // e.g. info(3, 60) → "3 von 60 Fragen ausgewählt" / "3 of 60 questions selected"
            info: (selected: number, total: number) => string;

            // aria-label of the scrollable question list container.
            // e.g. "Fragenliste" / "Question list"
            listLabel: string;

            // aria-label template for each individual question entry (screen readers).
            // e.g. entryLabel(1, "Was ist …?") → "Frage 1: Was ist …?" / "Question 1: Was ist …?"
            entryLabel: (num: number, text: string) => string;

            // Fallback displayed when a question object has no text property.
            // e.g. "(Kein Fragetext)" / "(No question text)"
            noText: string;

            // Message shown when the search filter returns zero results.
            // e.g. "Keine Ergebnisse gefunden." / "No results found."
            noResults: string;

            // Label of the primary action button at the bottom of the select view.
            // e.g. "Quiz mit Auswahl starten" / "Start quiz with selection"
            startBtn: string;

            // Inline validation error shown when the user tries to start with zero questions selected.
            // e.g. "Bitte wähle mindestens eine Frage aus." / "Please select at least one question."
            minError: string;
        };

        // ── Question view ─────────────────────────────────────────────────────
        // Strings used in the quiz-question card during active answering.
        question: {
            // Label of the primary action button before the answer is revealed.
            // e.g. "Antwort bestätigen" / "Confirm answer"
            confirm: string;

            // Label of the primary action button when the current question is the last one.
            // e.g. "Quiz beenden" / "Finish quiz"
            finish: string;

            // Label of the primary action button after revealing a non-last question.
            // e.g. "Nächste Frage" / "Next question"
            next: string;

            // ── Hotkey hint row ───────────────────────────────────────────────
            // Short labels displayed in the keyboard-shortcut hint bar below the card.
            hotkeys: {
                // Describes 1–N digit keys for toggling individual answers.
                // e.g. "Antwort wählen" / "Choose answer"
                choose: string;

                // Describes Shift+N for selecting all answers except the Nth.
                // e.g. "Alle außer N" / "All except N"
                allExcept: string;

                // Describes the A key for selecting all answers at once.
                // e.g. "Alle wählen" / "Select all"
                all: string;

                // Describes the N key for deselecting all answers.
                // e.g. "Keine wählen" / "Select none"
                none: string;

                // Describes Enter / Space for confirming the current answer.
                // e.g. "Bestätigen" / "Confirm"
                confirm: string;

                // Describes Escape for aborting back to the start view.
                // e.g. "Zum Start" / "To start"
                esc: string;
            };
        };

        // ── Finished view ─────────────────────────────────────────────────────
        // Strings used in the result card and review section after the quiz ends.
        finished: {
            // <h2> heading of the result card.
            // e.g. "Quiz beendet" / "Quiz finished"
            title: string;

            // Label under the percentage stat tile.
            // e.g. "Ergebnis" / "Result"
            result: string;

            // Label under the correct-count stat tile.
            // e.g. "Richtig" / "Correct"
            correct: string;

            // Label under the elapsed-time stat tile.
            // e.g. "Zeit" / "Time"
            time: string;

            // <h2> heading of the wrong-answers review card (only rendered when score < total).
            // e.g. "Falsche Antworten" / "Wrong answers"
            wrongHeading: string;

            // Label of the restart button at the bottom of the finished view.
            // e.g. "Neu starten" / "Restart"
            restart: string;
        };
    };

    // ── Fragen page ───────────────────────────────────────────────────────────
    // Strings used on the question-browse route ("/fragen/:id").
    fragen: {
        // Search input at the top of the page.
        search: {
            // Input placeholder text.
            // e.g. "Fragen oder Antworten durchsuchen…" / "Search questions or answers…"
            placeholder: string;
            // aria-label of the search input.
            // e.g. "Fragen und Antworten durchsuchen" / "Search questions and answers"
            label: string;
        };

        // Live info text rendered below the search bar.
        info: {
            // Shown while a search term is active; uses pluralization.
            // e.g. filtered(12, 60) → "12 von 60 Fragen angezeigt" / "Showing 12 of 60 questions"
            filtered: (visible: number, total: number) => string;

            // Shown when the search input is empty; uses pluralization.
            // e.g. total(60) → "60 Fragen insgesamt" / "60 questions total"
            total: (n: number) => string;
        };

        // Message shown when the search filter returns zero results.
        // e.g. "Keine Ergebnisse gefunden." / "No results found."
        noResults: string;
    };
}
