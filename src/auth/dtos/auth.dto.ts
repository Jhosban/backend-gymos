import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
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
    role?: 'admin' | 'trainer' | 'advisor' | 'user';
  };
}
