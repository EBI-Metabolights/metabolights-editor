import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OntologyComponent } from 'src/app/components/shared/ontology/ontology.component';

@Component({
  selector: 'app-ontology-term-modal',
  standalone: true,
  imports: [OntologyComponent, MatIconModule],
  templateUrl: './ontology-term-modal.component.html',
  styleUrl: './ontology-term-modal.component.css'
})
export class OntologyTermModalComponent {

}
