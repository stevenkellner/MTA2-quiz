import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-quiz-start',
    templateUrl: './quiz-start.html',
    styleUrl: './quiz-start.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    host: { '(keydown)': 'onKeydown($event)' },
})
export class QuizStartComponent {
    readonly maxQuestions = input.required<number>();
    readonly defaultCount = input.required<number>();

    readonly start = output<number>();
    readonly openSelect = output<void>();

    protected readonly statusText = signal('');

    private readonly countInputRef = viewChild<ElementRef<HTMLInputElement>>('countInput');

    protected attemptStart(): void {
        const inputEl = this.countInputRef()?.nativeElement;
        if (!inputEl) return;
        const max = this.maxQuestions();
        const requested = Number.parseInt(inputEl.value, 10);
        if (!Number.isInteger(requested) || requested < 1 || requested > max) {
            this.statusText.set(`Bitte gib eine ganze Zahl zwischen 1 und ${max} ein.`);
            inputEl.focus();
            return;
        }
        this.statusText.set('');
        this.start.emit(requested);
    }

    focus(): void {
        setTimeout(() => this.countInputRef()?.nativeElement.focus(), 0);
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter' || event.repeat) return;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        this.attemptStart();
    }
}
