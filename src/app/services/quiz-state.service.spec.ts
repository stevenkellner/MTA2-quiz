import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { QuizStateService } from './quiz-state.service';
import { QuizService } from './quiz.service';
import type { Question, QuizConfig } from '../models/quiz.model';

const mockQuestions: Question[] = [
    {
        text: 'Q1',
        imageUrl: null,
        answers: [
            { text: 'Correct', isCorrect: true },
            { text: 'Wrong', isCorrect: false },
        ],
    },
    {
        text: 'Q2',
        imageUrl: null,
        answers: [
            { text: 'A', isCorrect: false },
            { text: 'B', isCorrect: true },
        ],
    },
    {
        text: 'Q3',
        imageUrl: null,
        answers: [
            { text: 'X', isCorrect: true },
            { text: 'Y', isCorrect: false },
        ],
    },
];

const mockConfig: QuizConfig[] = [{ id: 'q1', title: 'Test Quiz', file: 'test.json', active: true }];

function setup(overrides: {
    quizId?: string;
    config?: QuizConfig[];
    configError?: boolean;
    questionsError?: boolean;
    questions?: Question[];
} = {}): QuizStateService {
    const config = overrides.config ?? mockConfig;
    const questions = overrides.questions ?? mockQuestions;

    TestBed.configureTestingModule({
        providers: [
            QuizStateService,
            {
                provide: ActivatedRoute,
                useValue: { snapshot: { paramMap: { get: () => overrides.quizId ?? 'q1' } } },
            },
            {
                provide: QuizService,
                useValue: {
                    loadConfig: () => (overrides.configError ? throwError(() => new Error('Config error')) : of(config)),
                    loadQuestions: () => (overrides.questionsError ? throwError(() => new Error('Questions error')) : of(questions)),
                    shuffle: <T>(arr: T[]) => [...arr],
                },
            },
        ],
    });
    return TestBed.inject(QuizStateService);
}

