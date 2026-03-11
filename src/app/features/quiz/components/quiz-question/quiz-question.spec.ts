import { signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { QuizQuestionComponent } from './quiz-question';
import { QuizStateService } from '../../../../services/quiz-state.service';
import type { Question, StatusMessage } from '../../../../models/quiz.model';

const mockQuestion: Question = {
    text: 'What is TypeScript?',
    imageUrl: null,
    answers: [
        { text: 'A superset of JavaScript', isCorrect: true },
        { text: 'A CSS preprocessor', isCorrect: false },
    ],
};

const neutralStatus: StatusMessage = { text: '', kind: 'neutral' };
const correctStatus: StatusMessage = { text: 'Richtig', kind: 'correct' };
const incorrectStatus: StatusMessage = { text: 'Falsch', kind: 'incorrect' };

function makeStateMock(overrides: {
    question?: Question;
    selectedAnswers?: boolean[];
    revealed?: boolean;
    isLastQuestion?: boolean;
    statusMessage?: StatusMessage;
} = {}) {
    return {
        currentQuestion: signal(overrides.question ?? mockQuestion),
        selectedAnswers: signal(overrides.selectedAnswers ?? [false, false]),
        revealed: signal(overrides.revealed ?? false),
        isLastQuestion: signal(overrides.isLastQuestion ?? false),
        questionStatusMessage: signal(overrides.statusMessage ?? neutralStatus),
        confirmAnswer: vi.fn(),
        nextQuestion: vi.fn(),
        toggleAnswer: vi.fn(),
        selectAllAnswers: vi.fn(),
        deselectAllAnswers: vi.fn(),
        selectAllAnswersExcept: vi.fn(),
    };
}

describe('QuizQuestionComponent', () => {
    async function setup(overrides: Parameters<typeof makeStateMock>[0] = {}): Promise<{
        fixture: ComponentFixture<QuizQuestionComponent>;
        stateMock: ReturnType<typeof makeStateMock>;
    }> {
        const stateMock = makeStateMock(overrides);
        await TestBed.configureTestingModule({
            imports: [QuizQuestionComponent],
            providers: [{ provide: QuizStateService, useValue: stateMock }],
        }).compileComponents();
        const fixture = TestBed.createComponent(QuizQuestionComponent);
        fixture.detectChanges();
        return { fixture, stateMock };
    }

    it('creates successfully', async () => {
        const { fixture } = await setup();
        expect(fixture.componentInstance).toBeTruthy();
    });

    // action button label

    describe('action button text', () => {
        it('shows "Antwort bestätigen" before reveal', async () => {
            const { fixture } = await setup({ revealed: false });
            const btn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!;
            expect(btn.textContent?.trim()).toBe('Antwort bestätigen');
        });

        it('shows "Nächste Frage" after reveal when not the last question', async () => {
            const { fixture } = await setup({ revealed: true, isLastQuestion: false });
            const btn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!;
            expect(btn.textContent?.trim()).toBe('Nächste Frage');
        });

        it('shows "Quiz beenden" after reveal on the last question', async () => {
            const { fixture } = await setup({ revealed: true, isLastQuestion: true });
            const btn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!;
            expect(btn.textContent?.trim()).toBe('Quiz beenden');
        });
    });

    // onAction()

    describe('onAction()', () => {
        it('calls confirmAnswer before reveal', async () => {
            const { fixture, stateMock } = await setup({ revealed: false });
            fixture.componentInstance.onAction();
            expect(stateMock.confirmAnswer).toHaveBeenCalledTimes(1);
        });

        it('calls nextQuestion after reveal', async () => {
            const { fixture, stateMock } = await setup({ revealed: true });
            fixture.componentInstance.onAction();
            expect(stateMock.nextQuestion).toHaveBeenCalledTimes(1);
        });

        it('does not call confirmAnswer after reveal', async () => {
            const { fixture, stateMock } = await setup({ revealed: true });
            fixture.componentInstance.onAction();
            expect(stateMock.confirmAnswer).not.toHaveBeenCalled();
        });

        it('does not call nextQuestion before reveal', async () => {
            const { fixture, stateMock } = await setup({ revealed: false });
            fixture.componentInstance.onAction();
            expect(stateMock.nextQuestion).not.toHaveBeenCalled();
        });
    });

    // status message display

    it('displays the status message text', async () => {
        const { fixture } = await setup({ statusMessage: correctStatus });
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.textContent?.trim()).toBe('Richtig');
    });

    it('applies the correct CSS class to the correct status', async () => {
        const { fixture } = await setup({ statusMessage: correctStatus });
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.classList).toContain('correct');
    });

    it('applies the incorrect CSS class to the incorrect status', async () => {
        const { fixture } = await setup({ statusMessage: incorrectStatus });
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.classList).toContain('incorrect');
    });

    // button click

    it('clicking the action button calls confirmAnswer before reveal', async () => {
        const { fixture, stateMock } = await setup({ revealed: false });
        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!.click();
        expect(stateMock.confirmAnswer).toHaveBeenCalledTimes(1);
    });

    it('clicking the action button calls nextQuestion after reveal', async () => {
        const { fixture, stateMock } = await setup({ revealed: true });
        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!.click();
        expect(stateMock.nextQuestion).toHaveBeenCalledTimes(1);
    });

    // toggleAnswer passthrough

    it('clicking a checkbox calls state.toggleAnswer with the answer index', async () => {
        const { fixture, stateMock } = await setup({ revealed: false });
        const checkbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=checkbox]')!;
        checkbox.dispatchEvent(new Event('change'));
        expect(stateMock.toggleAnswer).toHaveBeenCalledWith(0);
    });
});
