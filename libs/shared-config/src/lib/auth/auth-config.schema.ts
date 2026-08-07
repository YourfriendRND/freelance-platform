import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthConfigSchema {
  @IsNotEmpty()
  @IsString()
  saltWord!: string;

  @IsNotEmpty()
  @IsString()
  appPrefix!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  sessionLifetimeSeconds!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  refreshAfterSeconds!: number;

  @IsBoolean()
  cookieSecure!: boolean;
}
