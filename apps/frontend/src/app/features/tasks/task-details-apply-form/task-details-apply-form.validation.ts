import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const TIMELINE_MIN_LENGTH = 2;
const TIMELINE_MAX_LENGTH = 100;

export const timelineValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();

  if (!value.length) {
    return null;
  }

  if (value.length < TIMELINE_MIN_LENGTH) {
    return { minlength: true };
  }

  if (value.length > TIMELINE_MAX_LENGTH) {
    return { maxlength: true };
  }

  return null;
};
