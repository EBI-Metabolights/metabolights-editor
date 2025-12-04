import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-prompt-refresh',
    imports: [MatIconModule],
    templateUrl: './prompt-refresh.component.html',
    styleUrl: './prompt-refresh.component.css',
    standalone: true
})
export class PromptRefreshComponent {
  @Input("context") context: string;
}
