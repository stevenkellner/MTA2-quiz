import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
} from '@angular/core';
import { QuizStateService } from '../../quiz-state.service';
import { QuestionViewComponent } from '../../../../shared/components/question-view/question-view';

@Component({
    selector: 'app-quiz-question',
    templateUrl: './quiz-question.html',
    styleUrl: './quiz-question.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [QuestionViewComponent],
    host: { '(document:keydown)': 'onKeydown($event)' },
})
export class QuizQuestionComponent {
    protected readonly state = inject(QuizStateService);

    protected readonly actionButtonText = computed(() =>
        !this.state.revealed()
            ? 'Antwort bestätigen'
            : this.state.isLastQuestion()
              ? 'Quiz beenden'
              : 'Nächste Frage'
    );

    onAction(): void {
        if (!this.state.revealed()) {
            this.state.confirmAnswer();
        } else {
            this.state.nextQuestion();
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.repeat) return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;

        if (!this.state.revealed()) {
            // Use event.code so digit detection works regardless of Shift (Shift+1 → key='!' but code='Digit1')
            const codeMatch = /^Digit(\d)$/.exec(event.code);
            if (codeMatch) {
                const d = codeMatch[1];
                const digitIdx = d === '0' ? 9 : Number(d) - 1;
                if (digitIdx < this.state.selectedAnswers().length) {
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.state.selectAllAnswersExcept(digitIdx);
                    } else {
                        this.state.toggleAnswer(digitIdx);
                    }
                    return;
                }
            }

            if (!event.shiftKey) {
                if (event.key === 'a' || event.key === 'A') {
                    event.preventDefault();
                    this.state.selectAllAnswers();
                    return;
                }
                if (event.key === 'n' || event.key === 'N') {
                    event.preventDefault();
                    this.state.deselectAllAnswers();
                    return;
                }
            }
        }

        if (event.key === 'Enter' || event.key === ' ') {
            if (event.shiftKey) return;
            const target = event.target as HTMLElement | null;
            if (target?.tagName === 'BUTTON' || target?.tagName === 'A') return;
            event.preventDefault();
            this.onAction();
            return;
        }
    }
}

