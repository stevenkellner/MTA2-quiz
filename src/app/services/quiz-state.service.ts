import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question, QuizConfig, StatusMessage, WrongAnswer } from '../models/quiz.model';
import { QuizService } from './quiz.service';
import { I18nService } from './i18n.service';

export type QuizView = 'start' | 'select' | 'question' | 'finished';

@Injectable()
export class QuizStateService {
    private readonly route = inject(ActivatedRoute);
    private readonly quizService = inject(QuizService);
    private readonly i18nService = inject(I18nService);
    private readonly i18n = this.i18nService.i18n;

    readonly loading = signal(true);
    private readonly localeErrorActive = signal(false);
    private readonly loadErrorText = signal<string | null>(null);
    readonly loadError = computed<string | null>(() =>
        this.localeErrorActive() ? this.i18n().errors.quizNoLocale : this.loadErrorText()
    );
    private readonly loadedQuizConfig = signal<QuizConfig | null>(null);
    private readonly loadedLocale = signal<string | null>(null);
    private readonly loadedQuizTitle = signal('');

    private readonly _localeWatcher = effect(() => {
        const quiz = this.loadedQuizConfig();
        const locale = this.i18nService.locale();
        if (!quiz) return;
        // Skip the initial trigger caused by loadedQuizConfig being set during init();
        // only act when the locale actually changes after the initial load.
        if (locale === untracked(() => this.loadedLocale())) return;
        const file = this.quizService.resolveFile(quiz.files, locale);
        if (!file) {
            this.localeErrorActive.set(true);
            this.view.set('start');
        } else {
            this.localeErrorActive.set(false);
            this.view.set('start');
            this.reloadQuestions(quiz, file);
        }
    });
    readonly quizTitle = computed(() => this.loadedQuizTitle() + this.i18n().titles.quizSuffix);
    readonly quizId = signal('');

    readonly allQuestions = signal<Question[]>([]);
    private readonly quizDefaultCount = signal<number | null>(null);

    readonly view = signal<QuizView>('start');
    readonly questions = signal<Question[]>([]);
    readonly currentIndex = signal(0);
    readonly score = signal(0);
    readonly revealed = signal(false);
    readonly wrongAnswers = signal<WrongAnswer[]>([]);
    private readonly startedFromSelect = signal(false);
    private readonly lastRequestedCount = signal<number | null>(null);
    private readonly quizStartTime = signal<number>(0);

    readonly selectedAnswers = signal<boolean[]>([]);
    readonly selectedIndices = signal<Set<number>>(new Set());

    readonly showAnswerAfterGuess = signal(true);

    readonly questionStatusMessage = signal<StatusMessage>({ text: '', kind: 'neutral' });
    readonly finishedStatusMessage = signal<StatusMessage>({ text: '', kind: 'neutral' });
    readonly finishedStats = signal<{ score: number; total: number; percent: string; timeStr: string } | null>(null);

    readonly maxQuestions = computed(() => this.allQuestions().length);

    readonly defaultCount = computed(() => {
        const last = this.lastRequestedCount();
        const def = this.quizDefaultCount();
        const max = this.maxQuestions();
        const base = last !== null ? last : (def !== null ? def : max);
        return Math.min(base, max);
    });

    readonly isLastQuestion = computed(
        () => this.currentIndex() + 1 >= this.questions().length
    );

    readonly currentQuestion = computed(() => {
        const qs = this.questions();
        const idx = this.currentIndex();
        return qs[idx] ?? null;
    });

    readonly progressText = computed(() => {
        const v = this.view();
        const i18n = this.i18n();
        if (v === 'start') return i18n.quiz.progress.start(this.maxQuestions());
        if (v === 'select') return i18n.quiz.progress.select;
        if (v === 'question') {
            return i18n.quiz.progress.question(this.currentIndex() + 1, this.questions().length, this.score());
        }
        return '';
    });

    init(): void {
        const id = this.route.snapshot.paramMap.get('id') ?? '';
        this.quizId.set(id);

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
                    this.loadedQuizTitle.set(quiz.title);
                    this.loadedLocale.set(this.i18nService.locale());
                    this.loadedQuizConfig.set(quiz);
                    this.localeErrorActive.set(true);
                    this.loading.set(false);
                    return;
                }

                this.loadedQuizTitle.set(quiz.title);
                this.quizDefaultCount.set(
                    typeof quiz.defaultCount === 'number' && quiz.defaultCount > 0 ? quiz.defaultCount : null
                );

