import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './services/i18n.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
    imports: [RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
    protected readonly i18nService = inject(I18nService);
}
