import { signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuizStartComponent } from './quiz-start';
import { QuizStateService } from '../../../../services/quiz-state.service';

function makeStateMock(overrides: {
    maxQuestions?: number;
    defaultCount?: number;
    quizId?: string;
    showAnswerAfterGuess?: boolean;
} = {}) {
    return {
        maxQuestions: signal(overrides.maxQuestions ?? 10),
        defaultCount: signal(overrides.defaultCount ?? 5),
        quizId: signal(overrides.quizId ?? 'q1'),
        showAnswerAfterGuess: signal(overrides.showAnswerAfterGuess ?? true),
        setShowAnswerAfterGuess: vi.fn(),
        navigateToSelect: vi.fn(),
        startWithCount: vi.fn(),
    };
}

describe('QuizStartComponent', () => {
    async function setup(overrides: Parameters<typeof makeStateMock>[0] = {}): Promise<{
        fixture: ComponentFixture<QuizStartComponent>;
        stateMock: ReturnType<typeof makeStateMock>;
    }> {
        const stateMock = makeStateMock(overrides);
        await TestBed.configureTestingModule({
            imports: [QuizStartComponent],
            providers: [
                provideRouter([]),
                { provide: QuizStateService, useValue: stateMock },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(QuizStartComponent);
        fixture.detectChanges();
        return { fixture, stateMock };
    }

    it('creates successfully', async () => {
        const { fixture } = await setup();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('sets the count input default value to defaultCount', async () => {
        const { fixture } = await setup({ defaultCount: 7 });
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=number]')!;
        expect(Number(input.value)).toBe(7);
    });

    it('sets the input max attribute to maxQuestions', async () => {
        const { fixture } = await setup({ maxQuestions: 15 });
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=number]')!;
        expect(Number(input.max)).toBe(15);
    });

    it('attemptStart calls startWithCount with the default count when unchanged', async () => {
        const { fixture, stateMock } = await setup({ maxQuestions: 10, defaultCount: 5 });
        fixture.componentInstance.attemptStart();
        expect(stateMock.startWithCount).toHaveBeenCalledWith(5);
    });

    it('attemptStart calls startWithCount with the value entered in the input', async () => {
        const { fixture, stateMock } = await setup({ maxQuestions: 10, defaultCount: 5 });
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=number]')!;
        input.value = '3';
        fixture.componentInstance.attemptStart();
        expect(stateMock.startWithCount).toHaveBeenCalledWith(3);
    });

    it('attemptStart shows status text for a count exceeding maxQuestions', async () => {
        const { fixture } = await setup({ maxQuestions: 10 });
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=number]')!;
        input.value = '15';
        fixture.componentInstance.attemptStart();
        fixture.detectChanges();
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.textContent?.trim()).toContain('1 und 10');
    });

    it('attemptStart shows status text for a count below 1', async () => {
        const { fixture } = await setup({ maxQuestions: 10 });
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=number]')!;
        input.value = '0';
        fixture.componentInstance.attemptStart();
        fixture.detectChanges();
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.textContent?.trim()).toContain('1 und 10');
    });

    it('attemptStart shows status text for a non-numeric value', async () => {
        const { fixture } = await setup({ maxQuestions: 10 });
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=number]')!;
        input.value = 'abc';
        fixture.componentInstance.attemptStart();
        fixture.detectChanges();
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.textContent?.trim()).not.toBe('');
    });

    it('does not call startWithCount for an invalid count', async () => {
        const { fixture, stateMock } = await setup({ maxQuestions: 10 });
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=number]')!;
        input.value = '99';
        fixture.componentInstance.attemptStart();
        expect(stateMock.startWithCount).not.toHaveBeenCalled();
    });

    it('clicking the Starten button calls startWithCount', async () => {
        const { fixture, stateMock } = await setup({ maxQuestions: 10, defaultCount: 5 });
        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button[type=button]')!.click();
        expect(stateMock.startWithCount).toHaveBeenCalledWith(5);
    });

    it('clicking "Fragen manuell auswählen" calls navigateToSelect', async () => {
        const { fixture, stateMock } = await setup();
        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.secondary-btn')!.click();
        expect(stateMock.navigateToSelect).toHaveBeenCalledTimes(1);
    });
});