                this.quizService.loadQuestions(file).subscribe({
                    next: questions => {
                        this.loadedLocale.set(this.i18nService.locale());
                        this.loadedQuizConfig.set(quiz);
                        this.allQuestions.set(this.quizService.shuffle(questions));
                        this.loading.set(false);
                        this.view.set('start');
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

    // ── Select view ──────────────────────────────────────────────────────────

    navigateToSelect(): void {
        if (this.selectedIndices().size === 0) {
            this.selectedIndices.set(new Set(this.allQuestions().map((_, i) => i)));
        }
        this.view.set('select');
    }

    navigateToStart(): void {
        this.view.set('start');
    }

    toggleSelectEntry(idx: number): void {
        const set = new Set(this.selectedIndices());
        if (set.has(idx)) {
            set.delete(idx);
        } else {
            set.add(idx);
        }
        this.selectedIndices.set(set);
    }

    selectAllQuestions(): void {
        this.selectedIndices.set(new Set(this.allQuestions().map((_, i) => i)));
    }

    deselectAllQuestions(): void {
        this.selectedIndices.set(new Set());
    }

    // ── Starting the quiz ────────────────────────────────────────────────────

    startWithCount(count: number): void {
        this.lastRequestedCount.set(count);
        const subset = this.quizService.shuffle([...this.allQuestions()]).slice(0, count);
        this.beginQuiz(subset, false);
    }

    startWithSelected(): void {
        const subset = this.quizService.shuffle(
            Array.from(this.selectedIndices()).map(i => this.allQuestions()[i])
        );
        this.beginQuiz(subset, true);
    }

    // ── Question interaction ─────────────────────────────────────────────────

    toggleAnswer(answerIdx: number): void {
        this.selectedAnswers.update(arr => arr.map((v, i) => (i === answerIdx ? !v : v)));
    }

    selectAllAnswers(): void {
        this.selectedAnswers.update(arr => arr.map(() => true));
    }

    deselectAllAnswers(): void {
        this.selectedAnswers.update(arr => arr.map(() => false));
    }

    selectAllAnswersExcept(exceptIdx: number): void {
        this.selectedAnswers.update(arr => arr.map((_, i) => i !== exceptIdx));
    }

    setShowAnswerAfterGuess(value: boolean): void {
        this.showAnswerAfterGuess.set(value);
    }

    confirmAnswer(): void {
        this.revealCurrentAnswer();
        if (!this.showAnswerAfterGuess()) {
            // Skip the reveal screen and go straight to next question
            this.goToNextOrFinish();
        }
    }

    nextQuestion(): void {
        this.goToNextOrFinish();
    }

    // ── Finished ─────────────────────────────────────────────────────────────

    restart(): void {
        if (this.startedFromSelect()) {
            this.navigateToSelect();
        } else {
            this.view.set('start');
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private beginQuiz(questionsSubset: Question[], fromSelect: boolean): void {
        this.questions.set(questionsSubset.map(q => ({
            ...q,
            answers: this.quizService.shuffle([...q.answers]),
        })));
        this.wrongAnswers.set([]);
        this.currentIndex.set(0);
        this.score.set(0);
        this.revealed.set(false);
        this.startedFromSelect.set(fromSelect);
        this.quizStartTime.set(Date.now());
        this.questionStatusMessage.set({ text: '', kind: 'neutral' });
        this.selectedAnswers.set(questionsSubset[0]?.answers.map(() => false) ?? []);
        this.view.set('question');
    }

    private revealCurrentAnswer(): void {
        const q = this.currentQuestion();
        if (!q) return;

        const selected = new Set(
            this.selectedAnswers()
                .map((checked, i) => (checked ? i : -1))
                .filter((i): i is number => i >= 0)
        );

        const correct = new Set(
            q.answers
                .map((a, i) => (a.isCorrect ? i : -1))
                .filter((i): i is number => i >= 0)
        );

        let exactMatch = selected.size === correct.size;
        if (exactMatch) {
            for (const idx of selected) {
                if (!correct.has(idx)) { exactMatch = false; break; }
            }
        }

        if (exactMatch) {
            this.score.update(s => s + 1);
        } else {
            this.wrongAnswers.update(wa => [...wa, { question: q, selected }]);
        }

        this.questionStatusMessage.set({
            text: exactMatch ? this.i18n().quiz.answer.correct : this.i18n().quiz.answer.incorrect,
            kind: exactMatch ? 'correct' : 'incorrect',
        });
        this.revealed.set(true);
    }

    private goToNextOrFinish(): void {
        const nextIndex = this.currentIndex() + 1;
        if (nextIndex >= this.questions().length) {
            this.finishQuiz();
        } else {
            const nextQ = this.questions()[nextIndex];
            this.currentIndex.set(nextIndex);
            this.revealed.set(false);
            this.questionStatusMessage.set({ text: '', kind: 'neutral' });
            this.selectedAnswers.set(nextQ.answers.map(() => false));
        }
    }

    private finishQuiz(): void {
        const elapsed = Date.now() - this.quizStartTime();
        const totalSec = Math.round(elapsed / 1000);
        const minutes = Math.floor(totalSec / 60);
        const seconds = totalSec % 60;
        const i18n = this.i18n();
        const timeStr = minutes > 0 ? i18n.time.min(minutes, seconds) : i18n.time.sec(seconds);
        const percent = ((this.score() / this.questions().length) * 100).toFixed(1);
        this.finishedStatusMessage.set({
            text: `Quiz beendet. Ergebnis: ${percent}% (${this.score()} / ${this.questions().length} richtig) – Zeit: ${timeStr}`,
            kind: 'neutral',
        });
        this.finishedStats.set({ score: this.score(), total: this.questions().length, percent, timeStr });
        this.view.set('finished');
    }

    private reloadQuestions(quiz: QuizConfig, file: string): void {
        this.loading.set(true);
        this.quizService.loadQuestions(file).subscribe({
            next: questions => {
                this.loadedLocale.set(this.i18nService.locale());
                this.allQuestions.set(this.quizService.shuffle(questions));
                this.loading.set(false);
            },
            error: (err: unknown) => {
                this.loadErrorText.set(err instanceof Error ? err.message : this.i18n().errors.questionsError);
                this.loading.set(false);
            },
        });
    }
}
