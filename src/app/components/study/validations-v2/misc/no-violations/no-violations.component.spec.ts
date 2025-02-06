import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoViolationsComponent } from './no-violations.component';

describe('NoViolationsComponent', () => {
  let component: NoViolationsComponent;
  let fixture: ComponentFixture<NoViolationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoViolationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should display successful report when success is true', () => {
    component.success = true;
    fixture.detectChanges();

    const successText = fixture.debugElement.query(By.css('.no-violations-card h2')).nativeElement.textContent;
    expect(successText).toContain('MTBLS1234 has passed validation.');
  });

  it('should display validation report unavailable message when success is false and section is false', () => {
    component.success = false;
    component.section = false;
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('.no-violations-card h2')).nativeElement.textContent;
    expect(message).toContain('There is no available validation report for MTBLS1234');
  });

  it('should display section message when section is true and filter is false', () => {
    component.success = false;
    component.section = true;
    component.filter = false;
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('.header-container h2')).nativeElement.textContent;
    expect(message).toContain('There are no violations for this section.');
  });

  it('should display filter message when section is true and filter is true', () => {
    component.success = false;
    component.section = true;
    component.filter = true;
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('.header-container h2')).nativeElement.textContent;
    expect(message).toContain('There are no violations for your selected subsection and violation type filters.');
  });

  it('should show the correct icon when filter is true', () => {
    component.success = false;
    component.section = true;
    component.filter = true;
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('.mat-icon-large')).nativeElement.textContent.trim();
    expect(icon).toBe('info');
  });

  it('should show the check_circle icon when section is true and filter is false', () => {
    component.success = false;
    component.section = true;
    component.filter = false;
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('.mat-icon-large')).nativeElement.textContent.trim();
    expect(icon).toBe('check_circle');
  });

  it('should display contact message when section is false', () => {
    component.success = false;
    component.section = false;
    fixture.detectChanges();

    const content = fixture.debugElement.query(By.css('.no-violations-content')).nativeElement.textContent;
    expect(content).toContain('Use the box above to queue a new validation task with our Validation server.');
  });
});
