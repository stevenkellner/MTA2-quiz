import { ResolveFn, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { QuizService } from './services/quiz.service';
import { I18nService } from './services/i18n.service';

const quizTitleResolver: ResolveFn<string> = route => {
    const id = route.paramMap.get('id') ?? '';
    const suffix = inject(I18nService).i18n().titles.quizSuffix;
    return inject(QuizService)
        .loadConfig()
        .pipe(map(configs => {
            const quiz = id ? configs.find(q => q.id === id) : configs[0];
            return quiz ? `${quiz.title}${suffix}` : 'Quiz';
        }));
};

const fragenTitleResolver: ResolveFn<string> = route => {
    const id = route.paramMap.get('id') ?? '';
    const suffix = inject(I18nService).i18n().titles.fragenSuffix;
    return inject(QuizService)
        .loadConfig()
        .pipe(map(configs => {
            const quiz = id ? configs.find(q => q.id === id) : configs[0];
            return quiz ? `${quiz.title}${suffix}` : suffix.trim();
        }));
};

export const routes: Routes = [
    {
        path: '',
        title: () => inject(I18nService).i18n().titles.home,
        loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
    },
    {
        path: 'quiz/:id',
        title: quizTitleResolver,
        loadComponent: () => import('./features/quiz/quiz').then(m => m.QuizComponent),
    },
    {
        path: 'fragen/:id',
        title: fragenTitleResolver,
        loadComponent: () => import('./features/fragen/fragen').then(m => m.FragenComponent),
    },
    {
        path: '**',
        redirectTo: '',
    },
];
