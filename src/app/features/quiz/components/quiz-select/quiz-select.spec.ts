import { signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { QuizSelectComponent } from './quiz-select';
import { QuizStateService } from '../../../../services/quiz-state.service';
import type { Question } from '../../../../models/quiz.model';

const mockQuestions: Question[] = [
    { text: 'Angular question', imageUrl: null, answers: [{ text: 'A', isCorrect: true }] },
    { text: 'React question', imageUrl: null, answers: [{ text: 'B', isCorrect: true }] },
    {
        text: 'Vue question',
        imageUrl: null,
        answers: [{ text: 'CompositionAPI', isCorrect: false }, { text: 'OptionsAPI', isCorrect: true }],
    },
];

function makeStateMock(questions: Question[] = mockQuestions, selected: Set<number> = new Set<number>()) {
    return {
        allQuestions: signal(questions),
        selectedIndices: signal(selected),
        toggleSelectEntry: vi.fn(),
        selectAllQuestions: vi.fn(),
        deselectAllQuestions: vi.fn(),
        startWithSelected: vi.fn(),
        navigateToStart: vi.fn(),
    };
}

describe('QuizSelectComponent', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => { vi.runAllTimers(); vi.useRealTimers(); });

    async function setup(
        questions = mockQuestions,
        selected = new Set<number>(),
    ): Promise<{ fixture: ComponentFixture<QuizSelectComponent>; stateMock: ReturnType<typeof makeStateMock> }> {
        const stateMock = makeStateMock(questions, selected);
        await TestBed.configureTestingModule({
            imports: [QuizSelectComponent],
            providers: [{ provide: QuizStateService, useValue: stateMock }],
        }).compileComponents();
        const fixture = TestBed.createComponent(QuizSelectComponent);
        fixture.detectChanges();
        vi.runAllTimers();
        fixture.detectChanges();
        return { fixture, stateMock };
    }

    it('creates successfully', async () => {
        const { fixture } = await setup();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('renders all questions initially', async () => {
        const { fixture } = await setup();
        expect((fixture.nativeElement as HTMLElement).querySelectorAll('.select-entry')).toHaveLength(3);
    });

    it('shows selection count in the info text', async () => {
        const { fixture } = await setup(mockQuestions, new Set([0, 2]));
        const info = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.select-info')!;
        expect(info.textContent).toContain('2 von 3');
    });

    it('filters entries whose question text matches the search term', async () => {
        const { fixture } = await setup();
        const searchInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=search]')!;
        searchInput.value = 'angular';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).querySelectorAll('.select-entry')).toHaveLength(1);
    });

    it('filters entries by answer text as well', async () => {
        const { fixture } = await setup();
        const searchInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=search]')!;
        searchInput.value = 'compositionapi';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).querySelectorAll('.select-entry')).toHaveLength(1);
    });

    it('shows "no results" message when the search term matches nothing', async () => {
        const { fixture } = await setup();
        const searchInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=search]')!;
        searchInput.value = 'zzz_no_match_xyz';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).querySelector('.select-no-results')).not.toBeNull();
    });

    it('shows selected class on selected entries', async () => {
        const { fixture } = await setup(mockQuestions, new Set([1]));
        const entries = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.select-entry');
        expect(entries[0].classList).not.toContain('selected');
        expect(entries[1].classList).toContain('selected');
        expect(entries[2].classList).not.toContain('selected');
    });

    it('clicking an entry calls toggleSelectEntry with its original index', async () => {
        const { fixture, stateMock } = await setup();
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.select-entry')[2].click();
        expect(stateMock.toggleSelectEntry).toHaveBeenCalledWith(2);
    });

    it('clicking "Alle" calls selectAllQuestions', async () => {
        const { fixture, stateMock } = await setup();
        const btns = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.select-btn-group button');
        btns[0].click();
        expect(stateMock.selectAllQuestions).toHaveBeenCalledTimes(1);
    });

    it('clicking "Keine" calls deselectAllQuestions', async () => {
        const { fixture, stateMock } = await setup();
        const btns = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.select-btn-group button');
        btns[1].click();
        expect(stateMock.deselectAllQuestions).toHaveBeenCalledTimes(1);
    });

    it('clicking "Zurück" calls navigateToStart', async () => {
        const { fixture, stateMock } = await setup();
        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.back-btn')!.click();
        expect(stateMock.navigateToStart).toHaveBeenCalledTimes(1);
    });

    it('attemptStart shows error status when no questions are selected', async () => {
        const { fixture } = await setup(mockQuestions, new Set<number>());
        fixture.componentInstance.attemptStart();
        fixture.detectChanges();
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.textContent).toContain('mindestens eine');
    });

    it('attemptStart calls startWithSelected when questions are selected', async () => {
        const { fixture, stateMock } = await setup(mockQuestions, new Set([0, 1]));
        fixture.componentInstance.attemptStart();
        expect(stateMock.startWithSelected).toHaveBeenCalledTimes(1);
    });

    it('start button is disabled when no questions are selected', async () => {
        const { fixture } = await setup(mockQuestions, new Set<number>());
        const startBtn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!;
        expect(startBtn.disabled).toBe(true);
    });

    it('start button is enabled when at least one question is selected', async () => {
        const { fixture } = await setup(mockQuestions, new Set([0]));
        const startBtn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!;
        expect(startBtn.disabled).toBe(false);
    });
});
