import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from './user.repository';
import { AuthUserPayload, UpdateUserRecord, UserAuthCredentials, UserEntity } from '@freelance-platform/shared-types';
import { CreateUserDto, UpdateUserDto } from '@freelance-platform/shared-dto';
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

  async update(id: string, dto: UpdateUserDto, authUser: AuthUserPayload): Promise<UserEntity> {
    const { user: { id: userId } } = authUser;

    if (userId !== id) {
      throw new ForbiddenException('Изменять профиль может только владелец');
    }

    const patch = this.toUpdateRecord(dto);

    if (!Object.keys(patch).length) {
      return this.findOne(id);
    }

    const user = await this.userRepository.update(id, patch);

    if (!user) {
      throw new NotFoundException(`Пользователь с "${id}" не найден`);
    }

    return user;
  }

  private toUpdateRecord(dto: UpdateUserDto): UpdateUserRecord {
    const { firstName, lastName, bio, birthday, rate } = dto;

    return {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(bio !== undefined && { bio }),
      ...(birthday !== undefined && { birthday }),
      ...(rate !== undefined && { rate }),
    };
  }

}
