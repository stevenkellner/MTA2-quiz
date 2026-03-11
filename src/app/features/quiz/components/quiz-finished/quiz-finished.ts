import {
    ChangeDetectionStrategy,
    Component,
    inject,
} from '@angular/core';
import { QuizStateService } from '../../quiz-state.service';
import { QuestionViewComponent } from '../../../../shared/components/question-view/question-view';

@Component({
    selector: 'app-quiz-finished',
    templateUrl: './quiz-finished.html',
    styleUrl: './quiz-finished.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [QuestionViewComponent],
    host: { '(document:keydown)': 'onKeydown($event)' },
})
export class QuizFinishedComponent {
    protected readonly state = inject(QuizStateService);

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const target = event.target as HTMLElement | null;
        if (target?.tagName === 'BUTTON' || target?.tagName === 'A') return;
        event.preventDefault();
        this.state.restart();
    }
}
