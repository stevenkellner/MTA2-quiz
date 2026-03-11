import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizStateService } from '../../../../services/quiz-state.service';
import { I18nService } from '../../../../services/i18n.service';

@Component({
    selector: 'app-quiz-start',
    templateUrl: './quiz-start.html',
    styleUrl: './quiz-start.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    host: { '(document:keydown)': 'onKeydown($event)' },
})
export class QuizStartComponent implements AfterViewInit {
    protected readonly state = inject(QuizStateService);
    protected readonly i18n = inject(I18nService).i18n;
    protected readonly statusText = signal('');

    private readonly countInputRef = viewChild<ElementRef<HTMLInputElement>>('countInput');

    ngAfterViewInit(): void {
        setTimeout(() => this.countInputRef()?.nativeElement.focus(), 0);
    }

    attemptStart(): void {
        const inputEl = this.countInputRef()?.nativeElement;
        if (!inputEl) return;
        const max = this.state.maxQuestions();
        const requested = Number.parseInt(inputEl.value, 10);
        if (!Number.isInteger(requested) || requested < 1 || requested > max) {
            this.statusText.set(this.i18n().quiz.start.countError(max));
            inputEl.focus();
            return;
        }
        this.statusText.set('');
        this.state.startWithCount(requested);
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const target = event.target as HTMLElement | null;
        if (target?.tagName === 'BUTTON' || target?.tagName === 'A') return;
        event.preventDefault();
        this.attemptStart();
    }
}
