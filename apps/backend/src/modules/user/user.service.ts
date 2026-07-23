import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from './user.repository';
import { UserAuthCredentials, UserEntity } from '@freelance-platform/shared-types';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { authConfig } from '@freelance-platform/shared-config';
import { hashPassword } from '../../common/hash-password';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Пользователь с "${id}" не найден`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new NotFoundException(`Пользователь с "${email}" не найден`);
    }

    return user;
  }

  async findAuthCredentialsById(id: string): Promise<UserAuthCredentials> {
    const credentials = await this.userRepository.findAuthCredentialsById(id);

    if (!credentials) {
      throw new NotFoundException(`Пользователь с "${id}" не найден`);
    }

    return credentials;
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const passwordHash = await hashPassword(dto.password, this.authConfiguration.saltWord);

    return this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      role: dto.role,
    });
  }

}
