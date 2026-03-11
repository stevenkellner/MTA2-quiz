import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizConfig } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';
import { I18nService } from '../../services/i18n.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrl: './home.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
})
export class HomeComponent implements OnInit {
    private readonly quizService = inject(QuizService);
    private readonly i18nService = inject(I18nService);
    protected readonly i18n = this.i18nService.i18n;

    private readonly allQuizzes = signal<QuizConfig[]>([]);
    protected readonly quizzes = computed(() => {
        const locale = this.i18nService.locale();
        return this.allQuizzes().filter(q => !!this.quizService.resolveFile(q.files, locale));
    });
    protected readonly error = signal<string | null>(null);
    protected readonly loading = signal(true);

    ngOnInit(): void {
        this.quizService.loadConfig().subscribe({
            next: quizzes => {
                this.allQuizzes.set(quizzes);
                this.loading.set(false);
            },
            error: (err: unknown) => {
                this.error.set(err instanceof Error ? err.message : this.i18n().errors.configError);
                this.loading.set(false);
            },
        });
    }
}
