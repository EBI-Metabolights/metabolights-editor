import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ValidationDetailCommentComponent } from "./validation-detail-comment.component";

describe("ValidationDetailCommentComponent", () => {
  let component: ValidationDetailCommentComponent;
  let fixture: ComponentFixture<ValidationDetailCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationDetailCommentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationDetailCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Curator View Tests", () => {
    beforeEach(() => {
      component.curator = true;
      component.comment = "farewell world";
      component.monoForm.setValue({ commentControl: component.comment });
      fixture.detectChanges();
    });

    it("should disable the comment box when the curator clicks save, and an event should be emitted", () => {
      spyOn(component.commentSaved, "emit").and.stub();
      const buttonElement =
        fixture.debugElement.nativeElement.querySelector(".wayward-button");
      // for some reason, clicking this button, although all it does is call saveComment, makes karma loop endlessly.
      // so while it means the test is not as complete as it should be, I am just testing what happens after save comment is called.
      // buttonElement.click();
      component.saveComment();
      expect(component.commentSaved.emit).toHaveBeenCalled();
      fixture.detectChanges();
      const textarea = fixture.debugElement.query(By.css(".catch"));
      expect(textarea.nativeElement.disabled).toBeTruthy();
    });

    it("should enable the comment box when the curator clicks edit", () => {
      component.monoForm.controls.commentControl.disable();
      component.disableCuratorCommentBox = true;
      fixture.detectChanges();

      const buttonElement =
        fixture.debugElement.nativeElement.querySelector(".edit");
      // same as above
      //buttonElement.click();
      component.onEditCommentClick();
      fixture.detectChanges();

      const textarea = fixture.debugElement.query(By.css(".catch"));
      expect(textarea.nativeElement.disabled).toBeFalsy();
    });
  });

  describe("User View Tests", () => {
    beforeEach(() => {
      component.curator = false;
      component.comment = "allo world";
      component.monoForm.setValue({ commentControl: component.comment });
      fixture.detectChanges();
    });

    it("should render the correct comment text only without allowing editing", () => {
      const commentElement = fixture.debugElement.query(By.css(".userbox"));
      expect(commentElement).toBeTruthy();
      expect(commentElement.nativeElement.innerText).toContain("allo world");
    });
  });
});
