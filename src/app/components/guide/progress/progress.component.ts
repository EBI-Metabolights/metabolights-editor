import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'mtbls-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

	@Input() step: number;
	@Input() study: string;

	constructor(private router: Router) { }

	ngOnInit() {
	}

	redirectTo(component, step, index){
		if(index < this.step){
			if(step){
				this.router.navigate(['/guide/' + step + "/" + component, this.study])	
			}else{
				console.log(this.study)
				this.router.navigate(['/guide/' + component, this.study])
			}
		}
	}

}
