import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizStateService } from './quiz-state.service';
import { QuizStartComponent } from './components/quiz-start/quiz-start';
import { QuizSelectComponent } from './components/quiz-select/quiz-select';
import { QuizQuestionComponent } from './components/quiz-question/quiz-question';
import { QuizFinishedComponent } from './components/quiz-finished/quiz-finished';

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.html',
    styleUrl: './quiz.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [QuizStateService],
    imports: [RouterLink, QuizStartComponent, QuizSelectComponent, QuizQuestionComponent, QuizFinishedComponent],
})
export class QuizComponent implements OnInit {
    protected readonly state = inject(QuizStateService);

    ngOnInit(): void {
        this.state.init();
    }
}
