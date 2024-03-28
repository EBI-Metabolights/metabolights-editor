import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Violation } from '../interfaces/validation-report.interface';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'prototype-table',
  templateUrl: './prototype-table.component.html',
  styleUrls: ['./prototype-table.component.css'],
  animations:  [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class PrototypeTableComponent implements OnInit, AfterViewInit {

  @Input() violations: Violation[];

  @ViewChild(MatSort) sort: MatSort;


  displayedColumns = ["severity", "title", "priority", "sourceFile", "values", "actions"]
  dataSource = null;
  expandedViolation: Violation | null
  constructor() { }

  ngOnInit(): void {
    this.dataSource = this.violations;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort
  }

  getColorClass(value: string): string {
    if (value === 'ERROR') return 'red-background';
    if (value === 'WARNING') return 'yellow-background';
    if (value === 'INFO') return 'blue-background';
    return '';
  }

}
