import { FormControl } from '@angular/forms';
import { birthdayValidator, rateValidator } from './profile-edit-form.validation';

describe('birthdayValidator testing', () => {
  it('should allow an empty birthday', () => {
    expect(birthdayValidator(new FormControl(''))).toBeNull();
  });

  it('should allow a real date that is not in the future', () => {
    expect(birthdayValidator(new FormControl('1988-07-14'))).toBeNull();
  });

  it('should reject an impossible calendar date', () => {
    expect(birthdayValidator(new FormControl('1988-02-31'))).toEqual({
      birthdayInvalid: true,
    });
  });

  it('should reject a future birthday', () => {
    expect(birthdayValidator(new FormControl('2099-01-01'))).toEqual({
      birthdayFuture: true,
    });
  });
});

describe('rateValidator testing', () => {
  it('should allow an empty rate and zero', () => {
    expect(rateValidator(new FormControl(''))).toBeNull();
    expect(rateValidator(new FormControl('0'))).toBeNull();
  });

  it('should allow an integer rate', () => {
    expect(rateValidator(new FormControl('2500'))).toBeNull();
  });

  it('should reject a fractional or negative rate', () => {
    expect(rateValidator(new FormControl('12.5'))).toEqual({ rateInvalid: true });
    expect(rateValidator(new FormControl('-1'))).toEqual({ rateInvalid: true });
  });

  it('should reject a rate above the backend maximum', () => {
    expect(rateValidator(new FormControl('2147483648'))).toEqual({ rateMax: true });
  });
});