describe('QuizStateService', () => {
    afterEach(() => TestBed.resetTestingModule());

    // ── Initial state ────────────────────────────────────────────────────────

    describe('initial state', () => {
        it('loading starts true', () => {
            const s = setup();
            expect(s.loading()).toBe(true);
        });

        it('view starts as "start"', () => {
            const s = setup();
            expect(s.view()).toBe('start');
        });

        it('score starts at 0', () => {
            const s = setup();
            expect(s.score()).toBe(0);
        });

        it('revealed starts false', () => {
            const s = setup();
            expect(s.revealed()).toBe(false);
        });
    });

    // ── init() ───────────────────────────────────────────────────────────────

    describe('init()', () => {
        it('sets loading to false after data loads', () => {
            const s = setup();
            s.init();
            expect(s.loading()).toBe(false);
        });

        it('sets the quiz title', () => {
            const s = setup();
            s.init();
            expect(s.quizTitle()).toBe('Test Quiz Quiz');
        });

        it('populates allQuestions', () => {
            const s = setup();
            s.init();
            expect(s.allQuestions()).toHaveLength(mockQuestions.length);
        });

        it('sets view to "start" after loading', () => {
            const s = setup();
            s.init();
            expect(s.view()).toBe('start');
        });

        it('sets loadError when quiz id is not found', () => {
            const s = setup({ quizId: 'unknown' });
            s.init();
            expect(s.loadError()).toBeTruthy();
            expect(s.loading()).toBe(false);
        });

        it('sets loadError when config loading fails', () => {
            const s = setup({ configError: true });
            s.init();
            expect(s.loadError()).toBe('Config error');
            expect(s.loading()).toBe(false);
        });

        it('sets loadError when questions loading fails', () => {
            const s = setup({ questionsError: true });
            s.init();
            expect(s.loadError()).toBe('Questions error');
            expect(s.loading()).toBe(false);
        });

        it('stores the quizId', () => {
            const s = setup({ quizId: 'q1' });
            s.init();
            expect(s.quizId()).toBe('q1');
        });
    });

    // ── Computed: maxQuestions / defaultCount / progressText ─────────────────

    describe('computed values', () => {
        it('maxQuestions equals the number of loaded questions', () => {
            const s = setup();
            s.init();
            expect(s.maxQuestions()).toBe(mockQuestions.length);
        });

        it('defaultCount equals maxQuestions when no count requested yet', () => {
            const s = setup();
            s.init();
            expect(s.defaultCount()).toBe(mockQuestions.length);
        });

        it('progressText in start view lists the question range', () => {
            const s = setup();
            s.init();
            expect(s.progressText()).toContain('1');
            expect(s.progressText()).toContain(String(mockQuestions.length));
        });

        it('progressText in select view', () => {
            const s = setup();
            s.init();
            s.navigateToSelect();
            expect(s.progressText()).toContain('auswählen');
        });

        it('progressText in question view shows index and score', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            expect(s.progressText()).toContain('Frage 1');
        });

        it('progressText in finished view shows score', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.confirmAnswer();
            s.nextQuestion();
            expect(s.progressText()).toContain('Endergebnis');
        });

        it('isLastQuestion is true when on the last question', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            expect(s.isLastQuestion()).toBe(true);
        });

        it('isLastQuestion is false when not on the last question', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            expect(s.isLastQuestion()).toBe(false);
        });

        it('currentQuestion returns the correct question', () => {
            const s = setup();
            s.init();
            s.startWithCount(mockQuestions.length);
            expect(s.currentQuestion()).toEqual(s.questions()[0]);
        });
    });

    // ── Navigation ───────────────────────────────────────────────────────────

    describe('navigateToSelect()', () => {
        it('changes view to "select"', () => {
            const s = setup();
            s.init();
            s.navigateToSelect();
            expect(s.view()).toBe('select');
        });

        it('initialises selectedIndices with all questions when empty', () => {
            const s = setup();
            s.init();
            s.navigateToSelect();
            expect(s.selectedIndices().size).toBe(mockQuestions.length);
        });

        it('keeps existing selectedIndices when already populated', () => {
            const s = setup();
            s.init();
            s.toggleSelectEntry(0);
            s.navigateToSelect();
            expect(s.selectedIndices().size).toBe(1);
        });
    });

    describe('navigateToStart()', () => {
        it('changes view back to "start"', () => {
            const s = setup();
            s.init();
            s.navigateToSelect();
            s.navigateToStart();
            expect(s.view()).toBe('start');
        });
    });

    // ── Select entry manipulation ────────────────────────────────────────────

    describe('toggleSelectEntry()', () => {
        it('adds an index when not present', () => {
            const s = setup();
            s.init();
            s.toggleSelectEntry(1);
            expect(s.selectedIndices().has(1)).toBe(true);
        });

        it('removes an index when already present', () => {
            const s = setup();
            s.init();
            s.toggleSelectEntry(1);
            s.toggleSelectEntry(1);
            expect(s.selectedIndices().has(1)).toBe(false);
        });
    });

    describe('selectAllQuestions()', () => {
        it('selects all question indices', () => {
            const s = setup();
            s.init();
            s.selectAllQuestions();
            expect(s.selectedIndices().size).toBe(mockQuestions.length);
        });
    });

    describe('deselectAllQuestions()', () => {
        it('clears all selections', () => {
            const s = setup();
            s.init();
            s.selectAllQuestions();
            s.deselectAllQuestions();
            expect(s.selectedIndices().size).toBe(0);
        });
    });

    // ── Starting quiz ────────────────────────────────────────────────────────

    describe('startWithCount()', () => {
        it('changes view to "question"', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            expect(s.view()).toBe('question');
        });

        it('sets selectedAnswers to all-false for the first question', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            expect(s.selectedAnswers().every(v => v === false)).toBe(true);
        });

        it('limits questions to the requested count', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            expect(s.questions()).toHaveLength(2);
        });

        it('remembers the requested count as defaultCount', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            s.navigateToStart();
            expect(s.defaultCount()).toBe(2);
        });
    });

    describe('startWithSelected()', () => {
        it('changes view to "question"', () => {
            const s = setup();
            s.init();
            s.toggleSelectEntry(0);
            s.toggleSelectEntry(2);
            s.startWithSelected();
            expect(s.view()).toBe('question');
        });

        it('uses only the selected questions', () => {
            const s = setup();
            s.init();
            s.toggleSelectEntry(0);
            s.startWithSelected();
            expect(s.questions()).toHaveLength(1);
        });
    });

    // ── Answer interaction ────────────────────────────────────────────────────

    describe('toggleAnswer()', () => {
        it('flips the boolean at the given index', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            expect(s.selectedAnswers()[0]).toBe(false);
            s.toggleAnswer(0);
            expect(s.selectedAnswers()[0]).toBe(true);
            s.toggleAnswer(0);
            expect(s.selectedAnswers()[0]).toBe(false);
        });

        it('does not affect other indices', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(0);
            expect(s.selectedAnswers()[1]).toBe(false);
        });
    });

    describe('selectAllAnswers()', () => {
        it('sets all answers to true', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.selectAllAnswers();
            expect(s.selectedAnswers().every(v => v === true)).toBe(true);
        });
    });

    describe('deselectAllAnswers()', () => {
        it('sets all answers to false', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.selectAllAnswers();
            s.deselectAllAnswers();
            expect(s.selectedAnswers().every(v => v === false)).toBe(true);
        });
    });

    describe('selectAllAnswersExcept()', () => {
        it('selects all answers except the given index', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.selectAllAnswersExcept(0);
            expect(s.selectedAnswers()[0]).toBe(false);
            expect(s.selectedAnswers()[1]).toBe(true);
        });
    });

    // ── confirmAnswer() ──────────────────────────────────────────────────────

    describe('confirmAnswer()', () => {
        it('sets revealed to true', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.confirmAnswer();
            expect(s.revealed()).toBe(true);
        });

        it('increments score on a correct answer', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(0); // correct answer is index 0
            s.confirmAnswer();
            expect(s.score()).toBe(1);
        });

        it('does not increment score on a wrong answer', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(1); // wrong answer
            s.confirmAnswer();
            expect(s.score()).toBe(0);
        });

        it('sets questionStatusMessage to "Richtig" on correct answer', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(0);
            s.confirmAnswer();
            expect(s.questionStatusMessage().kind).toBe('correct');
            expect(s.questionStatusMessage().text).toBe('Richtig');
        });

        it('sets questionStatusMessage to "Falsch" on wrong answer', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(1);
            s.confirmAnswer();
            expect(s.questionStatusMessage().kind).toBe('incorrect');
            expect(s.questionStatusMessage().text).toBe('Falsch');
        });

        it('records wrong answers in wrongAnswers', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(1); // wrong
            s.confirmAnswer();
            expect(s.wrongAnswers()).toHaveLength(1);
        });

        it('does not record correct answers in wrongAnswers', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(0); // correct
            s.confirmAnswer();
            expect(s.wrongAnswers()).toHaveLength(0);
        });

        it('skips reveal and advances when showAnswerAfterGuess is false', () => {
            const s = setup();
            s.init();
            s.setShowAnswerAfterGuess(false);
            s.startWithCount(2);
            s.confirmAnswer();
            // Should have moved to next question without staying in revealed state
            expect(s.currentIndex()).toBe(1);
            expect(s.revealed()).toBe(false);
        });
    });

    // ── nextQuestion() ───────────────────────────────────────────────────────

    describe('nextQuestion()', () => {
        it('advances to the next question', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            s.confirmAnswer();
            s.nextQuestion();
            expect(s.currentIndex()).toBe(1);
        });

        it('resets revealed to false for next question', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            s.confirmAnswer();
            s.nextQuestion();
            expect(s.revealed()).toBe(false);
        });

        it('resets selectedAnswers to all-false for next question', () => {
            const s = setup();
            s.init();
            s.startWithCount(2);
            s.toggleAnswer(0);
            s.confirmAnswer();
            s.nextQuestion();
            expect(s.selectedAnswers().every(v => v === false)).toBe(true);
        });

        it('switches view to "finished" after the last question', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.confirmAnswer();
            s.nextQuestion();
            expect(s.view()).toBe('finished');
        });

        it('sets finishedStatusMessage after finishing', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.toggleAnswer(0); // correct
            s.confirmAnswer();
            s.nextQuestion();
            expect(s.finishedStatusMessage().text).toContain('Quiz beendet');
        });
    });

    // ── restart() ────────────────────────────────────────────────────────────

    describe('restart()', () => {
        it('goes back to "start" when started with count', () => {
            const s = setup();
            s.init();
            s.startWithCount(1);
            s.confirmAnswer();
            s.nextQuestion();
            s.restart();
            expect(s.view()).toBe('start');
        });

        it('goes back to "select" when started with selected questions', () => {
            const s = setup();
            s.init();
            s.toggleSelectEntry(0);
            s.startWithSelected();
            s.confirmAnswer();
            s.nextQuestion();
            s.restart();
            expect(s.view()).toBe('select');
        });
    });
});
