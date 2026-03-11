import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { QuizConfig, Question } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';
import { QuestionViewComponent } from '../../shared/components/question-view/question-view';
import { I18nService } from '../../services/i18n.service';

@Component({
    selector: 'app-fragen',
    templateUrl: './fragen.html',
    styleUrl: './fragen.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [QuestionViewComponent],
})
export class FragenComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly quizService = inject(QuizService);
    private readonly location = inject(Location);
    private readonly i18nService = inject(I18nService);
    protected readonly i18n = this.i18nService.i18n;

    protected readonly loading = signal(true);
    private readonly localeErrorActive = signal(false);
    private readonly loadErrorText = signal<string | null>(null);
    protected readonly loadError = computed<string | null>(() =>
        this.localeErrorActive() ? this.i18n().errors.quizNoLocale : this.loadErrorText()
    );
    private readonly loadedQuiz = signal<QuizConfig | null>(null);

    private readonly _localeWatcher = effect(() => {
        const quiz = this.loadedQuiz();
        const locale = this.i18nService.locale();
        if (!quiz) return;
        const file = this.quizService.resolveFile(quiz.files, locale);
        if (!file) {
            this.localeErrorActive.set(true);
        } else if (this.localeErrorActive()) {
            this.localeErrorActive.set(false);
            this.reloadQuestions(quiz, file);
        }
    });
    protected readonly pageTitle = computed(() => {
        const quiz = this.loadedQuiz();
        return quiz ? quiz.title + this.i18n().titles.fragenSuffix : '';
    });
    protected readonly allQuestions = signal<Question[]>([]);
    protected readonly searchTerm = signal('');

    protected readonly filteredQuestions = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();
        const questions = this.allQuestions();
        if (!term) return questions;
        return questions.filter(q => {
            if (q.text.toLowerCase().includes(term)) return true;
            return q.answers.some(a => a.text.toLowerCase().includes(term));
        });
    });

    protected readonly searchInfoText = computed(() => {
        const i18n = this.i18n();
        const term = this.searchTerm().trim();
        const total = this.allQuestions().length;
        const visible = this.filteredQuestions().length;
        return term ? i18n.fragen.info.filtered(visible, total) : i18n.fragen.info.total(total);
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id') ?? '';

        this.quizService.loadConfig().subscribe({
            next: configs => {
                const quiz = id ? configs.find(q => q.id === id) : configs[0];
                if (!quiz) {
                    this.loadErrorText.set(this.i18n().errors.quizNotFound);
                    this.loading.set(false);
                    return;
                }

                const file = this.quizService.resolveFile(quiz.files, this.i18nService.locale());
                if (!file) {
                    this.loadedQuiz.set(quiz);
                    this.localeErrorActive.set(true);
                    this.loading.set(false);
                    return;
                }

                this.quizService.loadQuestions(file).subscribe({
                    next: questions => {
                        this.loadedQuiz.set(quiz);
                        this.allQuestions.set(questions);
                        this.loading.set(false);
                    },
                    error: (err: unknown) => {
                        this.loadErrorText.set(err instanceof Error ? err.message : this.i18n().errors.questionsError);
                        this.loading.set(false);
                    },
                });
            },
            error: (err: unknown) => {
                this.loadErrorText.set(err instanceof Error ? err.message : this.i18n().errors.configError);
                this.loading.set(false);
            },
        });
    }

    private reloadQuestions(quiz: QuizConfig, file: string): void {
        this.loading.set(true);
        this.allQuestions.set([]);
        this.quizService.loadQuestions(file).subscribe({
            next: questions => {
                this.allQuestions.set(questions);
                this.loading.set(false);
            },
            error: (err: unknown) => {
                this.loadErrorText.set(err instanceof Error ? err.message : this.i18n().errors.questionsError);
                this.loading.set(false);
            },
        });
    }

    protected onSearchInput(value: string): void {
        this.searchTerm.set(value);
    }

    protected goBack(): void {
        this.location.back();
    }
}
