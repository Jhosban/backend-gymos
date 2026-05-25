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

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
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
