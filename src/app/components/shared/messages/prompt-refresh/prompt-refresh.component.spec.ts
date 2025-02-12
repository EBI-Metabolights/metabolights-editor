import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PromptRefreshComponent } from './prompt-refresh.component';

describe('PromptRefreshComponent', () => {
  let component: PromptRefreshComponent;
  let fixture: ComponentFixture<PromptRefreshComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptRefreshComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PromptRefreshComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default message without context', () => {
    fixture.detectChanges();
    const messageElement = fixture.debugElement.query(By.css('.notification')).nativeElement;
    expect(messageElement.textContent).toContain('If you are not seeing the expected changes to your  section, try refreshing the page.');
  });

  it('should display the provided context in the message', () => {
    component.context = 'protocols';
    fixture.detectChanges();
    const messageElement = fixture.debugElement.query(By.css('.notification')).nativeElement;
    expect(messageElement.textContent).toContain('If you are not seeing the expected changes to your protocols section, try refreshing the page.');
  });

  it('should display the info icon', () => {
    fixture.detectChanges();
    const iconElement = fixture.debugElement.query(By.css('mat-icon')).nativeElement;
    expect(iconElement.textContent).toContain('info');
  });

  it('should apply the correct CSS class to the notification', () => {
    fixture.detectChanges();
    const notificationElement = fixture.debugElement.query(By.css('.notification.is-warning'));
    expect(notificationElement).toBeTruthy();
  });
});
