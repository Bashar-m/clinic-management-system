import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Must be a string' })
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Must be a string' })
  phone!: string;
}
