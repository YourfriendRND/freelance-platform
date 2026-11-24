import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from './user.repository';
import {
  AuthUserPayload,
  UpdateUserRecord,
  UserAuthCredentials,
  UserEntity,
} from '@freelance-platform/shared-types';
import { CreateUserDto, UpdateUserDto } from '@freelance-platform/shared-dto';
import { authConfig } from '@freelance-platform/shared-config';
import { hashPassword } from '../../common/hash-password';
import { ReviewService } from '../review/review.service';
import { SkillService } from '../skill/skill.service';

type FindUserOptions = {
  withSkills?: boolean;
};

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly skillService: SkillService,
    private readonly reviewService: ReviewService,
  ) {}

  async findOne(id: string, { withSkills = false }: FindUserOptions = {}): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Пользователь с "${id}" не найден`);
    }

    if (withSkills) {
      user.skills = await this.skillService.findByUserId(user.id);
    }

    const { rating, reviewsCount } = await this.reviewService.getStats(user.id);
    user.rating = rating;
    user.reviewsCount = reviewsCount;

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`Пользователь с "${email}" не найден`);
    }

    const { rating, reviewsCount } = await this.reviewService.getStats(user.id);
    user.rating = rating;
    user.reviewsCount = reviewsCount;

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

    const user = await this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      role: dto.role,
    });

    const { rating, reviewsCount } = await this.reviewService.getStats(user.id);
    user.rating = rating;
    user.reviewsCount = reviewsCount;

    return user;
  }

  async update(id: string, dto: UpdateUserDto, authUser: AuthUserPayload): Promise<UserEntity> {
    const {
      user: { id: userId, role },
    } = authUser;

    if (userId !== id) {
      throw new ForbiddenException('Изменять профиль может только владелец');
    }

    const { skills: skillNames } = dto;
    const skills =
      skillNames === undefined
        ? undefined
        : await this.skillService.replaceForUser(userId, skillNames, role);
    const patch = this.toUpdateRecord(dto);
    const hasProfilePatch = Object.keys(patch).length > 0;

    if (!hasProfilePatch && skills === undefined) {
      return this.findOne(id);
    }

    const user = hasProfilePatch
      ? await this.userRepository.update(id, patch)
      : await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Пользователь с "${id}" не найден`);
    }

    if (skills !== undefined) {
      user.skills = skills;
    }

    const { rating, reviewsCount } = await this.reviewService.getStats(user.id);
    user.rating = rating;
    user.reviewsCount = reviewsCount;

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
