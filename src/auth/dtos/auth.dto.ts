import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: 'admin' | 'trainer' | 'advisor';
  };
}
