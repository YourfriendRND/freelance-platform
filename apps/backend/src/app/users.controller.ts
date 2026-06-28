import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRdo } from '@freelance-platform/shared-rdo';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ description: 'List of users' })
  findAll(): UserRdo[] {
    return this.usersService.findAll();
  }

  @Post()
  @ApiCreatedResponse({ description: 'User created' })
  create(@Body() createUserDto: CreateUserDto): UserRdo {
    return this.usersService.create(createUserDto);
  }
}
