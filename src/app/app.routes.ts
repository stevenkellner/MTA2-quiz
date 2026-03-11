import { ResolveFn, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { QuizService } from './services/quiz.service';

const quizTitleResolver: ResolveFn<string> = route => {
    const id = route.paramMap.get('id') ?? '';
    return inject(QuizService)
        .loadConfig()
        .pipe(map(configs => {
            const quiz = id ? configs.find(q => q.id === id) : configs[0];
            return quiz ? `${quiz.title} Quiz` : 'Quiz';
        }));
};

const fragenTitleResolver: ResolveFn<string> = route => {
    const id = route.paramMap.get('id') ?? '';
    return inject(QuizService)
        .loadConfig()
        .pipe(map(configs => {
            const quiz = id ? configs.find(q => q.id === id) : configs[0];
            return quiz ? `${quiz.title} – Fragenübersicht` : 'Fragenübersicht';
        }));
};

export const routes: Routes = [
    {
        path: '',
        title: 'Quizze',
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
