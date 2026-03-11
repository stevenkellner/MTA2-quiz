import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
    protected readonly i18n = inject(I18nService).i18n;

    protected readonly quizzes = signal<QuizConfig[]>([]);
    protected readonly error = signal<string | null>(null);
    protected readonly loading = signal(true);

    ngOnInit(): void {
        this.quizService.loadConfig().subscribe({
            next: quizzes => {
                this.quizzes.set(quizzes);
                this.loading.set(false);
            },
            error: (err: unknown) => {
                this.error.set(err instanceof Error ? err.message : this.i18n().errors.configError);
                this.loading.set(false);
            },
        });
    }
}
