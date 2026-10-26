import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  isFutureCalendarDate,
  readCalendarDate,
  USER_RATE_MAX,
} from '@freelance-platform/shared-types';

export function requiredTrimmed(control: AbstractControl): ValidationErrors | null {
  const value = typeof control.value === 'string' ? control.value.trim() : '';

  return value ? null : { required: true };
}

export function trimmedLength(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';

    if (!value) {
      return null;
    }

    if (value.length < min) {
      return { minlength: { requiredLength: min, actualLength: value.length } };
    }

    if (value.length > max) {
      return { maxlength: { requiredLength: max, actualLength: value.length } };
    }

    return null;
  };
}

export function maxTrimmedLength(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';

    if (value.length <= max) {
      return null;
    }

    return { maxlength: { requiredLength: max, actualLength: value.length } };
  };
}

export function birthdayValidator(control: AbstractControl): ValidationErrors | null {
  const value = typeof control.value === 'string' ? control.value.trim() : '';

  if (!value) {
    return null;
  }

  const date = readCalendarDate(value);

  if (!date) {
    return { birthdayInvalid: true };
  }

  if (isFutureCalendarDate(date)) {
    return { birthdayFuture: true };
  }

  return null;
}

export function rateValidator(control: AbstractControl): ValidationErrors | null {
  const value = typeof control.value === 'string' ? control.value.trim() : '';

  if (!value) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    return { rateInvalid: true };
  }

  if (Number(value) > USER_RATE_MAX) {
    return { rateMax: true };
  }

  return null;
}
