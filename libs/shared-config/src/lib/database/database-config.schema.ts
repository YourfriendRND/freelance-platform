import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class DatabaseConfigSchema {
  @IsNotEmpty()
  @IsString()
  host!: string;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsNotEmpty()
  @IsString()
  user!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  database!: string;
}
