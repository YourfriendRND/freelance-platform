import { ComponentFixture } from '@angular/core/testing';

export function setField(
  fixture: ComponentFixture<unknown>,
  selector: string,
  value: string,
): void {
  const input = (fixture.nativeElement as ParentNode).querySelector(selector) as
    | HTMLInputElement
    | HTMLTextAreaElement;

  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
}
