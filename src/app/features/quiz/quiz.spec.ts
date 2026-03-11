import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { QuizComponent } from './quiz';
import { QuizStateService } from '../../services/quiz-state.service';
import type { Question, QuizConfig } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';

const mockQuestions: Question[] = [
    {
        text: 'What is Angular?',
        imageUrl: null,
        answers: [
            { text: 'A framework', isCorrect: true },
            { text: 'A database', isCorrect: false },
        ],
    },
    {
        text: 'What is TypeScript?',
        imageUrl: null,
        answers: [
            { text: 'A superset of JS', isCorrect: true },
            { text: 'A CSS preprocessor', isCorrect: false },
        ],
    },
];

const mockConfig: QuizConfig[] = [{ id: 'q1', title: 'Test Quiz', file: 'test.json', active: true }];

describe('QuizComponent', () => {
    let loadConfigImpl: () => Observable<QuizConfig[]>;
    let loadQuestionsImpl: () => Observable<Question[]>;

    beforeEach(async () => {
        vi.useFakeTimers();
        loadConfigImpl = () => of(mockConfig);
        loadQuestionsImpl = () => of(mockQuestions);

        await TestBed.configureTestingModule({
            imports: [QuizComponent],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: { get: () => 'q1' } } },
                },
                {
                    provide: QuizService,
                    useValue: {
                        loadConfig: () => loadConfigImpl(),
                        loadQuestions: () => loadQuestionsImpl(),
                        shuffle: <T>(arr: T[]) => [...arr],
                    },
                },
            ],
        }).compileComponents();
    });

    afterEach(() => {
        vi.runAllTimers();
        vi.useRealTimers();
    });

    function getState(comp: QuizComponent): QuizStateService {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (comp as any).state as QuizStateService;
    }

    it('starts in loading state before detectChanges', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        expect(getState(fixture.componentInstance).loading()).toBe(true);
    });

    it('shows the start view after data loads', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-quiz-start')).not.toBeNull();
    });

    it('sets the quiz title after data loads', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        expect(getState(fixture.componentInstance).quizTitle()).toBe('Test Quiz Quiz');
    });

    it('shows an error when the quiz id is not found', () => {
        loadConfigImpl = () => of([{ id: 'other', title: 'X', file: 'x.json' }]);
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role=alert]')).not.toBeNull();
    });

    it('shows an error when config loading fails', () => {
        loadConfigImpl = () => throwError(() => new Error('Net error'));
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role=alert]')).not.toBeNull();
    });

    it('maxQuestions matches the number of loaded questions', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        expect(getState(fixture.componentInstance).maxQuestions()).toBe(mockQuestions.length);
    });

    it('startWithCount() switches the view to "question"', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        getState(fixture.componentInstance).startWithCount(1);
        fixture.detectChanges();
        vi.runAllTimers();
        expect(getState(fixture.componentInstance).view()).toBe('question');
    });

    it('startWithCount() sets selectedAnswers to all-false for the first question', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.startWithCount(1);
        vi.runAllTimers();
        expect(s.selectedAnswers().every(v => v === false)).toBe(true);
    });

    it('toggleAnswer() flips the selected state of one answer', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.startWithCount(2);
        vi.runAllTimers();
        expect(s.selectedAnswers()[0]).toBe(false);
        s.toggleAnswer(0);
        expect(s.selectedAnswers()[0]).toBe(true);
        s.toggleAnswer(0);
        expect(s.selectedAnswers()[0]).toBe(false);
    });

    it('confirmAnswer() reveals the current answer', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.startWithCount(1);
        vi.runAllTimers();
        expect(s.revealed()).toBe(false);
        s.confirmAnswer();
        expect(s.revealed()).toBe(true);
    });

    it('confirmAnswer() increments score for a correct answer', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.startWithCount(1);
        vi.runAllTimers();
        s.toggleAnswer(0);
        s.confirmAnswer();
        expect(s.score()).toBe(1);
    });

    it('confirmAnswer() does not increment score for a wrong answer', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.startWithCount(1);
        vi.runAllTimers();
        s.toggleAnswer(1);
        s.confirmAnswer();
        expect(s.score()).toBe(0);
    });

    it('nextQuestion() after last question switches view to "finished"', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.startWithCount(1);
        vi.runAllTimers();
        s.confirmAnswer();
        s.nextQuestion();
        vi.runAllTimers();
        expect(s.view()).toBe('finished');
    });

    it('navigateToSelect() switches the view to "select"', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.navigateToSelect();
        vi.runAllTimers();
        expect(s.view()).toBe('select');
    });

    it('navigateToStart() switches the view back to "start"', () => {
        const fixture = TestBed.createComponent(QuizComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        const s = getState(fixture.componentInstance);
        s.navigateToSelect();
        vi.runAllTimers();
        s.navigateToStart();
        vi.runAllTimers();
        expect(s.view()).toBe('start');
    });

    describe('onEscape()', () => {
        it('calls navigateToStart on the state service', () => {
            const fixture = TestBed.createComponent(QuizComponent);
            fixture.detectChanges();
            vi.runAllTimers();
            const s = getState(fixture.componentInstance);
            s.navigateToSelect();
            vi.runAllTimers();
            expect(s.view()).toBe('select');
            // @ts-expect-error Accessing protected method for testing
            fixture.componentInstance.onEscape();
            expect(s.view()).toBe('start');
        });
    });
});
