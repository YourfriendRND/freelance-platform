import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRdo } from '@freelance-platform/shared-rdo';
import { UserRole } from '@freelance-platform/shared-types';

@Injectable()
export class UsersService {
  private readonly users: UserRdo[] = [
    {
      id: '1',
      email: 'demo@freelance-platform.local',
      role: UserRole.Client,
      createdAt: new Date().toISOString(),
    },
  ];

  findAll(): UserRdo[] {
    return this.users;
  }

  create(createUserDto: CreateUserDto): UserRdo {
    const user: UserRdo = {
      id: String(this.users.length + 1),
      email: createUserDto.email,
      role: UserRole.Client,
      createdAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }
}
