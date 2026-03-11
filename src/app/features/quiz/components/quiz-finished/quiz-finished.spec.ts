import { signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { QuizFinishedComponent } from './quiz-finished';
import { QuizStateService } from '../../../../services/quiz-state.service';
import type { StatusMessage, WrongAnswer } from '../../../../models/quiz.model';

const neutralStatus: StatusMessage = { text: 'Quiz beendet. Ergebnis: 100% (2/2)', kind: 'neutral' };

const wrongAnswers: WrongAnswer[] = [
    {
        question: {
            text: 'What is Angular?',
            imageUrl: null,
            answers: [
                { text: 'A framework', isCorrect: true },
                { text: 'A database', isCorrect: false },
            ],
        },
        selected: new Set([1]),
    },
];

function makeStateMock(wrong: WrongAnswer[], statusMessage: StatusMessage) {
    return {
        wrongAnswers: signal(wrong),
        finishedStatusMessage: signal(statusMessage),
        restart: vi.fn(),
    };
}

describe('QuizFinishedComponent', () => {
    async function setup(
        wrong: WrongAnswer[] = [],
        statusMessage: StatusMessage = neutralStatus,
    ): Promise<{ fixture: ComponentFixture<QuizFinishedComponent>; stateMock: ReturnType<typeof makeStateMock> }> {
        const stateMock = makeStateMock(wrong, statusMessage);
        await TestBed.configureTestingModule({
            imports: [QuizFinishedComponent],
            providers: [{ provide: QuizStateService, useValue: stateMock }],
        }).compileComponents();
        const fixture = TestBed.createComponent(QuizFinishedComponent);
        fixture.detectChanges();
        return { fixture, stateMock };
    }

    it('creates successfully', async () => {
        const { fixture } = await setup();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('displays the status message text', async () => {
        const { fixture } = await setup();
        const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status')!;
        expect(status.textContent?.trim()).toBe(neutralStatus.text);
    });

    it('shows the "Falsche Antworten" section when wrongAnswers is non-empty', async () => {
        const { fixture } = await setup(wrongAnswers);
        const section = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.review-card');
        expect(section).not.toBeNull();
    });

    it('hides the "Falsche Antworten" section when wrongAnswers is empty', async () => {
        const { fixture } = await setup([]);
        const section = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.review-card');
        expect(section).toBeNull();
    });

    it('renders one review entry per wrong answer', async () => {
        const twoWrong: WrongAnswer[] = [
            ...wrongAnswers,
            {
                question: {
                    text: 'What is RxJS?',
                    imageUrl: null,
                    answers: [{ text: 'A library', isCorrect: true }],
                },
                selected: new Set([0]),
            },
        ];
        const { fixture } = await setup(twoWrong);
        const entries = (fixture.nativeElement as HTMLElement).querySelectorAll('.review-entry');
        expect(entries).toHaveLength(2);
    });

    it('clicking "Neu starten" calls state.restart()', async () => {
        const { fixture, stateMock } = await setup();
        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[type=button]')!.click();
        expect(stateMock.restart).toHaveBeenCalledTimes(1);
    });
});
