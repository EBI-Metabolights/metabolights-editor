import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { ClipboardService } from 'ngx-clipboard';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';
import sampleData from './test-data/mock-table-sample-data.json'
import fileData from './test-data/mock-files.json'
import valData from './test-data/test-validation.json'

import { TableComponent } from './table.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MockUploadComponent } from '../upload/upload.mock.component';
import { MockDownloadComponent } from '../download/download.mock.component';
import { MockOntologyComponent } from '../ontology/ontology.mock.component';
import { DebugElement } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';

import { MatIconModule } from '@angular/material/icon';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let http: HttpClient;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableComponent, MockUploadComponent, MockDownloadComponent, MockOntologyComponent ],
      imports: [
        CommonModule, 
        BrowserModule,
        BrowserAnimationsModule, 
        FormsModule, 
        ReactiveFormsModule, 
        HttpClientModule,
        MatInputModule, 
        MatFormFieldModule, 
        FormsModule, 
        ReactiveFormsModule, 
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSelectModule,
        MatIconModule
      ],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        ClipboardService,
        HttpClient,
        FormBuilder
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.validations = valData;
    component.files = fileData
    component.isReadOnly = false;
    http = TestBed.inject(HttpClient)
    fixture.detectChanges();
  });

  

  /**
   * This first raft of tests is not intended to be comprehensive - the table component is complex and would require many many more use cases to 
   * attain even an acceptable amount of test coverage. These tests are intended to catch any major issues with core functionality. tests for the 
   * fine grained functionality of both the method and display logic can come later.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('loading tests', () => {

    function checkTableExists (): Array<DebugElement> {
      return fixture.debugElement.queryAll(By.css('.tableclass'))
    }

    function getTableRows (): Array<any> {
      console.log(fixture.nativeElement.querySelectorAll('tr'))
      console.log(component.data);
      console.log(component.tableData);
      console.log(component.dataSource)
      return fixture.nativeElement.querySelectorAll('tr')
    }
    

    beforeEach(() => {
      component.tableData = sampleData
      component.data = component.tableData['data']
      component.initialise();
      // the absence of this was why it was not rendering, not sure how it wasnt being set previously
      component.displayedTableColumns = component.data.displayedColumns;
      fixture.detectChanges();
    })
    it('should populate the headers correctly', () => {


     let tableRows = getTableRows();
     let headerRow = tableRows[0];
     expect(checkTableExists()).toBeTruthy();
     
     let index = 0;
     for (let cell of headerRow.cells) {
       // skip the first one as 'Select' is piped to an empty string.
       if (index !== 0) {
        expect(component.displayedTableColumns[index]).toContain(cell.innerText)
       }
        index++;
     }
  
    });

    it('should load the rows correctly', () => {

      fixture.detectChanges();
 
      let tableRows = getTableRows();

      expect(tableRows.length).toEqual(4);

      expect(tableRows[1].cells[1].innerText).toContain(sampleData.data.rows[0]['Protocol REF'])
      expect(tableRows[1].cells[2].innerText).toContain(sampleData.data.rows[0]['Sample Name'])
      expect(tableRows[1].cells[3].innerText).toContain(sampleData.data.rows[0]['Characteristics[Organism]'])
      expect(tableRows[1].cells[4].innerText).toContain(sampleData.data.rows[0]['Characteristics[Organism part]'])
      expect(tableRows[1].cells[5].innerText).toContain(sampleData.data.rows[0]['Characteristics[Variant]'])
      expect(tableRows[1].cells[6].innerText).toContain(sampleData.data.rows[0]['Characteristics[nuclear magnetic resonance]'])
      expect(tableRows[1].cells[7].innerText).toContain(sampleData.data.rows[0]['Factor Value[Dose]'])
      expect(tableRows[1].cells[8].innerText).toContain(sampleData.data.rows[0]['Unit'])

    })
  })

  describe('table cell event tests', () => {

    function getCell (): any {
      return fixture.nativeElement.querySelectorAll('tr')[1].cells[1]
    }

    function getModal (modalClass: string): DebugElement {
      return fixture.debugElement.query(By.css(modalClass))
    }

    beforeEach(() => {
      component.tableData = sampleData
      component.data = component.tableData['data']
      component.initialise();
      fixture.detectChanges()
      component.displayedTableColumns = component.data.displayedColumns;

    });

    it('should capture a copy paste event from first load', () => {

      let cell = getCell();
      cell.addEventListener('paste', (event) => {
        event.preventDefault();
        console.log(event)
        expect(event.type).toBe('paste');
      })
      cell.dispatchEvent(new Event('paste'))


    });
  

  
    xit('should open a modal on a double click in a table cell', () => {
      let cell = getCell();
      cell.dispatchEvent(new Event('dblclick'))

      let modal = getModal('.editModal');
      expect(modal).toBeTruthy();
    });

  })


  xit('should select a cell on a single click in a table cell', () => {

  })

  xit('should make a request to the updateTableState method on the editor service when \'save\' is pressed in the edit modal', () => {

  })



});
