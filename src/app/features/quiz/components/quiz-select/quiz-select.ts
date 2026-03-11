import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { QuizStateService } from '../../../../services/quiz-state.service';

@Component({
    selector: 'app-quiz-select',
    templateUrl: './quiz-select.html',
    styleUrl: './quiz-select.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '(document:keydown)': 'onKeydown($event)' },
})
export class QuizSelectComponent implements AfterViewInit {
    protected readonly state = inject(QuizStateService);
    protected readonly searchTerm = signal('');
    protected readonly statusText = signal('');

    private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

    ngAfterViewInit(): void {
        this.searchTerm.set('');
        setTimeout(() => this.searchInputRef()?.nativeElement.focus(), 0);
    }

    protected readonly filteredEntries = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();
        return this.state.allQuestions()
            .map((q, idx) => ({ q, idx }))
            .filter(({ q }) => {
                if (!term) return true;
                if (q.text.toLowerCase().includes(term)) return true;
                return q.answers.some(a => a.text.toLowerCase().includes(term));
            });
    });

    protected readonly infoText = computed(() =>
        `${this.state.selectedIndices().size} von ${this.state.allQuestions().length} Fragen ausgewählt`
    );

    protected isIndexSelected(idx: number): boolean {
        return this.state.selectedIndices().has(idx);
    }

    protected onSearchInput(value: string): void {
        this.searchTerm.set(value);
    }

    attemptStart(): void {
        if (this.state.selectedIndices().size === 0) {
            this.statusText.set('Bitte wähle mindestens eine Frage aus.');
            return;
        }
        this.statusText.set('');
        this.state.startWithSelected();
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
