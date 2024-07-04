import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDescriptorModalComponent } from './delete-descriptor-modal.component';

describe('DeleteDescriptorModalComponent', () => {
  let component: DeleteDescriptorModalComponent;
  let fixture: ComponentFixture<DeleteDescriptorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteDescriptorModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteDescriptorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
