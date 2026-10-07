import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserApi } from '@freelance-platform/client-api';
import { API_BASE_URL } from '@freelance-platform/http';
import { mockClientUserResponse } from '@freelance-platform/shared-mock';
import { UserResponse } from '@freelance-platform/shared-types';

describe('UserApi testing', () => {
  let api: UserApi;
  let http: HttpTestingController;

  const user: UserResponse = mockClientUserResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    api = TestBed.inject(UserApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should request a user by id', () => {
    let result: UserResponse | null = null;

    api.findOne(user.id).subscribe((response) => {
      result = response;
    });

    const request = http.expectOne(`/api/users/${user.id}`);

    expect(request.request.method).toBe('GET');

    request.flush(user);

    expect(result).toEqual(user);
  });
});
