import { toProfileUpdateRecord } from './profile-edit-form.model';

const filledProfile = {
  firstName: 'Иван',
  lastName: 'Петров',
  bio: 'Ищу исполнителей',
  birthday: '1988-07-14',
  rate: '2500',
};

describe('toProfileUpdateRecord testing', () => {
  it('should trim values and clear empty optional fields', () => {
    expect(
      toProfileUpdateRecord(
        {
          firstName: '  Иван  ',
          lastName: '   ',
          bio: '  ',
          birthday: '',
          rate: '',
        },
        false,
      ),
    ).toEqual({
      firstName: 'Иван',
      lastName: null,
      bio: null,
      birthday: null,
    });
  });

  it('should keep a filled customer profile without a rate', () => {
    expect(toProfileUpdateRecord(filledProfile, false)).toEqual({
      firstName: 'Иван',
      lastName: 'Петров',
      bio: 'Ищу исполнителей',
      birthday: '1988-07-14',
    });
  });

  it('should send a freelancer rate as a number and clear an empty rate', () => {
    expect(toProfileUpdateRecord(filledProfile, true).rate).toBe(2500);
    expect(toProfileUpdateRecord({ ...filledProfile, rate: ' 0 ' }, true).rate).toBe(0);
    expect(toProfileUpdateRecord({ ...filledProfile, rate: '   ' }, true).rate).toBeNull();
  });
});
